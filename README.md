# Create Appncy

Create projects as Goncy would.

## Usage

```bash
# Interactive mode
pnpm create appncy

# Override template
pnpm create appncy --template <template>

# Override name
pnpm create appncy --name <name>

# Get Command help
pnpm create appncy --help
```

## Installation

```bash
pnpm install -g create-appncy
```

## Registry

Appncy also exposes a [shadcn](https://ui.shadcn.com) compatible registry hosted at [appncy.goncy.dev](https://appncy.goncy.dev), so you can install presets (like ESLint configs) into any existing project.

### Usage

```bash
# Install an item from the registry
pnpm dlx shadcn@latest add https://appncy.goncy.dev/r/<item>.json
```

For example, to install the ESLint config for Next.js + TypeScript + TailwindCSS:

```bash
pnpm dlx shadcn@latest add https://appncy.goncy.dev/r/eslint-next-ts-tailwind.json
```

You can browse the available items at [appncy.goncy.dev](https://appncy.goncy.dev).

## Questions?

If you have any questions, feel free to open an issue or contact me on [X](https://x.com/goncy).
