const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal latest sort v1", () => {
  test("sorts all display medals by earnedAt descending", () => {
    expect(gallery).toContain(
      "new Date(b.earnedAt || 0).getTime()"
    );
    expect(gallery).toContain(
      "new Date(a.earnedAt || 0).getTime()"
    );
    expect(gallery).toContain(
      "return earnedDiff"
    );
  });

  test("same-time tie puts annual before half medal", () => {
    expect(gallery).toContain(
      'return a.type === "annual" ? -1 : 1'
    );
  });

  test("description has an explicit line break after 시간을", () => {
    expect(gallery).toContain(
      "목표를 이루며 쌓아온 수련의 시간을"
    );
    expect(gallery).toContain('{"\\n"}');
    expect(gallery).toContain(
      "한 자리에서 돌아보세요."
    );
  });
});