import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import perfectionist from "eslint-plugin-perfectionist";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

// Flat config only processes `.js`/`.mjs`/`.cjs` by default. Any block's
// `files` field tells ESLint about additional extensions to walk; all blocks
// without `files` then apply to every file ESLint is processing.
//
// That's why only three blocks below declare `files`:
//   · `appncy/javascript` — extends the walk to TS and JSX extensions.
//   · `appncy/a11y` + `appncy/sort-jsx-props` — genuinely JSX-only rules.

export default tseslint.config(
  // ── Ignores ─────────────────────────────────────────────────────────────
  {
    name: "appncy/ignores",
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },

  // ── JavaScript / TypeScript ─────────────────────────────────────────────
  // Non type-aware on purpose: no `parserOptions.project`, which would force
  // a full TS program load on every lint pass.
  {
    name: "appncy/javascript",
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {...globals.browser, ...globals.node, ...globals.serviceworker},
    },
    rules: {
      "no-console": ["warn", {allow: ["error"]}],
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: false,
        },
      ],
    },
  },

  // ── React / hooks / compiler ────────────────────────────────────────────
  {
    name: "appncy/react",
    extends: [
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
      reactCompiler.configs.recommended,
    ],
    settings: {react: {version: "detect"}},
    rules: {
      "react/prop-types": "off",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": ["error", {props: "never", children: "never"}],
      "react/jsx-no-useless-fragment": "error",
      "react/self-closing-comp": "warn",
    },
  },

  // ── Accessibility (JSX only) ────────────────────────────────────────────
  {
    name: "appncy/a11y",
    files: ["**/*.{jsx,tsx}"],
    extends: [jsxA11y.flatConfigs.recommended],
    rules: {
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/html-has-lang": "off",
      "jsx-a11y/no-static-element-interactions": "off",
    },
  },

  // ── Next.js ─────────────────────────────────────────────────────────────
  {
    name: "appncy/next",
    plugins: {"@next/next": next},
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
    },
  },

  // ── Import sorting ──────────────────────────────────────────────────────
  // Replaces eslint-plugin-import (`import/order`) with a faster, Map-based
  // implementation.
  {
    name: "appncy/sort-imports",
    plugins: {perfectionist},
    rules: {
      "perfectionist/sort-imports": [
        "warn",
        {
          type: "natural",
          order: "asc",
          newlinesBetween: 1,
          internalPattern: ["^@/.+"],
          groups: [
            "type",
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "side-effect",
            "style",
            "unknown",
          ],
        },
      ],
      "perfectionist/sort-named-imports": ["warn", {type: "natural", order: "asc"}],
    },
  },

  // ── JSX prop sorting ────────────────────────────────────────────────────
  // Replaces `react/jsx-sort-props` (perfectionist/react recommend disabling
  // the react rule to avoid double-sorting).
  {
    name: "appncy/sort-jsx-props",
    files: ["**/*.{jsx,tsx}"],
    plugins: {perfectionist},
    rules: {
      "perfectionist/sort-jsx-props": [
        "warn",
        {
          type: "natural",
          order: "asc",
          groups: ["shorthand-prop", "multiline-prop", "unknown", "callback"],
          customGroups: [{groupName: "callback", elementNamePattern: "^on[A-Z].*"}],
        },
      ],
    },
  },

  // ── Stylistic ───────────────────────────────────────────────────────────
  // `padding-line-between-statements` was removed from ESLint core's flat
  // defaults; @stylistic is the supported home for it now.
  {
    name: "appncy/stylistic",
    plugins: {"@stylistic": stylistic},
    rules: {
      "@stylistic/padding-line-between-statements": [
        "warn",
        {blankLine: "always", prev: "*", next: ["return", "export"]},
        {blankLine: "always", prev: ["const", "let", "var"], next: "*"},
        {blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"]},
      ],
    },
  },

  // ── Prettier ────────────────────────────────────────────────────────────
  // Runs last so it overrides any stylistic rule still left on. Options are
  // inlined with `usePrettierrc: false` so the plugin skips the per-file
  // `prettier.resolveConfig` + `getFileInfo` calls that dominate its cost
  // (see prettier/eslint-plugin-prettier#445).
  {
    ...prettierRecommended,
    name: "appncy/prettier",
    rules: {
      ...prettierRecommended.rules,
      "prettier/prettier": [
        "warn",
        {
          printWidth: 100,
          trailingComma: "all",
          tabWidth: 2,
          semi: true,
          singleQuote: false,
          bracketSpacing: false,
          arrowParens: "always",
          endOfLine: "auto",
          plugins: ["prettier-plugin-tailwindcss"],
        },
        {usePrettierrc: false},
      ],
    },
  },
);
