const fs = require("node:fs");
const path = require("node:path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8",
  );
}

describe("member fee and cumulative attendance display policy v1", () => {
  test("a covered member quietly sees the paid-through month", () => {
    const hero = read(
      "src/features/mypage/components/MyPageHeroCard.jsx",
    );
    const myPage = read("app/(tabs)/mypage.jsx");

    expect(hero).toContain("coverageEndMonthLabel");
    expect(hero).toContain("까지 납부 완료");
    expect(hero).toContain("납부 안내");
    expect(myPage).toContain("오늘 납부일");
    expect(myPage).toContain("다음 회비 납부");
  });

  test("member cumulative attendance uses the backend display total", () => {
    const myPage = read("app/(tabs)/mypage.jsx");

    expect(myPage).toContain(
      "homeData?.member?.totalAttendanceSessionCount",
    );
    expect(myPage).not.toContain(
      "cumulativeAttendanceAdjustment +",
    );
  });
});
