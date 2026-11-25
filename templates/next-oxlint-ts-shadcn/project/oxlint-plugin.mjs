// Rules that neither Oxlint nor Oxfmt cover natively. Zero dependencies.
// Docs: https://oxc.rs/docs/guide/usage/linter/js-plugins.html

const EXPORTS = new Set([
  "ExportAllDeclaration",
  "ExportDefaultDeclaration",
  "ExportNamedDeclaration",
]);
const VARIABLE_KINDS = new Set(["const", "let", "var"]);

// `declare const` and `using` don't count, same as in @stylistic.
const isVariable = (node) =>
  node.type === "VariableDeclaration" && VARIABLE_KINDS.has(node.kind) && !node.declare;

/**
 * Blank line before `return` and `export`, and after `const`/`let`/`var` unless another
 * declaration follows. Same as `@stylistic/padding-line-between-statements` with:
 *   {blankLine: "always", prev: "*", next: ["return", "export"]}
 *   {blankLine: "always", prev: ["const", "let", "var"], next: "*"}
 *   {blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"]}
 */
const paddingLines = {
  meta: {
    type: "layout",
    fixable: "whitespace",
    messages: {expected: "Expected blank line before this statement."},
  },
  create(context) {
    const {sourceCode} = context;
    const text = sourceCode.text;

    function check(statements) {
      for (let i = 1; i < statements.length; i++) {
        const prev = statements[i - 1];
        const next = statements[i];
        const needsBlankLine =
          next.type === "ReturnStatement" ||
          EXPORTS.has(next.type) ||
          (isVariable(prev) && !isVariable(next));

        if (!needsBlankLine) continue;

        const gap = text.slice(prev.range[1], next.range[0]);

        // Same line (left to the formatter) or already padded, even between comments.
        if (!gap.includes("\n") || /\n[ \t]*\r?\n/.test(gap)) continue;

        const comments = sourceCode.getCommentsBefore(next);
        const prevEndLine = prev.loc.end.line;
        // `foo(); /* starts here and
        //   ends here */` has no clear owner: report, but don't guess where the line goes.
        const ambiguous = comments.some(
          (c) => c.loc.start.line === prevEndLine && c.loc.end.line > prevEndLine,
        );
        // Own-line comments belong to `next`, so the blank line goes above them.
        // Trailing comments on the last line of `prev` stay with `prev`.
        const anchor = comments.find((c) => c.loc.start.line > prevEndLine) ?? next;
        const lineStart = text.lastIndexOf("\n", anchor.range[0] - 1) + 1;
        const newline = gap.includes("\r\n") ? "\r\n" : "\n";

        context.report({
          node: next,
          messageId: "expected",
          fix: ambiguous
            ? null
            : (fixer) => fixer.insertTextBeforeRange([lineStart, lineStart], newline),
        });
      }
    }

    return {
      Program: (node) => check(node.body),
      BlockStatement: (node) => check(node.body),
      StaticBlock: (node) => check(node.body),
      SwitchCase: (node) => check(node.consequent),
      TSModuleBlock: (node) => check(node.body),
    };
  },
};

const RESERVED_PROPS = new Set(["children", "dangerouslySetInnerHTML", "key", "ref"]);

function propName({name}) {
  return name.type === "JSXNamespacedName" ? `${name.namespace.name}:${name.name.name}` : name.name;
}

// Reserved first, then shorthand, then the rest, then callbacks; alphabetical within each group.
function propGroup(attr) {
  const name = propName(attr);

  if (RESERVED_PROPS.has(name)) return 0;
  if (/^on[A-Z]/.test(name)) return 3;
  if (attr.value === null) return 1;

  return 2;
}

function compareProps(a, b) {
  const nameA = propName(a);
  const nameB = propName(b);

  return propGroup(a) - propGroup(b) || (nameA < nameB ? -1 : nameA > nameB ? 1 : 0);
}

/**
 * Same as `react/jsx-sort-props` with `{reservedFirst, shorthandFirst, callbacksLast}`.
 * Spreads split the props into independently sorted runs, since moving props across them
 * changes which value wins.
 */
const sortJsxProps = {
  meta: {
    type: "layout",
    fixable: "code",
    messages: {unsorted: "Props should be sorted: reserved, shorthand, alphabetical, callbacks."},
  },
  create(context) {
    const {sourceCode} = context;

    return {
      JSXOpeningElement(node) {
        const runs = [[]];

        for (const attr of node.attributes) {
          if (attr.type === "JSXSpreadAttribute") runs.push([]);
          else runs.at(-1).push(attr);
        }

        for (const attrs of runs) {
          const sorted = attrs.toSorted(compareProps);
          const first = attrs.findIndex((attr, i) => attr !== sorted[i]);

          if (first === -1) continue;

          // Comments between props can't be moved safely: report without fixing.
          const hasComments = attrs.some(
            (attr, i) => i > 0 && sourceCode.commentsExistBetween(attrs[i - 1], attr),
          );

          context.report({
            node: attrs[first],
            messageId: "unsorted",
            fix: hasComments
              ? null
              : (fixer) =>
                  attrs.map((attr, i) => fixer.replaceText(attr, sourceCode.getText(sorted[i]))),
          });
        }
      },
    };
  },
};

export default {
  meta: {name: "appncy"},
  rules: {"padding-lines": paddingLines, "sort-jsx-props": sortJsxProps},
};
