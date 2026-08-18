const fs = require("fs");
const path = require("path");

const dictionary = fs.readFileSync(
  path.join(__dirname, "..", "src", "data", "movementDictionary.js"),
  "utf8"
);
const formPage = fs.readFileSync(
  path.join(__dirname, "..", "app", "movement-dictionary", "[formId].jsx"),
  "utf8"
);
const searchPage = fs.readFileSync(
  path.join(__dirname, "..", "app", "movement-dictionary", "index.jsx"),
  "utf8"
);
const detailPage = fs.readFileSync(
  path.join(
    __dirname,
    "..",
    "app",
    "movement-dictionary",
    "[formId]",
    "[stepOrder].jsx"
  ),
  "utf8"
);

describe("movement dictionary 29-form transition numbering", () => {
  test("canonical transition labels already exist in the 33-item dictionary", () => {
    expect(dictionary).toMatch(/order:\s*7,[\s\S]*?stepLabel:\s*"6-1"/);
    expect(dictionary).toMatch(/order:\s*27,[\s\S]*?stepLabel:\s*"25-1"/);
    expect(dictionary).toMatch(/order:\s*28,[\s\S]*?stepLabel:\s*"25-2"/);
    expect(dictionary).toMatch(/order:\s*30,[\s\S]*?stepLabel:\s*"26-1"/);
    expect(dictionary).toMatch(/order:\s*33,[\s\S]*?stepLabel:\s*"29"/);
  });

  test("form list displays stepLabel but routes with internal order", () => {
    expect(formPage).toContain(
      'String(movement.stepLabel || movement.order).padStart(2, "0")'
    );
    expect(formPage).toContain('stepOrder: String(movement.order)');
  });

  test("search results display stepLabel while keeping existing route key", () => {
    expect(searchPage).toContain(
      "movement.stepLabel || movement.number || movement.order || movement.step"
    );
    expect(searchPage).toContain("stepOrder: String(movement.number)");
  });

  test("movement detail already displays stepLabel and resolves by internal order", () => {
    expect(detailPage).toContain(
      'String(movement.stepLabel || movement.order).padStart(2, "0")'
    );
    expect(detailPage).toContain("Number(item.order) === orderNumber");
  });
});