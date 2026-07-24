const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("member readability layout v2 contract", () => {
  test("My Page displays join and attendance information as two clear lines", () => {
    const hero = read(
      "src/features/mypage/components/MyPageHeroCard.jsx"
    );

    expect(hero).toContain("const joinedDateDisplay =");
    expect(hero).toContain("const joinedPeriodDisplay =");
    expect(hero).toContain(
      "입관일 {joinedDateDisplay} · {joinedPeriodDisplay}"
    );
    expect(hero).toContain(
      "누적 출석 {attendanceSessionCount}회 · 출석일 {attendanceDayCount}일"
    );
    expect(hero).not.toContain(
      "출석횟수 {attendanceSessionCount}회 ({attendanceDayCount}일)"
    );
  });

  test("Taegukwon training cards use one 12px inner vertical rhythm", () => {
    const section = read(
      "src/features/taegukwon/TrainingSection.jsx"
    );
    const styles = read(
      "src/features/taegukwon/taegukwonStyles.js"
    );

    expect(section).toContain(
      '<View style={styles.trainingSection}>'
    );
    expect(styles).toMatch(
      /trainingSection:\s*\{[\s\S]*?gap:\s*12/
    );
    expect(styles).toMatch(
      /sectionLabel:\s*\{[\s\S]*?marginTop:\s*0,[\s\S]*?marginBottom:\s*0/
    );
    expect(styles).toMatch(
      /coachingInlineBox:\s*\{[\s\S]*?marginTop:\s*0,[\s\S]*?marginBottom:\s*0/
    );
    expect(styles).toMatch(
      /privateGuideBanner:\s*\{[\s\S]*?marginTop:\s*0/
    );
  });
});