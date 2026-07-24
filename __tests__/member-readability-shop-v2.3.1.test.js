const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8"
  );
}

function getStyleBlock(source, name) {
  const escaped = name.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const match = source.match(
    new RegExp(
      `(?:^|\\n)\\s*${escaped}:\\s*\\{` +
        `[\\s\\S]*?\\n\\s*\\},`
    )
  );

  if (!match) {
    throw new Error(`Style block not found: ${name}`);
  }

  return match[0];
}

function getStyleValue(block, property) {
  const escaped = property.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const match = block.match(
    new RegExp(
      `${escaped}:\\s*([^,\\n]+),`
    )
  );

  if (!match) {
    throw new Error(
      `Style property not found: ${property}`
    );
  }

  return match[1].trim();
}

describe("member readability and shop display v2.3.1", () => {
  test("My Page join and attendance lines share size and line height", () => {
    const styles = read(
      "src/features/mypage/mypageStyles.js"
    );

    const sub = getStyleBlock(
      styles,
      "heroSubText"
    );

    const meta = getStyleBlock(
      styles,
      "heroMetaText"
    );

    expect(getStyleValue(sub, "fontSize")).toBe(
      getStyleValue(meta, "fontSize")
    );

    expect(getStyleValue(sub, "lineHeight")).toBe(
      getStyleValue(meta, "lineHeight")
    );
  });

  test("Shop list displays only valid entered prices", () => {
    const shop = read("app/shop.jsx");

    expect(shop).toContain(
      "function formatProductPrice(value)"
    );

    expect(shop).toContain(
      "formatProductPrice(product.price)"
    );

    expect(shop).toContain(
      "<Text style={styles.productPrice}>"
    );

    expect(shop).toContain(
      "<Text style={styles.smallPrice}>"
    );
  });

  test("Shop detail keeps heading visible and displays entered prices", () => {
    const detail = read("app/shop-detail.jsx");
    const largeImage = getStyleBlock(
      detail,
      "detailImageLarge"
    );

    expect(detail).toContain(
      "formatProductPrice(product?.price)"
    );

    expect(detail).toContain(
      "<Text style={styles.productPrice}>"
    );

    expect(detail).toContain(
      '<Text style={styles.specLabel}>가격</Text>'
    );

    expect(
      getStyleValue(largeImage, "marginTop")
    ).toBe("0");
  });
});