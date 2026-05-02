# Create Appncy

Create projects as Goncy would.

## Usage

```bash
# Interactive mode (asks framework, then linter)
pnpm create appncy

# Pass everything as flags (skips all prompts)
pnpm create appncy --name my-app --template next-oxlint --extras none

# With extras
pnpm create appncy --name my-app --template next-oxlint --extras extras-clerk,extras-libsql

# Help
pnpm create appncy --help
```

### Flow

The interactive flow has two questions after the project name:

1. **Framework**: `Next.js` or `React (Vite)`
2. **Linter + formatter**: `ESLint + Prettier` or `Oxlint + Oxfmt`

That's it — Next.js always ships with shadcn/ui, React (Vite) ships with plain
Tailwind, and the matching formatter is auto-pulled when you pick a linter.

### Available presets

| Id             | Stack                                       |
| -------------- | ------------------------------------------- |
| `next-eslint`  | Next.js + ESLint + Prettier (+ shadcn/ui)   |
| `next-oxlint`  | Next.js + Oxlint + Oxfmt (+ shadcn/ui)      |
| `react-eslint` | React (Vite) + ESLint + Prettier (Tailwind) |
| `react-oxlint` | React (Vite) + Oxlint + Oxfmt (Tailwind)    |

## Installation

```bash
pnpm install -g create-appncy
```

## How it works (for contributors)

The CLI generates projects by composing **fragments** under `fragments/`.
Each fragment is a small, focused unit of a stack, grouped by category:

```
fragments/
  framework/
    next/                # Next.js base + Tailwind 4 + shadcn/ui (folded in)
    react-vite/          # React + Vite + Tailwind 4
  linter/
    eslint/
      next/              # eslint.config.mjs + linter/* sections + deps
      vite/              # eslint.config.mjs + linter/* sections + deps
    oxlint/
      next/              # .oxlintrc.json + deps
      vite/              # .oxlintrc.json + deps
  formatter/
    prettier/            # prettier deps (integrates via eslint-plugin-prettier)
    oxfmt/               # .oxfmtrc.json + deps
  extras/
    clerk/ auth0/ kinde/ supabase/ libsql/ mercadopago/
```

The folder layout is just for humans — the CLI discovers fragments by globbing
`**/fragment.json`, so the directory tree can be nested however makes sense.
Fragments are identified and cross-referenced by the `id` field in the manifest
(e.g. `framework-next`, `linter-eslint-next`), not by their path.

Each fragment has a `fragment.json` manifest:

```jsonc
{
  "id": "linter-eslint-next",
  "name": "ESLint + Prettier",
  "category": "linter",              // framework | linter | formatter | extra
  "requires": ["framework-next", "formatter-prettier"], // optional auto-pulls
  "conflicts": [],                   // optional
  "package": {                       // merged into package.json
    "scripts": {},
    "dependencies": {},
    "devDependencies": {}
  },
  "vscode": {                        // merged into .vscode/
    "settings": {},                  // → .vscode/settings.json (deep-merged)
    "extensions": []                 // → .vscode/extensions.json (deduped)
  },
  "docFile": "CLERK.md"              // optional, copied to project root
}
```

Plus an optional `files/` folder with the actual files to copy. The applier:

1. Copies each fragment's `files/**` to the destination, in category order:
   `framework → linter → formatter → extra`. Later fragments overwrite earlier
   ones.
2. Merges all `package.json` snippets (alphabetically sorted) into the final
   `package.json`.
3. Deep-merges all `vscode.settings` snippets into `.vscode/settings.json`,
   and dedupes all `vscode.extensions` entries into `.vscode/extensions.json`
   (as `{"recommendations": [...]}`).
4. Renames any `%%`-prefixed file (e.g. `%%.gitignore` → `.gitignore`).
5. Replaces `{{name}}` tokens with the project name.

### ESLint config layout (in generated projects)

The generated `eslint.config.mjs` is a thin entrypoint that imports modular
sections from a `linter/` folder so each rule set lives next to the files it
applies to:

```
eslint.config.mjs       # composes the sections
linter/
  ignores.mjs           # globs to skip
  javascript.mjs        # JS + TS base (typed: no, fast: yes)
  react.mjs             # react + a11y (a11y is JSX-only)
  nextjs.mjs            # only in linter-eslint-next
  react-refresh.mjs     # only in linter-eslint-vite
  sort-imports.mjs      # perfectionist: sort imports
  sort-jsx-props.mjs    # perfectionist: sort JSX props (JSX-only)
  stylistic.mjs         # @stylistic rules
  prettier.mjs          # prettier integration (must run last)
```

Drop a section by deleting the file + its import from `eslint.config.mjs`,
or add new sections the same way.

### Adding a preset

Edit [presets.ts](presets.ts) and add an entry pointing to existing fragment ids:

```ts
{
  id: "my-preset",
  title: "Pretty title for the picker",
  fragments: ["framework-next", "linter-oxlint-next", "formatter-oxfmt"],
}
```

### Adding a fragment

1. Create `fragments/<category>/.../fragment.json` with the manifest. For
   linters pick a sub-folder per framework variant, e.g.
   `fragments/linter/eslint/next/fragment.json`.
2. Drop any files to copy under the fragment's `files/` folder.
3. (Optional) Add a `<NAME>.md` doc and reference it via `"docFile": "<NAME>.md"`.

The CLI will pick it up automatically the next time it runs (or after `pnpm build`).

## Registry

Appncy also exposes a [shadcn](https://ui.shadcn.com) compatible registry hosted at [appncy.goncy.dev](https://appncy.goncy.dev), so you can install presets (like ESLint configs) into any existing project.

### Usage

```bash
# Install an item from the registry
pnpm dlx shadcn@latest add https://appncy.goncy.dev/r/<item>.json
```

For example, to install the ESLint config for Next.js + TypeScript + TailwindCSS:

```bash
pnpm dlx shadcn@latest add https://appncy.goncy.dev/r/eslint-next-ts-tailwind.json
```

You can browse the available items at [appncy.goncy.dev](https://appncy.goncy.dev).

## Questions?

If you have any questions, feel free to open an issue or contact me on [X](https://x.com/goncy).
