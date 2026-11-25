import {defineConfig} from "tsup";
import {cp, rm} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  target: "node20",
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  outDir: "dist",
  // Copy the templates files to the dist folder
  async onSuccess() {
    // Start from scratch so renamed or deleted templates don't linger in the package
    await rm(path.join("dist", "templates"), {recursive: true, force: true});
    await cp(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "templates"),
      path.join("dist", "templates"),
      {
        recursive: true,
        filter: (source) => !source.split(path.sep).includes("node_modules"),
      },
    );
  },
});
