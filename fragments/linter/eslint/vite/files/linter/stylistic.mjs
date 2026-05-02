import stylisticPlugin from "@stylistic/eslint-plugin";

// `padding-line-between-statements` was removed from ESLint core's flat
// defaults; @stylistic is the supported home for it now.
export const stylistic = [
  {
    name: "appncy/stylistic",
    plugins: {"@stylistic": stylisticPlugin},
    rules: {
      "@stylistic/padding-line-between-statements": [
        "warn",
        {blankLine: "always", prev: "*", next: ["return", "export"]},
        {blankLine: "always", prev: ["const", "let", "var"], next: "*"},
        {blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"]},
      ],
    },
  },
];
