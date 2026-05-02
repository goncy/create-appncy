import {ignores} from "./linter/ignores.mjs";
import {javascript} from "./linter/javascript.mjs";
import {nextjs} from "./linter/nextjs.mjs";
import {prettier} from "./linter/prettier.mjs";
import {react} from "./linter/react.mjs";
import {sortImports} from "./linter/sort-imports.mjs";
import {sortJsxProps} from "./linter/sort-jsx-props.mjs";
import {stylistic} from "./linter/stylistic.mjs";

// Flat config only processes `.js`/`.mjs`/`.cjs` by default. Each section
// declares its own `files` field where it needs to (e.g. JSX-only blocks
// like a11y or `sort-jsx-props`); sections without `files` apply globally.

export default [
  ...ignores,
  ...javascript,
  ...react,
  ...nextjs,
  ...sortImports,
  ...sortJsxProps,
  ...stylistic,
  ...prettier,
];
