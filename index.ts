#!/usr/bin/env node

import path from "node:path";
import {fileURLToPath} from "node:url";
import {cp, mkdir, readFile, rename, writeFile} from "node:fs/promises";
import {existsSync} from "node:fs";

import {glob} from "glob";
import color from "picocolors";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import {
  cancel,
  intro,
  isCancel,
  log,
  multiselect,
  note,
  outro,
  select,
  tasks,
  text,
} from "@clack/prompts";

import {PRESETS} from "./presets";

const FRAGMENTS_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "fragments");
const BINARY_EXTENSIONS = /\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|pdf|zip)$/i;

type Category = "framework" | "linter" | "formatter" | "extra";

const CATEGORY_ORDER: Category[] = ["framework", "linter", "formatter", "extra"];

interface FragmentManifest {
  id: string;
  name: string;
  category: Category;
  requires?: string[];
  conflicts?: string[];
  package?: {
    type?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  vscode?: {settings?: Record<string, unknown>; extensions?: string[]};
  docFile?: string;
}

interface Fragment extends FragmentManifest {
  dir: string;
}

interface PackageAccumulator {
  type?: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

interface VscodeAccumulator {
  settings: Record<string, unknown>;
  extensions: Set<string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function ensure<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}

function die(message: string): never {
  cancel(message);
  process.exit(1);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(source)) {
    const current = target[key];

    if (isObject(value) && isObject(current)) {
      deepMerge(current, value);
    } else {
      target[key] = value;
    }
  }
}

function sortObject<T extends Record<string, string>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))) as T;
}

// ─── Fragments ────────────────────────────────────────────────────────────

async function loadFragments(): Promise<Fragment[]> {
  const manifestPaths = await glob("**/fragment.json", {cwd: FRAGMENTS_ROOT, absolute: true});
  const fragments: Fragment[] = [];

  for (const p of manifestPaths) {
    const manifest = JSON.parse(await readFile(p, "utf8")) as FragmentManifest;

    fragments.push({...manifest, dir: path.dirname(p)});
  }

  return fragments;
}

// A fragment is compatible if its backward `requires` are already selected and
// none of its `conflicts` are. Forward `requires` (e.g. linter → formatter)
// are auto-pulled later, so we don't enforce them here.
function isCompatible(
  fragment: Fragment,
  selected: Set<string>,
  byId: Map<string, Fragment>,
): boolean {
  const cat = CATEGORY_ORDER.indexOf(fragment.category);

  for (const req of fragment.requires ?? []) {
    const reqFrag = byId.get(req);

    if (!reqFrag) continue;
    if (CATEGORY_ORDER.indexOf(reqFrag.category) < cat && !selected.has(req)) return false;
  }
  for (const conf of fragment.conflicts ?? []) {
    if (selected.has(conf)) return false;
  }

  return true;
}

function validateSelection(fragments: Fragment[]): string | null {
  const seen = new Set<Category>();

  for (const f of fragments) {
    if (f.category === "extra") continue;
    if (seen.has(f.category)) return `Only one ${f.category} fragment is allowed.`;
    seen.add(f.category);
  }

  const ids = new Set(fragments.map((f) => f.id));

  for (const f of fragments) {
    for (const req of f.requires ?? []) {
      if (!ids.has(req)) return `"${f.id}" requires "${req}", which is not selected.`;
    }
    for (const conf of f.conflicts ?? []) {
      if (ids.has(conf)) return `"${f.id}" conflicts with "${conf}".`;
    }
  }

  return null;
}

// ─── Apply ────────────────────────────────────────────────────────────────

async function applyFragment(
  fragment: Fragment,
  destination: string,
  pkg: PackageAccumulator,
  vs: VscodeAccumulator,
): Promise<void> {
  const filesDir = path.join(fragment.dir, "files");

  if (existsSync(filesDir)) {
    await cp(filesDir, destination, {recursive: true, force: true});
  }

  if (fragment.docFile) {
    const docPath = path.join(fragment.dir, fragment.docFile);

    if (existsSync(docPath)) await cp(docPath, path.join(destination, fragment.docFile));
  }

  if (fragment.package) {
    if (fragment.package.type) pkg.type = fragment.package.type;
    Object.assign(pkg.scripts, fragment.package.scripts ?? {});
    Object.assign(pkg.dependencies, fragment.package.dependencies ?? {});
    Object.assign(pkg.devDependencies, fragment.package.devDependencies ?? {});
  }

  if (fragment.vscode?.settings) deepMerge(vs.settings, fragment.vscode.settings);
  for (const ext of fragment.vscode?.extensions ?? []) vs.extensions.add(ext);
}

async function writePackageJson(
  pkg: PackageAccumulator,
  destination: string,
  projectName: string,
): Promise<void> {
  const out: Record<string, unknown> = {name: projectName, version: "0.1.0", private: true};

  if (pkg.type) out.type = pkg.type;
  out.scripts = sortObject(pkg.scripts);
  if (Object.keys(pkg.dependencies).length > 0) out.dependencies = sortObject(pkg.dependencies);
  if (Object.keys(pkg.devDependencies).length > 0) {
    out.devDependencies = sortObject(pkg.devDependencies);
  }

  await writeFile(path.join(destination, "package.json"), `${JSON.stringify(out, null, 2)}\n`);
}

async function writeVscode(vs: VscodeAccumulator, destination: string): Promise<void> {
  const hasSettings = Object.keys(vs.settings).length > 0;
  const hasExtensions = vs.extensions.size > 0;

  if (!hasSettings && !hasExtensions) return;

  const dir = path.join(destination, ".vscode");

  await mkdir(dir, {recursive: true});

  if (hasSettings) {
    await writeFile(path.join(dir, "settings.json"), `${JSON.stringify(vs.settings, null, 2)}\n`);
  }

  if (hasExtensions) {
    const payload = {recommendations: [...vs.extensions].sort()};

    await writeFile(path.join(dir, "extensions.json"), `${JSON.stringify(payload, null, 2)}\n`);
  }
}

// `%%` prefix lets dotfiles survive npm packaging; strip it on write.
async function renameEscapedDotfiles(destination: string): Promise<void> {
  const files = await glob("**/*", {nodir: true, cwd: destination, absolute: true, dot: true});

  for (const file of files) {
    const basename = path.basename(file);

    if (basename.startsWith("%%")) {
      await rename(file, path.join(path.dirname(file), basename.slice(2)));
    }
  }
}

async function replaceNameTokens(destination: string, projectName: string): Promise<void> {
  const files = await glob("**/*", {nodir: true, cwd: destination, absolute: true, dot: true});

  for (const file of files) {
    if (BINARY_EXTENSIONS.test(file)) continue;
    const data = await readFile(file, "utf8");

    if (data.includes("{{name}}")) {
      await writeFile(file, data.replace(/{{name}}/g, projectName));
    }
  }
}

// ─── Prompts ──────────────────────────────────────────────────────────────

function validateProjectName(value: string, cwd: string): string | undefined {
  if (!value) return "Project name is required";
  if (/[^a-zA-Z0-9-_]/.test(value)) {
    return "Project name can only contain letters, numbers, dashes and underscores";
  }
  if (existsSync(path.join(cwd, value))) return `Directory "${value}" already exists`;
}

async function pickInteractive(fragments: Fragment[]): Promise<string[]> {
  const byId = new Map(fragments.map((f) => [f.id, f]));
  const selected = new Set<string>();

  for (const cat of CATEGORY_ORDER) {
    if (cat === "extra") continue;
    // Skip categories already filled by an earlier auto-pull.
    if ([...selected].some((id) => byId.get(id)?.category === cat)) continue;

    const compatibles = fragments.filter(
      (f) => f.category === cat && isCompatible(f, selected, byId),
    );

    if (compatibles.length === 0) continue;

    let chosen: Fragment;

    if (compatibles.length === 1) {
      chosen = compatibles[0];
      log.step(`${cat}: ${color.cyan(chosen.name)} ${color.dim("(only option)")}`);
    } else {
      const id = ensure(
        await select({
          message: cat === "linter" ? "Pick a linter + formatter:" : `Pick a ${cat}:`,
          options: compatibles.map((f) => ({value: f.id, label: f.name})),
        }),
      );

      chosen = compatibles.find((f) => f.id === id)!;
    }

    selected.add(chosen.id);

    // Auto-pull forward requires (e.g. linter → formatter).
    for (const req of chosen.requires ?? []) {
      const reqFrag = byId.get(req);

      if (!reqFrag || selected.has(req)) continue;
      if (CATEGORY_ORDER.indexOf(reqFrag.category) > CATEGORY_ORDER.indexOf(cat)) {
        selected.add(req);
      }
    }
  }

  return [...selected];
}

async function resolveProjectName(argName: string | undefined, cwd: string): Promise<string> {
  if (argName) {
    const err = validateProjectName(argName, cwd);

    if (err) die(err);
    log.step(`Project name: ${color.cyan(argName)}`);

    return argName;
  }

  const result = ensure(
    await text({
      message: "What is the name of your project?",
      placeholder: "appncy-project",
      defaultValue: "appncy-project",
      validate: (v) => validateProjectName(v || "appncy-project", cwd),
    }),
  );

  return result || "appncy-project";
}

async function resolveBaseFragmentIds(
  template: string | undefined,
  fragments: Fragment[],
): Promise<string[]> {
  if (template) {
    const preset = PRESETS.find((p) => p.id === template);

    if (!preset) {
      die(`Preset "${template}" not found. Available: ${PRESETS.map((p) => p.id).join(", ")}`);
    }
    log.step(`Preset: ${color.cyan(preset.title)}`);

    return [...preset.fragments];
  }

  return pickInteractive(fragments);
}

async function resolveExtras(
  argExtras: string | undefined,
  compatibleExtras: Fragment[],
): Promise<string[]> {
  if (argExtras !== undefined) {
    if (argExtras === "none" || argExtras === "") return [];
    const wanted = argExtras
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const valid = new Set(compatibleExtras.map((f) => f.id));
    const unknown = wanted.filter((id) => !valid.has(id));

    if (unknown.length > 0) {
      die(
        `Unknown or incompatible extra(s): ${unknown.join(", ")}. ` +
          `Valid: ${[...valid].join(", ") || "(none)"}`,
      );
    }

    return wanted;
  }

  if (compatibleExtras.length === 0) return [];

  return ensure(
    await multiselect<string>({
      message: "Pick extras to include (optional):",
      options: compatibleExtras.map((f) => ({value: f.id, label: f.name})),
      required: false,
    }),
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const args = await yargs(hideBin(process.argv))
    .options({
      name: {alias: "n", type: "string", description: "Name of the project"},
      template: {alias: "t", type: "string", description: "Preset id to use"},
      extras: {
        alias: "e",
        type: "string",
        description: "Comma-separated extras (use 'none' to skip the prompt)",
      },
    })
    .help()
    .parse();

  intro(color.cyan(color.bold(" create-appncy ")));

  const fragments = await loadFragments();
  const byId = new Map(fragments.map((f) => [f.id, f]));

  const projectName = await resolveProjectName(args.name, process.cwd());
  const baseIds = await resolveBaseFragmentIds(args.template, fragments);

  const baseSet = new Set(baseIds);
  const compatibleExtras = fragments.filter(
    (f) => f.category === "extra" && isCompatible(f, baseSet, byId),
  );
  const extraIds = await resolveExtras(args.extras, compatibleExtras);

  const finalIds = new Set([...baseIds, ...extraIds]);
  const finalFragments = fragments
    .filter((f) => finalIds.has(f.id))
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));

  const validationError = validateSelection(finalFragments);

  if (validationError) die(validationError);

  const destination = path.join(process.cwd(), projectName);
  const pkg: PackageAccumulator = {scripts: {}, dependencies: {}, devDependencies: {}};
  const vs: VscodeAccumulator = {settings: {}, extensions: new Set()};

  await mkdir(destination, {recursive: true});

  await tasks([
    ...finalFragments.map((f) => ({
      title: `Applying ${color.cyan(f.name)} ${color.dim(`(${f.category})`)}`,
      task: () => applyFragment(f, destination, pkg, vs),
    })),
    {
      title: "Writing package.json",
      task: () => writePackageJson(pkg, destination, projectName),
    },
    {
      title: "Writing .vscode files",
      task: () => writeVscode(vs, destination),
    },
    {
      title: "Renaming dotfiles",
      task: () => renameEscapedDotfiles(destination),
    },
    {
      title: "Replacing template tokens",
      task: () => replaceNameTokens(destination, projectName),
    },
  ]);

  note(
    [
      `${color.green("cd")} ${projectName}`,
      `${color.green("pnpm")} install`,
      `${color.green("pnpm")} dev`,
    ].join("\n"),
    "Next steps",
  );

  const docs = finalFragments.map((f) => f.docFile).filter((d): d is string => Boolean(d));

  if (docs.length > 0) {
    log.info(`Check out ${color.italic(docs.join(", "))} for usage info.`);
  }

  outro(`${color.dim("Questions?")} ${color.cyan("https://x.com/goncy")}`);
}

main().catch((err: unknown) => {
  cancel(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
