const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const previewPath = path.join(ROOT, "src/features/dobok/v9/DobokPreviewV9.jsx");
const assetsPath = path.join(ROOT, "src/features/dobok/v9/dobokV9Assets.js");
const texturePath = path.join(
  ROOT,
  "assets/images/dobok-showroom/fabrics/mulsilk-seamless.png"
);

describe("도복 쇼룸 시험용 질감 제거 정책", () => {
  const preview = fs.readFileSync(previewPath, "utf8");
  const assets = fs.readFileSync(assetsPath, "utf8");

  test("물실크 시험용 레이어와 조작 패널이 남아 있지 않다", () => {
    [
      "DOBOK_V9_FABRIC_TEXTURE_ASSETS",
      "WebFabricTextureLayer",
      "enableFabricTextureTest",
      "fabricTextureEnabled",
      "fabricTextureOpacity",
      "fabricTextureSize",
      "selectedFabricTexture",
      "effectiveTextureOpacity",
      "textureTestPanel",
      "물실크 질감 테스트",
    ].forEach((token) => {
      expect(preview).not.toContain(token);
    });
  });

  test("웹 명암 텍스처는 multiply 34%만 적용한다", () => {
    expect(preview).toContain(
      '? { mixBlendMode: "multiply", opacity: 0.34 }'
    );
    expect(preview).not.toContain(
      'mixBlendMode: "multiply", opacity: 1'
    );
  });

  test("시험용 물실크 에셋과 참조가 제거되어 있다", () => {
    expect(assets).not.toContain("DOBOK_V9_FABRIC_TEXTURE_ASSETS");
    expect(assets).not.toContain("mulsilk-seamless.png");
    expect(fs.existsSync(texturePath)).toBe(false);
  });
});
