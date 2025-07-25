import {FlatCompat} from "@eslint/eslintrc";
import {defineConfig} from "eslint/config";
import tseslint from "typescript-eslint";
import eslintJs from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginReactCompiler from "eslint-plugin-react-compiler";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginStylistic from "@stylistic/eslint-plugin";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const languageLintingConfig = tseslint.config(
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        debugLevel: true,
      },
    },
  },
  eslintJs.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintPluginStylistic.flatConfigs.recommended,
  {
    rules: {
      "no-console": ["warn", {allow: ["error"]}],
      "@stylistic/padding-line-between-statements": [
        "warn",
        {blankLine: "always", prev: "*", next: ["return", "export"]},
        {blankLine: "always", prev: ["const", "let", "var"], next: "*"},
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
      ],
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
      // "@typescript-eslint/ban-ts-comment": "off",
      // "@typescript-eslint/no-empty-object-type": "error",
      // "@typescript-eslint/no-unsafe-function-type": "error",
      // "@typescript-eslint/no-wrapper-object-types": "error",
      // "@typescript-eslint/no-empty-function": "off",
      // "@typescript-eslint/no-explicit-any": "off",
      // "@typescript-eslint/no-inferrable-types": "off",
      // "@typescript-eslint/no-namespace": "off",
      // "@typescript-eslint/no-non-null-assertion": "off",
      // "@typescript-eslint/no-shadow": "off",
      // "@typescript-eslint/explicit-function-return-type": "off",
      // "@typescript-eslint/require-await": "off",
      // "@typescript-eslint/no-floating-promises": "off",
      // "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },
);

const reactLintingConfig = defineConfig([
  {
    files: ["**/*.{tsx,jsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat["jsx-runtime"],
  eslintReact.configs["recommended-type-checked"],
  eslintPluginReactCompiler.configs.recommended,
  {
    rules: {
      // "@eslint-react/no-missing-key": "warn",
      // "react/jsx-boolean-value": ["error", "never"],
      // "react/jsx-no-useless-fragment": "error",
      // "react/prop-types": "off",
      // "react/jsx-uses-react": "off",
      // "react/no-array-index-key": "off",
      // "react/react-in-jsx-scope": "off",
      // "react/self-closing-comp": "warn",
      // "react-compiler/react-compiler": "error",
      // "react/jsx-no-leaked-render": "off",
      "react/jsx-curly-brace-presence": ["error", {props: "never", children: "never"}],
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
    },
  },
]);

const reactA11yLintingConfig = defineConfig([
  {
    files: ["**/*.{tsx,jsx}"],
  },
  eslintPluginJsxA11y.flatConfigs.recommended,
  {
    rules: {
      // "jsx-a11y/no-static-element-interactions": "off",
      // "jsx-a11y/click-events-have-key-events": "off",
      // "jsx-a11y/html-has-lang": "off",
    },
  },
]);

const nextLintingConfig = defineConfig([
  {
    files: ["**/*.{tsx,jsx}"],
  },
  compat.extends("plugin:@next/next/recommended"),
  {
    rules: {
      "@next/next/no-img-element": "off",
      // "@next/next/no-html-link-for-pages": "off",
    },
  },
]);

const importLintingConfig = defineConfig([
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
  },
  {
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },
  eslintPluginImport.flatConfigs.recommended,
  eslintPluginImport.flatConfigs.typescript,
  {
    rules: {
      "import/no-default-export": "off",
      "import/no-named-as-default-member": "off",
      "import/named": "off",
      "import/namespace": "off",
      "import/default": "off",
      "import/no-unresolved": "off",
      "import/order": [
        "warn",
        {
          groups: [
            "type",
            "builtin",
            "object",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "@/*",
              group: "external",
              position: "after",
            },
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
]);

const prettierLintingConfig = defineConfig([
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
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
      ],
    },
  },
]);

export default defineConfig([
  languageLintingConfig,
  reactLintingConfig,
  reactA11yLintingConfig,
  nextLintingConfig,
  importLintingConfig,
  prettierLintingConfig,
]);
