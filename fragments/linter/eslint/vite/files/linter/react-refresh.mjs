import refreshPlugin from "eslint-plugin-react-refresh";

// Vite/HMR-only: warns when a module exports something other than a
// component, which would break Fast Refresh.
export const reactRefresh = [
  {
    name: "appncy/react-refresh",
    files: ["**/*.{jsx,tsx}"],
    plugins: {"react-refresh": refreshPlugin},
    rules: {
      "react-refresh/only-export-components": ["warn", {allowConstantExport: true}],
    },
  },
];
