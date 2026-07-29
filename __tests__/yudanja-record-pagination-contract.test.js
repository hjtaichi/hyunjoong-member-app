const fs = require("fs");
const path = require("path");

describe("유단자회 기록·자료실 페이지네이션 계약", () => {
  const recordsSource = fs.readFileSync(
    path.join(
      __dirname,
      "../app/yudanja/my-records.jsx",
    ),
    "utf8",
  );

  const librarySource = fs.readFileSync(
    path.join(
      __dirname,
      "../app/yudanja/library/index.jsx",
    ),
    "utf8",
  );

  test("최근 수련기록은 세션 기준 5개씩 표시한다", () => {
    expect(recordsSource).toContain(
      "const RECENT_PAGE_SIZE = 5",
    );
    expect(recordsSource).toContain(
      "pagedRecentSessions",
    );
    expect(recordsSource).toContain(
      "recentTotalPages",
    );
  });

  test("최근 기록 페이지는 번호와 구분선으로 표시한다", () => {
    expect(recordsSource).toContain(
      "recordPageDivider",
    );
    expect(recordsSource).toContain(
      "pageNumber > 1",
    );
  });

  test("자료실은 기존 이전·다음 대신 번호형 페이지를 사용한다", () => {
    expect(librarySource).toContain(
      "pageNumberButton",
    );
    expect(librarySource).toContain(
      "pageDivider",
    );
    expect(librarySource).not.toContain(
      ">이전</Text>",
    );
    expect(librarySource).not.toContain(
      ">다음</Text>",
    );
  });
});
