export interface Preset {
  id: string;
  title: string;
  fragments: string[];
}

// The 4 supported stacks correspond to the framework × linter matrix.
// Next.js always includes shadcn/ui (folded into the framework fragment).
// React (Vite) ships plain Tailwind.
export const PRESETS: Preset[] = [
  {
    id: "next-eslint",
    title: "Next.js + ESLint + Prettier",
    fragments: ["framework-next", "linter-eslint-next", "formatter-prettier"],
  },
  {
    id: "next-oxlint",
    title: "Next.js + Oxlint + Oxfmt",
    fragments: ["framework-next", "linter-oxlint-next", "formatter-oxfmt"],
  },
  {
    id: "react-eslint",
    title: "React (Vite) + ESLint + Prettier",
    fragments: ["framework-react-vite", "linter-eslint-vite", "formatter-prettier"],
  },
  {
    id: "react-oxlint",
    title: "React (Vite) + Oxlint + Oxfmt",
    fragments: ["framework-react-vite", "linter-oxlint-vite", "formatter-oxfmt"],
  },
];
