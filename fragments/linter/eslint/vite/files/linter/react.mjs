import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export const react = tseslint.config(
  {
    name: "appncy/react",
    extends: [
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
    ],
    settings: {react: {version: "detect"}},
    rules: {
      "react/jsx-no-useless-fragment": "error",
      "react/self-closing-comp": "warn",
      "react/jsx-curly-brace-presence": ["error", {props: "never", children: "never"}],
    },
  },
  {
    name: "appncy/a11y",
    files: ["**/*.{jsx,tsx}"],
    extends: [jsxA11y.flatConfigs.recommended],
    rules: {
      "jsx-a11y/click-events-have-key-events": "off",
    },
  },
);
