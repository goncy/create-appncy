# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR, Tailwind CSS, [Oxlint](https://oxc.rs/docs/guide/usage/linter) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter).

## Scripts

- `pnpm dev`: start the dev server.
- `pnpm build`: type check and build for production.
- `pnpm lint`: lint the project with type-aware rules.
- `pnpm lint:fix`: fix lint issues and format the project.

## Linting and formatting

- `.oxlintrc.json`: lint rules.
- `.oxfmtrc.json`: formatting, import sorting and Tailwind class sorting.
- `oxlint-plugin.mjs`: local rules for blank lines between statements and JSX prop order.

Install the [Oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) to get lint fixes and formatting on save in VS Code.
