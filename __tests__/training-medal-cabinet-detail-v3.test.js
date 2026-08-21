const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal cabinet final design", () => {
  test("cabinet uses the user-tuned final aspect ratio", () => {
    expect(gallery).toContain(
      "aspectRatio: 1150 / 2000"
    );
  });

  test("medals use the user-tuned final sizes", () => {
    expect(gallery).toContain("width: 48");
    expect(gallery).toContain("height: 69");
    expect(gallery).toContain("width: 78");
    expect(gallery).toContain("height: 78");
  });

  test("labels show period and form name", () => {
    expect(gallery).toContain('"상반기"');
    expect(gallery).toContain('"하반기"');
    expect(gallery).toContain("periodLabel");
    expect(gallery).toContain("formLabel");
  });

  test("ornament and MaruBuri description are preserved", () => {
    expect(gallery).toContain(
      "TRAINING_MEDAL_ORNAMENT_IMAGE"
    );
    expect(gallery).toContain(
      'fontFamily: "MaruBuriBold"'
    );
  });
});