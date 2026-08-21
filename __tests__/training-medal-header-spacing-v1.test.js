const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal final header spacing", () => {
  test("screen spacing is owned by the page content, not header wrappers", () => {
    expect(gallery).toContain("content: {");
    expect(gallery).toContain("paddingTop: 24");
    expect(gallery).not.toContain("headerWrap");
    expect(gallery).not.toContain("headerSpacer");
  });

  test("uses the same shared ScreenHeader component", () => {
    expect(gallery).toContain(
      'import ScreenHeader from "../src/components/ScreenHeader";'
    );
    expect(gallery).toContain("<ScreenHeader");
  });
});