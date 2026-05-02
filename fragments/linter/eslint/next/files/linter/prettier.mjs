import prettierRecommended from "eslint-plugin-prettier/recommended";

// Runs last so it overrides any stylistic rule still left on. Options are
// inlined with `usePrettierrc: false` so the plugin skips the per-file
// `prettier.resolveConfig` + `getFileInfo` calls that dominate its cost
// (see prettier/eslint-plugin-prettier#445).
export const prettier = [
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
];
