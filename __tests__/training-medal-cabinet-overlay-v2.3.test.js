const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal cabinet overlay v2.3", () => {
  test("cabinet no longer uses ImageBackground", () => {
    expect(gallery).not.toContain("<ImageBackground");
    expect(gallery).not.toContain("ImageBackground,");
  });

  test("cabinet image and medal overlay share one relative parent", () => {
    expect(gallery).toContain('position: "relative"');
    expect(gallery).toContain("cabinetImage");
    expect(gallery).toContain('position: "absolute"');
    expect(gallery).toContain("cabinetOverlay");
  });

  test("four shelf rows remain inside overlay", () => {
    expect(gallery).toContain("shelfRow1");
    expect(gallery).toContain("shelfRow2");
    expect(gallery).toContain("shelfRow3");
    expect(gallery).toContain("shelfRow4");
    expect(gallery).toContain("CabinetSlot");
  });
});