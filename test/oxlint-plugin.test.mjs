import {readFile} from "node:fs/promises";
import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {RuleTester} from "oxlint/plugins-dev";

import plugin from "../templates/next-eslint-ts-shadcn/project/oxlint-plugin.mjs";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({languageOptions: {parserOptions: {lang: "tsx"}}});

it("every template ships the same oxlint-plugin.mjs", async () => {
  const [source, ...copies] = await Promise.all(
    ["next-eslint-ts-shadcn", "next-eslint-ts-tw", "react-eslint-ts-tw"].map((template) =>
      readFile(
        new URL(`../templates/${template}/project/oxlint-plugin.mjs`, import.meta.url),
        "utf8",
      ),
    ),
  );

  for (const copy of copies) assert.equal(copy, source);
});

tester.run("padding-lines", plugin.rules["padding-lines"], {
  valid: [
    "const a = 1;\nconst b = 2;\nlet c = 3;\n\nfoo();",
    "function f() {\n  return 1;\n}",
    "function f() {\n  foo();\n\n  return 1;\n}",
    "if (x) return;\nfoo();",
    "for (const x of y) foo(x);",
    "foo();\nbar();",
    "foo(); return;",
    "const a = 1;\n// comment\n\nfoo();",
    "const a = 1;\n\n// comment\nfoo();",
    "class A {\n  a = 1;\n  b() {}\n}",
    "{\n  using a = b;\n  foo();\n}",
    "declare const a: string;\nfoo();",
    "switch (x) {\n  case 1:\n    foo();\n\n    return 1;\n  case 2:\n    return 2;\n}",
    '"use client";\n\nexport default function Page() {}',
  ],
  invalid: [
    {
      code: "function f() {\n  foo();\n  return 1;\n}",
      output: "function f() {\n  foo();\n\n  return 1;\n}",
      errors: 1,
    },
    {
      code: "const a = 1;\nfoo();",
      output: "const a = 1;\n\nfoo();",
      errors: 1,
    },
    {
      name: "a variable followed by return needs a single blank line",
      code: "function f() {\n  const a = 1;\n  return a;\n}",
      output: "function f() {\n  const a = 1;\n\n  return a;\n}",
      errors: 1,
    },
    {
      code: 'import a from "a";\nexport const b = a;\nexport const c = a;',
      output: 'import a from "a";\n\nexport const b = a;\n\nexport const c = a;',
      errors: 2,
    },
    {
      code: '"use server";\nexport async function action() {}',
      output: '"use server";\n\nexport async function action() {}',
      errors: 1,
    },
    {
      name: "the blank line goes above own-line comments",
      code: "function f() {\n  foo();\n  // why\n  /* more */\n  return 1;\n}",
      output: "function f() {\n  foo();\n\n  // why\n  /* more */\n  return 1;\n}",
      errors: 1,
    },
    {
      name: "trailing comments stay with the previous statement",
      code: "const a = 1; // note\nfoo();",
      output: "const a = 1; // note\n\nfoo();",
      errors: 1,
    },
    {
      name: "a block comment spanning both lines is reported but not fixed",
      code: "const a = 1; /* starts\n ends */ foo();",
      output: null,
      errors: 1,
    },
    {
      name: "CRLF is preserved",
      code: "const a = 1;\r\nfoo();\r\n",
      output: "const a = 1;\r\n\r\nfoo();\r\n",
      errors: 1,
    },
    {
      name: "multiline statements",
      code: "const a = {\n  b: 1,\n};\nif (a) {\n  foo();\n}",
      output: "const a = {\n  b: 1,\n};\n\nif (a) {\n  foo();\n}",
      errors: 1,
    },
    {
      name: "switch cases, static blocks and namespaces",
      code: [
        "switch (x) {\n  case 1:\n    foo();\n    return 1;\n}",
        "class A {\n  static {\n    let a;\n    a = 1;\n  }\n}",
        'declare module "m" {\n  const a: string;\n  export {a};\n}',
      ].join("\n\n"),
      output: [
        "switch (x) {\n  case 1:\n    foo();\n\n    return 1;\n}",
        "class A {\n  static {\n    let a;\n\n    a = 1;\n  }\n}",
        'declare module "m" {\n  const a: string;\n\n  export {a};\n}',
      ].join("\n\n"),
      errors: 3,
    },
  ],
});

tester.run("sort-jsx-props", plugin.rules["sort-jsx-props"], {
  valid: [
    '<A key="k" ref={r} disabled hidden alt="" className="c" onBlur={f} onClick={g} />',
    '<A b="1" {...props} a="2" />',
    '<A Z="1" a="2" />',
    '<A on="1" one="2" />',
    '<svg xlink:href="#a" xmlns="x" />',
    "<A />",
  ],
  invalid: [
    {
      code: '<A onClick={f} className="c" disabled key="k" />',
      output: '<A key="k" disabled className="c" onClick={f} />',
      errors: 1,
    },
    {
      name: "each run between spreads is sorted on its own",
      code: '<A c="1" b="2" {...props} z="3" a="4" />',
      output: '<A b="2" c="1" {...props} a="4" z="3" />',
      errors: 2,
    },
    {
      name: "multiline values move with their prop",
      code: '<A\n  z={() => {\n    foo();\n  }}\n  a="1"\n/>',
      output: '<A\n  a="1"\n  z={() => {\n    foo();\n  }}\n/>',
      errors: 1,
    },
    {
      name: "comments between props are reported but not fixed",
      code: '<A b="1" /* keep */ a="2" />',
      output: null,
      errors: 1,
    },
  ],
});
