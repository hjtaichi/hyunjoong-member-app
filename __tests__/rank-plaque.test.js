import {
  getRankPlaqueConfig,
  normalizeRankPlaqueLevel,
} from "../src/theme/rankPlaque";

describe("rank plaque user asset policy", () => {
  test("사용자 제공 PNG를 무급부터 6단까지 사용한다", () => {
    for (let level = 0; level <= 6; level += 1) {
      const config = getRankPlaqueConfig(level);
      expect(config.imageSource).toBeTruthy();
      expect(config.legacyFallback).toBeNull();
    }
  });

  test("7단부터 9단은 기존 임시 벡터 표시를 유지한다", () => {
    for (let level = 7; level <= 9; level += 1) {
      const config = getRankPlaqueConfig(level);
      expect(config.imageSource).toBeNull();
      expect(config.legacyFallback).toBeTruthy();
    }
  });

  test("정의되지 않은 값은 안전하게 무급으로 처리한다", () => {
    expect(normalizeRankPlaqueLevel(-1)).toBe(0);
    expect(normalizeRankPlaqueLevel("2")).toBe(2);
    expect(normalizeRankPlaqueLevel("잘못된 값")).toBe(0);
  });
});
