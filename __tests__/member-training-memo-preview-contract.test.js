const fs = require("fs");
const path = require("path");

describe("member training memo actual-line typography contract", () => {
  const gongbeopSource = fs.readFileSync(
    path.join(
      __dirname,
      "../src/features/taegukwon/GongbeopSection.jsx"
    ),
    "utf8"
  );

  const styleSource = fs.readFileSync(
    path.join(
      __dirname,
      "../src/features/taegukwon/taegukwonStyles.js"
    ),
    "utf8"
  );

  test("memo preview shows full text without truncation", () => {
    expect(gongbeopSource).not.toContain(
      "numberOfLines={3}"
    );

    expect(gongbeopSource).toContain(
      "{memoPreviewText}"
    );
  });

  test("memo card grows from its minimum height", () => {
    const match = styleSource.match(
      /memoImageCard:\s*\{[\s\S]*?\n\},/
    );

    expect(match).not.toBeNull();

    expect(match[0]).toContain(
      "minHeight: 130,"
    );

    expect(match[0]).not.toContain(
      "height: 130,"
    );

    expect(match[0]).not.toContain(
      "height: 180,"
    );
  });

  test("memo typography is based on rendered layout instead of character count", () => {
    expect(gongbeopSource).toContain(
      "onLayout={handleMemoPreviewLayout}"
    );

    expect(gongbeopSource).toContain(
      "event?.nativeEvent?.layout?.height"
    );

    expect(gongbeopSource).toContain(
      "height / memoPreviewLineHeight"
    );

    expect(gongbeopSource).toContain(
      "estimatedLines >= 4"
    );

    expect(gongbeopSource).toContain(
      "estimatedLines >= 6"
    );

    expect(gongbeopSource).not.toContain(
      "memoPreviewLength >="
    );
  });

  test("same memo only moves toward smaller typography", () => {
    expect(gongbeopSource).toContain(
      'currentDensity === "large"'
    );

    expect(gongbeopSource).toContain(
      'currentDensity === "medium"'
    );

    expect(gongbeopSource).not.toContain(
      'currentDensity === "dense" &&'
    );
  });

  test("memo text has large medium and dense typography", () => {
    expect(styleSource).toContain(
      "memoPreviewTextLarge:"
    );

    expect(styleSource).toContain(
      "fontSize: 17,"
    );

    expect(styleSource).toContain(
      "lineHeight: 23,"
    );

    expect(styleSource).toContain(
      "memoPreviewTextMedium:"
    );

    expect(styleSource).toContain(
      "fontSize: 15.75,"
    );

    expect(styleSource).toContain(
      "lineHeight: 21,"
    );

    expect(styleSource).toContain(
      "memoPreviewTextDense:"
    );

    expect(styleSource).toContain(
      "fontSize: 14.5,"
    );

    expect(styleSource).toContain(
      "lineHeight: 19,"
    );
    expect(styleSource).toContain(
      "memoPreviewTextLarge:"
    );
    expect(styleSource).toContain(
      "marginTop: 68,"
    );

    expect(styleSource).toContain(
      "memoPreviewTextMedium:"
    );
    expect(styleSource).toContain(
      "marginTop: 74,"
    );

    expect(styleSource).toContain(
      "memoPreviewTextDense:"
    );
    expect(styleSource).toContain(
      "marginTop: 80,"
    );
  });

  test("memo text remains in normal layout flow", () => {
    const match = styleSource.match(
      /memoPreviewText:\s*\{[\s\S]*?\n\},/
    );

    expect(match).not.toBeNull();

    expect(match[0]).not.toContain(
      'position: "absolute"'
    );

    expect(match[0]).not.toContain(
      "marginTop:"
    );

    expect(match[0]).toContain(
      "marginBottom: 24,"
    );
  });

  test("history button follows expanded memo density", () => {
    expect(gongbeopSource).toContain(
      "styles.memoDetailButtonMedium"
    );

    expect(gongbeopSource).toContain(
      "styles.memoDetailButtonDense"
    );

    expect(styleSource).toContain(
      "memoDetailButtonMedium:"
    );

    expect(styleSource).toContain(
      "top: 27,"
    );

    expect(styleSource).toContain(
      "memoDetailButtonDense:"
    );

    expect(styleSource).toContain(
      "top: 30,"
    );
  });});
