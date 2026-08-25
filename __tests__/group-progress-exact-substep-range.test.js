const {
  encodeGroupRangeStep,
  decodeGroupRangeStep,
  baseGroupStep,
  groupStepSortKey,
  isStepInExactGroupRange,
} = require("../src/utils/groupProgressExactStep");

describe("단체 진도 세부번호 정확 범위", () => {
  test("기존 일반 식 번호는 그대로 유지한다", () => {
    expect(encodeGroupRangeStep("25")).toBe(25);
    expect(decodeGroupRangeStep(25)).toBe("25");
    expect(baseGroupStep(25)).toBe(25);
  });

  test("세부번호는 Int 컬럼에 충돌 없이 저장하고 표시값으로 복원한다", () => {
    expect(encodeGroupRangeStep("25-1")).toBe(102501);
    expect(encodeGroupRangeStep("25-2")).toBe(102502);
    expect(encodeGroupRangeStep("26-1")).toBe(102601);

    expect(decodeGroupRangeStep(102501)).toBe("25-1");
    expect(decodeGroupRangeStep(102502)).toBe("25-2");
    expect(decodeGroupRangeStep(102601)).toBe("26-1");

    expect(baseGroupStep(102501)).toBe(25);
    expect(baseGroupStep(102601)).toBe(26);
  });

  test("정확 순서는 25 < 25-1 < 25-2 < 26 < 26-1이다", () => {
    expect(
      ["25", "25-1", "25-2", "26", "26-1"].map(
        groupStepSortKey,
      ),
    ).toEqual([2500, 2501, 2502, 2600, 2601]);
  });

  test("이번 주 종료가 25이면 하보과호까지만 포함한다", () => {
    expect(isStepInExactGroupRange("22", 22, 25)).toBe(true);
    expect(isStepInExactGroupRange("23", 22, 25)).toBe(true);
    expect(isStepInExactGroupRange("24", 22, 25)).toBe(true);
    expect(isStepInExactGroupRange("25", 22, 25)).toBe(true);

    expect(isStepInExactGroupRange("25-1", 22, 25)).toBe(false);
    expect(isStepInExactGroupRange("25-2", 22, 25)).toBe(false);
    expect(isStepInExactGroupRange("26", 22, 25)).toBe(false);
  });

  test("25-1과 25-2는 서로 다른 종료점이다", () => {
    const end251 = encodeGroupRangeStep("25-1");
    const end252 = encodeGroupRangeStep("25-2");

    expect(isStepInExactGroupRange("25-1", 22, end251)).toBe(true);
    expect(isStepInExactGroupRange("25-2", 22, end251)).toBe(false);

    expect(isStepInExactGroupRange("25-1", 22, end252)).toBe(true);
    expect(isStepInExactGroupRange("25-2", 22, end252)).toBe(true);
  });

  test("26과 26-1도 별도 종료점이다", () => {
    const end261 = encodeGroupRangeStep("26-1");

    expect(isStepInExactGroupRange("26", 26, 26)).toBe(true);
    expect(isStepInExactGroupRange("26-1", 26, 26)).toBe(false);
    expect(isStepInExactGroupRange("26-1", 26, end261)).toBe(true);
  });
});
