const fs = require("fs");
const path = require("path");

describe("홈 유단자 수련항목 표시", () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      "app",
      "(tabs)",
      "home.jsx",
    ),
    "utf8",
  );

  test("유단자 홈 두 번째 줄은 선택된 수련항목을 우선 표시한다", () => {
    expect(source).toContain(
      "HJTAICHI_HOME_YUDANJA_ITEM_SUMMARY_V1",
    );
    expect(source).toContain(
      "progressItem?.item?.name",
    );
    expect(source).toContain(
      'uniqueItemNames.join(" · ")',
    );
  });

  test("3개 이상은 앞 2개와 나머지 개수로 줄여 표시한다", () => {
    expect(source).toContain(
      'uniqueItemNames.slice(0, 2).join(" · ")',
    );
    expect(source).toContain(
      "uniqueItemNames.length - 2",
    );
  });

  test("수련항목이 없는 과거 데이터는 기존 메모를 유지한다", () => {
    expect(source).toContain(
      'return yudanjaProgress?.memo || "";',
    );
  });
});