import {
  getKoreaDateKey,
  getKoreaFormPeriod,
} from "../src/features/taegukwon/formPeriodPolicy";

describe("form period Korea-time boundary", () => {
  test("2027년 1월 1일 00:00 KST부터 새해 상반기다", () => {
    const instant =
      "2026-12-31T15:00:00.000Z";

    expect(
      getKoreaDateKey(instant)
    ).toBe("2027-01-01");

    expect(
      getKoreaFormPeriod(instant)
    ).toMatchObject({
      periodYear: 2027,
      periodHalf: 1,
      periodLabel: "상반기",
      periodSub: "1월 ~ 6월",
    });
  });

  test("7월 1일 00:00 KST 직전까지 상반기다", () => {
    const instant =
      "2027-06-30T14:59:59.999Z";

    expect(
      getKoreaDateKey(instant)
    ).toBe("2027-06-30");

    expect(
      getKoreaFormPeriod(instant)
    ).toMatchObject({
      periodYear: 2027,
      periodHalf: 1,
    });
  });

  test("7월 1일 00:00 KST부터 하반기다", () => {
    const instant =
      "2027-06-30T15:00:00.000Z";

    expect(
      getKoreaDateKey(instant)
    ).toBe("2027-07-01");

    expect(
      getKoreaFormPeriod(instant)
    ).toMatchObject({
      periodYear: 2027,
      periodHalf: 2,
      periodLabel: "하반기",
      periodSub: "7월 ~ 12월",
    });
  });
});