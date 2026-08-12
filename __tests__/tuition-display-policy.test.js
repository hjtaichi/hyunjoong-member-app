const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("회원앱 회비 표시 정책", () => {
  const mypage = read("app/(tabs)/mypage.jsx");
  const hero = read("src/features/mypage/components/MyPageHeroCard.jsx");

  test("수납기간 안에서는 납부 완료 기간을 조용히 표시한다", () => {
    expect(mypage).toContain("payment?.isCovered");
    expect(mypage).toContain("coverageEndDateLabel || payment.coverageEndMonthLabel");
    expect(mypage).toContain("까지 납부 완료");
  });

  test("수납기간 밖에서는 다음 회비 납부일을 표시한다", () => {
    expect(mypage).toContain("다음 회비 납부");
    expect(mypage).toContain("paymentDueText");
    expect(mypage).toContain("paymentDaysLeftText");
  });

  test("회비 상태 카드가 금액·결제방식을 회비 정책으로 표시하지 않는다", () => {
    expect(hero).toContain("회비 상태");
    expect(hero).not.toContain("paymentMethod");
    expect(hero).not.toContain("회비 금액");
  });

  test("납부 완료 사실을 별도 완료 알림 UI로 만들지 않는다", () => {
    expect(mypage).not.toContain("회비 납부 완료 알림");
    expect(hero).not.toContain("회비 납부 완료 알림");
  });
});