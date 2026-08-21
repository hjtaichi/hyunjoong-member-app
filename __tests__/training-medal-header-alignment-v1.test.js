const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal final header alignment", () => {
  test("uses shared ScreenHeader directly", () => {
    expect(gallery).toContain("<ScreenHeader");
    expect(gallery).toContain('title="수련의 결실"');
    expect(gallery).toContain(
      "onBack={() => router.back()}"
    );
  });

  test("does not use obsolete local header wrappers", () => {
    expect(gallery).not.toContain("headerWrap");
    expect(gallery).not.toContain("headerSpacer");
  });

  test("shared header stays before the hero section", () => {
    expect(gallery.indexOf("<ScreenHeader")).toBeGreaterThan(-1);
    expect(gallery.indexOf("<View style={styles.hero}>")).toBeGreaterThan(
      gallery.indexOf("<ScreenHeader")
    );
  });
});