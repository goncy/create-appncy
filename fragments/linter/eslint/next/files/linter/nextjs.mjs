import nextPlugin from "@next/eslint-plugin-next";
import reactCompiler from "eslint-plugin-react-compiler";
import tseslint from "typescript-eslint";

export const nextjs = tseslint.config(
  {
    name: "appncy/next",
    plugins: {"@next/next": nextPlugin},
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-img-element": "off",
    },
  },
  {
    name: "appncy/react-compiler",
    extends: [reactCompiler.configs.recommended],
  },
);
