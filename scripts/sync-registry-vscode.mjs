#!/usr/bin/env node
// Regenerates .vscode/settings.json + .vscode/extensions.json under
// registry-items/<item>/ by merging the matching linter + formatter fragment
// manifests. Keeps the CLI's fragment manifests as the single source of truth
// so we never have to hand-edit the registry-shipped VSCode config.

import {mkdir, readFile, writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ITEMS = [
  {
    item: "eslint-next",
    linter: "fragments/linter/eslint/next/fragment.json",
    formatter: "fragments/formatter/prettier/fragment.json",
  },
  {
    item: "eslint-react",
    linter: "fragments/linter/eslint/vite/fragment.json",
    formatter: "fragments/formatter/prettier/fragment.json",
  },
  {
    item: "oxlint-next",
    linter: "fragments/linter/oxlint/next/fragment.json",
    formatter: "fragments/formatter/oxfmt/fragment.json",
  },
  {
    item: "oxlint-react",
    linter: "fragments/linter/oxlint/vite/fragment.json",
    formatter: "fragments/formatter/oxfmt/fragment.json",
  },
];

function isObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    const current = target[key];

    if (isObject(value) && isObject(current)) {
      deepMerge(current, value);
    } else {
      target[key] = value;
    }
  }

  return target;
}

async function loadManifest(relPath) {
  return JSON.parse(await readFile(path.join(ROOT, relPath), "utf8"));
}

for (const {item, linter, formatter} of ITEMS) {
  const [linterManifest, formatterManifest] = await Promise.all([
    loadManifest(linter),
    loadManifest(formatter),
  ]);

  const settings = {};

  deepMerge(settings, linterManifest.vscode?.settings ?? {});
  deepMerge(settings, formatterManifest.vscode?.settings ?? {});

  const extensions = [
    ...new Set([
      ...(linterManifest.vscode?.extensions ?? []),
      ...(formatterManifest.vscode?.extensions ?? []),
    ]),
  ].sort();

  const dir = path.join(ROOT, "registry-items", item, ".vscode");

  await mkdir(dir, {recursive: true});
  await writeFile(path.join(dir, "settings.json"), `${JSON.stringify(settings, null, 2)}\n`);
  await writeFile(
    path.join(dir, "extensions.json"),
    `${JSON.stringify({recommendations: extensions}, null, 2)}\n`,
  );

  console.log(`synced registry-items/${item}/.vscode/`);
}
