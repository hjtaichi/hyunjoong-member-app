const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("Shop detail natural image layout", () => {
  test("description images preserve their original aspect ratio", () => {
    const source = read("app/shop-detail.jsx");

    expect(source).toContain("function AutoRatioImage");
    expect(source).toContain("Image.getSize(");
    expect(source).toContain("setAspectRatio(width / height)");
    expect(source).toContain("style={[style, { aspectRatio }]}");
    expect(source).toContain('resizeMode="contain"');
    expect(source).toContain(
      "<AutoRatioImage\n                  imageUrl={imageUrl}"
    );
    expect(source).not.toContain("aspectRatio: 1.05");
    expect(source).not.toContain("aspectRatio: 1.25,");
  });

  test("description heading and image spacing is balanced", () => {
    const source = read("app/shop-detail.jsx");

    expect(source).toMatch(
      /detailSection:\s*\{\s*marginTop:\s*20/
    );
    expect(source).toMatch(
      /detailGroup:\s*\{\s*marginTop:\s*20/
    );
    expect(source).toMatch(
      /detailSectionTitle:\s*\{\s*marginBottom:\s*12/
    );
  });
});
