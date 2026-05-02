import perfectionist from "eslint-plugin-perfectionist";

// Replaces eslint-plugin-import (`import/order`) with a faster, Map-based
// implementation.
export const sortImports = [
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
          internalPattern: ["^@/.+", "^~/.+"],
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
];
