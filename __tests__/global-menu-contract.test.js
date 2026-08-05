import {
  GLOBAL_MENU_DRAWER_RATIO,
  GLOBAL_MENU_SECTIONS,
  filterGlobalMenuSections,
} from "../src/features/globalMenu/globalMenuConfig";

function findSection(key) {
  return GLOBAL_MENU_SECTIONS.find((section) => section.key === key);
}

describe("회원앱 전체 메뉴 계약", () => {
  test("좌측 사이드바 너비는 화면의 65%다", () => {
    expect(GLOBAL_MENU_DRAWER_RATIO).toBe(0.65);
  });

  test("홈 메뉴에는 중복 항목을 넣지 않는다", () => {
    const labels = findSection("home").items.map((item) => item.label);

    expect(labels).toEqual([
      "오늘의 수련",
      "출석하기",
      "출석 현황",
      "주간 출석 목표 설정",
    ]);
    expect(labels).not.toContain("수련 기록");
    expect(labels).not.toContain("도장 소식");
  });

  test("확정된 메뉴 명칭을 사용한다", () => {
    const taegukwonLabels = findSection("taegukwon").items.map(
      (item) => item.label
    );
    const mypageLabels = findSection("mypage").items.map(
      (item) => item.label
    );

    expect(taegukwonLabels).toContain("내 수련 영상 올리기");
    expect(mypageLabels).toContain("내 정보 설정");
    expect(mypageLabels).not.toContain("앱 설정");
  });

  test("권한 없는 회원에게 유단자 전용과 개인지도는 잠금 표시한다", () => {
    const sections = filterGlobalMenuSections({
      canAccessYudanja: false,
      hasPrivateLessonAccess: false,
    });
    const taegukwon = sections.find((section) => section.key === "taegukwon");

    expect(taegukwon.items.find((item) => item.key === "yudanja").locked).toBe(
      true
    );
    expect(
      taegukwon.items.find((item) => item.key === "private-lessons").locked
    ).toBe(true);
  });

  test("유단자회 예약 기능은 권한 없는 회원에게 숨긴다", () => {
    const sections = filterGlobalMenuSections({ canAccessYudanja: false });
    const schedule = sections.find((section) => section.key === "schedule");
    const mypage = sections.find((section) => section.key === "mypage");

    expect(schedule.items.some((item) => item.key === "yudanja-reservation")).toBe(
      false
    );
    expect(schedule.items.some((item) => item.key === "yudanja-recurring")).toBe(
      false
    );
    expect(mypage.items.some((item) => item.key === "yudanja-card")).toBe(false);
  });
});

