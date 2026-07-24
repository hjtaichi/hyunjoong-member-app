const {
  normalizeShopCategory,
} = require("../src/features/shop/shopCategory");

describe("member Shop category synchronization", () => {
  test("canonical Admin-Web categories stay unchanged", () => {
    expect(normalizeShopCategory("도복·신발")).toBe("도복·신발");
    expect(normalizeShopCategory("무기")).toBe("무기");
    expect(normalizeShopCategory("수련용품")).toBe("수련용품");
    expect(normalizeShopCategory("차")).toBe("차");
    expect(normalizeShopCategory("찻잔·도구")).toBe("찻잔·도구");
    expect(normalizeShopCategory("기타")).toBe("기타");
  });

  test("찻잔·도구 is not misclassified as 무기 because it contains 도", () => {
    expect(normalizeShopCategory("찻잔·도구")).not.toBe("무기");
    expect(normalizeShopCategory("찻잔·도구")).toBe("찻잔·도구");
  });

  test("legacy exact labels map safely without fuzzy substring matching", () => {
    expect(normalizeShopCategory("검")).toBe("무기");
    expect(normalizeShopCategory("도")).toBe("무기");
    expect(normalizeShopCategory("찻잔")).toBe("찻잔·도구");
    expect(normalizeShopCategory("태극권화")).toBe("도복·신발");
    expect(normalizeShopCategory("폼롤러")).toBe("수련용품");
  });
});
