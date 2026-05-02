import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

// Non type-aware on purpose: no `parserOptions.project`, which would force
// a full TS program load on every lint pass.
export const javascript = tseslint.config({
  name: "appncy/javascript",
  files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
  extends: [js.configs.recommended, tseslint.configs.recommended],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {...globals.browser, ...globals.serviceworker},
  },
  rules: {
    "no-console": ["warn", {allow: ["error"]}],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        args: "after-used",
        ignoreRestSiblings: false,
        argsIgnorePattern: "^_.*?$",
        caughtErrorsIgnorePattern: "^_.*?$",
      },
    ],
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-confusing-void-expression": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    // Optionals
    // "@typescript-eslint/no-floating-promises": "off",
  },
});
