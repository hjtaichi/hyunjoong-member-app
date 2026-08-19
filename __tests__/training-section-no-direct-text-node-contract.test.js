const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");

describe("TrainingSection direct text-node contract", () => {
  test("View has no same-line whitespace-only JSXText child", () => {
    const file = path.join(
      __dirname,
      "../src/features/taegukwon/TrainingSection.jsx"
    );

    const source = fs.readFileSync(file, "utf8");

    const ast = parser.parse(source, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    function jsxName(node) {
      if (
        node &&
        node.type === "JSXIdentifier"
      ) {
        return node.name;
      }

      return "";
    }

    const candidates = [];

    function walk(node) {
      if (!node || typeof node !== "object") {
        return;
      }

      if (
        node.type === "JSXElement" &&
        jsxName(node.openingElement?.name) === "View"
      ) {
        for (const child of node.children || []) {
          if (
            child.type === "JSXText" &&
            child.value.length > 0 &&
            child.value.trim().length === 0 &&
            !child.value.includes("\n") &&
            !child.value.includes("\r")
          ) {
            candidates.push({
              parentLine:
                node.loc?.start?.line || 0,
              line:
                child.loc?.start?.line || 0,
              value:
                child.value,
            });
          }
        }
      }

      for (const [key, value] of Object.entries(node)) {
        if (
          key === "loc" ||
          key === "start" ||
          key === "end"
        ) {
          continue;
        }

        if (Array.isArray(value)) {
          value.forEach(walk);
        } else if (
          value &&
          typeof value === "object"
        ) {
          walk(value);
        }
      }
    }

    walk(ast);

    expect(candidates).toEqual([]);
  });

  test("intentional progress spacing remains inside Text", () => {
    const source = fs.readFileSync(
      path.join(
        __dirname,
        "../src/features/taegukwon/TrainingSection.jsx"
      ),
      "utf8"
    );

    expect(source).toContain(
      '{personalProgress.currentStep || 0} /{" "}'
    );
  });
});
