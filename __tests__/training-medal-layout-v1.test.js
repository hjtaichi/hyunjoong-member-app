const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal final layout compatibility", () => {
  test("uses the current tall cabinet ratio", () => {
    expect(gallery).toContain(
      "aspectRatio: 1150 / 2000"
    );
  });

  test("uses the current half and annual medal sizes", () => {
    expect(gallery).toContain("width: 48");
    expect(gallery).toContain("height: 69");
    expect(gallery).toContain("width: 78");
    expect(gallery).toContain("height: 78");
  });

  test("keeps four shelf rows", () => {
    expect(gallery).toContain('top: "2%"');
    expect(gallery).toContain('top: "25.8%"');
    expect(gallery).toContain('top: "49.3%"');
    expect(gallery).toContain('top: "72.8%"');
  });

  test("keeps two-line medal labels", () => {
    expect(gallery).toContain("periodLabel");
    expect(gallery).toContain("formLabel");
  });
});