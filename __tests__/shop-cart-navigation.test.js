const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(__dirname, "..", relativePath),
    "utf8"
  );
}

describe("Shop cart navigation", () => {
  test("Shop header cart is a real Expo Router Link above the header layer", () => {
    const source = read("app/shop.jsx");

    expect(source).toContain(
      '<Link href="/cart" asChild>'
    );
    expect(source).toContain(
      'accessibilityLabel="장바구니로 이동"'
    );
    expect(source).toMatch(
      /cartButton\s*:\s*\{[\s\S]*zIndex:\s*30[\s\S]*elevation:\s*30/
    );
  });

  test("Shop detail header and bottom cart buttons both open cart reliably", () => {
    const source = read("app/shop-detail.jsx");

    expect(source).toContain(
      '<Link href="/cart" asChild>'
    );
    expect(source).toContain(
      "function handleAddToCartAndOpenCart()"
    );
    expect(source).toContain(
      "onPress={handleAddToCartAndOpenCart}"
    );
    expect(source).toMatch(
      /addToCart\(product,\s*1\);[\s\S]*setTimeout\(\(\)\s*=>\s*\{[\s\S]*router\.push\("\/cart"\)/
    );
    expect(source).toMatch(
      /cartButton\s*:\s*\{[\s\S]*zIndex:\s*30[\s\S]*elevation:\s*30/
    );
  });

  test("Cart route screen still exists", () => {
    expect(
      fs.existsSync(
        path.join(__dirname, "..", "app", "cart.jsx")
      )
    ).toBe(true);
  });
});
