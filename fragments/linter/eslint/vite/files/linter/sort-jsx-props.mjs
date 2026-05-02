import perfectionist from "eslint-plugin-perfectionist";

// Replaces `react/jsx-sort-props` (perfectionist/react recommend disabling
// the react rule to avoid double-sorting).
export const sortJsxProps = [
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
];
