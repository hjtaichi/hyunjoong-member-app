import {
  getRankPlaqueConfig,
  getRankPlaqueTextRows,
  normalizeRankPlaqueLevel,
} from "../src/theme/rankPlaque";

describe("rank plaque policy", () => {
  test("무급부터 6단까지 옥패 문구를 올바르게 매핑한다", () => {
    expect(getRankPlaqueTextRows(0)).toEqual(["無", "級"]);
    expect(getRankPlaqueTextRows(1)).toEqual(["初", "段"]);
    expect(getRankPlaqueTextRows(2)).toEqual(["二", "段"]);
    expect(getRankPlaqueTextRows(3)).toEqual(["三", "段"]);
    expect(getRankPlaqueTextRows(4)).toEqual(["四", "段"]);
    expect(getRankPlaqueTextRows(5)).toEqual(["五", "段"]);
    expect(getRankPlaqueTextRows(6)).toEqual(["六", "段"]);
  });

  test("정의되지 않은 값은 안전한 단계 범위로 정규화한다", () => {
    expect(normalizeRankPlaqueLevel(-3)).toBe(0);
    expect(normalizeRankPlaqueLevel("2")).toBe(2);
    expect(normalizeRankPlaqueLevel(20)).toBe(9);
    expect(normalizeRankPlaqueLevel("잘못된 값")).toBe(0);
  });

  test("무급은 일반회원 텍스트 대신 무급 옥패 라벨을 사용한다", () => {
    expect(getRankPlaqueConfig(0).label).toBe("무급");
    expect(getRankPlaqueConfig(0).accessibilityLabel).toBe("현재 단계 무급");
  });
});