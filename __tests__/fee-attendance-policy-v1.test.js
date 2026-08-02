const fs = require("node:fs");
const path = require("node:path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8",
  );
}

describe("member fee and cumulative attendance display policy v1.1", () => {
  test("the fee card shows registration status without a payment-guide button", () => {
    const hero = read(
      "src/features/mypage/components/MyPageHeroCard.jsx",
    );

    expect(hero).toContain("회비 상태");
    expect(hero).toContain("재등록되었습니다.");
    expect(hero).toContain("다음 등록일은");
    expect(hero).toContain("formatRegistrationDate");
    expect(hero).toContain("myPagePaymentStyles.titleRow");
    expect(hero).not.toContain("까지 납부 완료");
    expect(hero).not.toContain("납부 안내");
    expect(hero).not.toContain("heroPayButton");
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
