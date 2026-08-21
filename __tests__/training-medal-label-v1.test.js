const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal label compatibility", () => {
  test("cabinet uses two-line readable labels", () => {
    expect(gallery).toContain("slotLabelWrap");
    expect(gallery).toContain("periodLabel");
    expect(gallery).toContain("formLabel");
    expect(gallery).toContain("fontSize: 9");
    expect(gallery).toContain("fontSize: 11");
    expect(gallery).toContain("width: 108");
  });

  test("period line includes year and half", () => {
    expect(gallery).toContain('"상반기"');
    expect(gallery).toContain('"하반기"');
    expect(gallery).toContain('`${item.year}년 ${');
  });

  test("generic turo fallback is not shown", () => {
    expect(gallery).not.toContain('"투로"');
  });
});