const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal gallery polish final", () => {
  test("ornament image is wired into the gallery", () => {
    expect(gallery).toContain(
      "TRAINING_MEDAL_ORNAMENT_IMAGE"
    );
    expect(gallery).toContain(
      "training-medal-ornament.png"
    );
    expect(gallery).toContain(
      "style={styles.ornament}"
    );
  });

  test("ornament style matches the final tuned design", () => {
    expect(gallery).toContain("ornament: {");
    expect(gallery).toContain('width: "95%"');
    expect(gallery).toContain("height: 50");
    expect(gallery).toContain("marginTop: -10");
    expect(gallery).toContain("marginBottom: 10");
    expect(gallery).toContain("opacity: 1");
  });

  test("description uses the final typography", () => {
    expect(gallery).toContain(
      "목표를 이루며 쌓아온 수련의 시간을"
    );
    expect(gallery).toContain(
      "한 자리에서 돌아보세요."
    );
    expect(gallery).toContain(
      'fontFamily: "MaruBuriBold"'
    );
    expect(gallery).toContain("fontSize: 16");
  });
});