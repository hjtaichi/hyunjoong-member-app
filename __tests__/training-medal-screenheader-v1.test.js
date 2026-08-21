const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal screen header v1", () => {
  test("uses shared ScreenHeader with the page title", () => {
    expect(gallery).toContain(
      'title="수련의 결실"'
    );
    expect(gallery).toContain(
      'onBack={() => router.back()}'
    );
  });

  test("does not duplicate the page title inside hero", () => {
    const matches =
      gallery.match(/수련의 결실/g) || [];

    expect(matches.length).toBe(1);
  });

  test("keeps description and medal count below header", () => {
    expect(gallery).toContain(
      "목표를 이루며 쌓아온 수련의 시간을"
    );
    expect(gallery).toContain(
      "보유 메달 {displayItems.length}개"
    );
  });
});