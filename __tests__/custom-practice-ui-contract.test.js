import fs from "fs";
import path from "path";

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8"
  );
}

describe("회원앱 개별수련 UI 계약", () => {
  const trainingSection = read(
    "src/features/taegukwon/TrainingSection.jsx"
  );
  const screenHook = read(
    "src/features/taegukwon/useTaegukwonScreen.js"
  );
  const listScreen = read(
    "app/custom-practices/index.jsx"
  );
  const newScreen = read(
    "app/custom-practices/new.jsx"
  );
  const detailScreen = read(
    "app/custom-practices/[practiceId].jsx"
  );

  test("권한이 있는 회원에게만 개별수련 메뉴를 보여준다", () => {
    expect(trainingSection).toContain(
      "hasCustomPracticeAccess ?"
    );
    expect(trainingSection).toContain(
      'router.push("/custom-practices")'
    );
    expect(screenHook).toContain(
      "getMyCustomPractices"
    );
    expect(screenHook).toContain(
      "hasCustomPracticeAccess"
    );
  });

  test("목표 달성형과 자유 기록형을 생성할 수 있다", () => {
    expect(newScreen).toContain("목표 달성형");
    expect(newScreen).toContain("자유 기록형");
    expect(newScreen).toContain(
      "createMyCustomPractice"
    );
  });

  test("횟수·수련일·메모 기록과 진행률을 제공한다", () => {
    expect(detailScreen).toContain("오늘 수련 기록");
    expect(detailScreen).toContain(
      "createMyCustomPracticeRecord"
    );
    expect(detailScreen).toContain("progressPercent");
    expect(detailScreen).toContain("기록 내역");
  });

  test("목록은 관리자 지정과 회원 생성 수련을 구분한다", () => {
    expect(listScreen).toContain("관장님 지정");
    expect(listScreen).toContain("내가 만든 수련");
  });
});
