import fs from "fs";
import path from "path";

import { getYudanjaCardTheme } from "../src/features/mypage/yudanjaCardPolicy";

describe("yudanja card year theme", () => {
  test.each([
    [2024, "blue"],
    [2025, "blue"],
    [2026, "red"],
    [2027, "red"],
    [2028, "yellow"],
    [2029, "yellow"],
    [2030, "white"],
    [2031, "white"],
    [2032, "black"],
    [2033, "black"],
    [2034, "blue"],
  ])("%s -> %s", (year, expected) => {
    expect(getYudanjaCardTheme(year)).toBe(expected);
  });

  test("falls back to red for an invalid year", () => {
    expect(getYudanjaCardTheme("not-a-year")).toBe("red");
  });
});

describe("yudanja card rendering contract", () => {
  const cardSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/features/mypage/components/YudanjaCard.jsx"
    ),
    "utf8"
  );

  test("renders validity from membershipYear", () => {
    expect(cardSource).toContain(
      "`${membershipYear}.01.01 ~ ${membershipYear}.12.31`"
    );
  });

  test("renders dynamic title with unicode-safe Korean text", () => {
    expect(cardSource).toContain(
      "`${membershipYear}\\uB144 \\uC720\\uB2E8\\uC790\\uD68C \\uD68C\\uC6D0`"
    );
  });

  test("uses backend memberNo instead of a hard-coded 2026 number", () => {
    expect(cardSource).toContain("yudanjaMembership.memberNo");
    expect(cardSource).not.toContain("YD-2026-001");
  });

  test("uses matching front and back theme assets", () => {
    expect(cardSource).toContain("yudanjaCardFrontByTheme?.[theme]");
    expect(cardSource).toContain("yudanjaCardBackByTheme?.[theme]");
  });
});