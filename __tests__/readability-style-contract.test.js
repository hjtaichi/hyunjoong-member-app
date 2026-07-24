import fs from "fs";
import path from "path";

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("회원앱 주요 탭 가독성 스타일 계약", () => {
  test("공통 가독성 토큰과 하단 탭 라벨을 사용한다", () => {
    const tokenSource = read("src/theme/readability.ts");
    const tabSource = read("app/(tabs)/_layout.tsx");

    expect(tokenSource).toContain("fontSize: 12");
    expect(tokenSource).toContain("minHeight: 76");
    expect(tabSource).toContain("readability.tabLabel.fontSize");
    expect(tabSource).toContain("colors.navInactive");
  });

  test("태극권과 내정보 목록은 같은 제목·설명·행 기준을 사용한다", () => {
    const taegukwon = read("src/features/taegukwon/taegukwonStyles.js");
    const mypage = read("src/features/mypage/mypageStyles.js");

    for (const source of [taegukwon, mypage]) {
      expect(source).toContain("readability.comfortableRow.minHeight");
      expect(source).toContain("readability.listTitle.fontSize");
      expect(source).toContain("readability.listDescription.fontSize");
      expect(source).toContain("colors.textSubStrong");
    }
  });

  test("홈·일정·공지의 작은 정보는 10~11px 고정값 대신 가독성 토큰을 사용한다", () => {
    const home = read("src/features/home/homeStyles.js");
    const schedule = read("src/features/schedule/scheduleStyles.js");
    const notices = read("src/components/RecentNoticesSection.jsx");

    expect(home).toContain("readability.actionText.fontSize");
    expect(home).toContain("readability.metadata.fontSize");
    expect(schedule).toContain("readability.statusLabel.fontSize");
    expect(schedule).toContain("readability.metadataStrong.fontSize");
    expect(notices).toContain("readability.metadata.fontSize");
  });
});
