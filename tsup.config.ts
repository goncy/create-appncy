import {defineConfig} from "tsup";
import {cp, rm} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

export default defineConfig({
  entry: ["index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  outDir: "dist",
  // Copy the fragments folder so the built CLI can read manifests at runtime.
  // We rm first so deleted/renamed fragments don't linger in `dist/fragments`
  // (tsup's `clean: true` only tracks files it emits itself).
  async onSuccess() {
    const distFragments = path.join("dist", "fragments");

    await rm(distFragments, {recursive: true, force: true});
    await cp(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "fragments"),
      distFragments,
      {
        recursive: true,
        filter: (source) => !source.split(path.sep).includes("node_modules"),
      },
    );
  },
});
