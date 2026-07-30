import fs from "fs";
import path from "path";

function readSource(...segments) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8");
}

describe("홈 회원 뱃지 계약", () => {
  test("홈 API 뱃지를 헤더에 전달하고 설명 모달을 제공한다", () => {
    const home = readSource("app", "(tabs)", "home.jsx");
    const header = readSource(
      "src",
      "features",
      "home",
      "components",
      "HomeHeader.jsx"
    );
    const modal = readSource(
      "src",
      "features",
      "home",
      "components",
      "BadgeInfoModal.jsx"
    );

    expect(home).toContain("memberBadges={homeData?.member?.badges || []}");
    expect(header).toContain("HJTAICHI_HOME_MEMBER_BADGES_V1");
    expect(header).toContain("setSelectedBadge(badge)");
    expect(header).not.toContain(">유단자회<");
    expect(modal).toContain('backgroundColor: "rgba(255, 252, 248, 0.95)"');
  });

  test("다섯 개 투명 PNG 자산을 정적 require로 연결한다", () => {
    const assets = readSource("src", "features", "home", "memberBadges.js");
    const names = [
      "badge_yudanja_association.png",
      "badge_baesa_disciple.png",
      "badge_instructor_course.png",
      "badge_sports_instructor_l2.png",
      "badge_previous_month_goal_100.png",
    ];

    for (const name of names) {
      expect(assets).toContain(name);
      expect(fs.existsSync(path.join(process.cwd(), "assets", "badges", name))).toBe(true);
    }
  });
});
