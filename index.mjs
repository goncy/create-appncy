#!/usr/bin/env node

import path from "node:path";
import {fileURLToPath} from "node:url";
import {cp} from "node:fs";
import color from "picocolors";
import prompts from "prompts";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";

// Specify CLI arguments
const args = yargs(hideBin(process.argv)).options({
  template: {
    alias: "t",
    type: "string",
    description: "Template to use",
  },
  path: {
    alias: "p",
    type: "string",
    description: "Path to create the project",
  },
});

// Orverride arguments passed on the CLI
prompts.override(args.argv);

async function main() {
  console.clear();

  const project = await prompts([
    {
      type: "select",
      name: "template",
      message: `Which template would you like to use?`,
      initial: 0,
      choices: [{title: "Next.js + ESLint + TypeScript + Tailwind", value: "next-eslint-ts-tw"}],
    },
    {
      type: "text",
      name: "path",
      message: "Where should be the project created?",
      initial: "./appncy-project",
    },
  ]);

  // Copy files from the template folder to the current directory
  cp(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "templates", project.template),
    path.join(process.cwd(), project.path),
    {recursive: true},
  );

  console.log("✨ Project created ✨");
  console.log(`\n${color.yellow(`Next steps:`)}\n`);
  console.log(`${color.green(`cd`)} ${project.path}`);
  console.log(`${color.green(`pnpm`)} install`);
  console.log(`${color.green(`pnpm`)} dev`);
  console.log("\n---\n");
  console.log(`Questions 👀? ${color.underline(color.cyan("https://x.com/goncy"))}`);
}

main().catch(console.error);
