const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(__dirname, "..", relativePath),
    "utf8"
  );
}

describe("Shop cart click and pagination", () => {
  test("Shop header cart is above ScreenHeader and uses a direct press handler", () => {
    const source = read("app/shop.jsx");

    expect(source).toContain(
      'testID="shop-header-cart-button"'
    );
    expect(source).toContain(
      'onPress={() => router.push("/cart")}'
    );
    expect(source).toContain(
      'pointerEvents="auto"'
    );
    expect(source).not.toContain(
      '<Link href="/cart" asChild>'
    );
    expect(source).toMatch(
      /cartButton\s*:\s*\{[\s\S]*zIndex:\s*100[\s\S]*elevation:\s*100/
    );
  });

  test("Shop detail header cart is above ScreenHeader", () => {
    const source = read("app/shop-detail.jsx");

    expect(source).toContain(
      'testID="shop-detail-header-cart-button"'
    );
    expect(source).toContain(
      'onPress={() => router.push("/cart")}'
    );
    expect(source).not.toContain(
      '<Link href="/cart" asChild>'
    );
    expect(source).toMatch(
      /cartButton\s*:\s*\{[\s\S]*zIndex:\s*100[\s\S]*elevation:\s*100/
    );
  });

  test("Entire products are paginated five at a time with numbered controls", () => {
    const source = read("app/shop.jsx");

    expect(source).toContain(
      "const PRODUCTS_PER_PAGE = 5;"
    );
    expect(source).toContain(
      "const PAGE_BUTTON_WINDOW = 5;"
    );
    expect(source).toContain(
      "currentPageProducts.map"
    );
    expect(source).toContain(
      "visiblePageNumbers.map"
    );
    expect(source).toContain(
      "setCurrentPage(pageNumber)"
    );
    expect(source).toContain(
      "{currentPage} / {totalPages} 페이지"
    );
    expect(source).not.toMatch(
      /filteredProducts\.map\(\(product\)/
    );
  });

  test("Shop detail bottom cart button still adds the product and opens cart", () => {
    const source = read("app/shop-detail.jsx");

    expect(source).toContain(
      "function handleAddToCartAndOpenCart()"
    );
    expect(source).toContain(
      "onPress={handleAddToCartAndOpenCart}"
    );
    expect(source).toMatch(
      /addToCart\(product,\s*1\);[\s\S]*router\.push\("\/cart"\)/
    );
  });

  test("Cart route still exists", () => {
    expect(
      fs.existsSync(
        path.join(__dirname, "..", "app", "cart.jsx")
      )
    ).toBe(true);
  });
});
