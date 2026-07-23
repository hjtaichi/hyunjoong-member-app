import fs from "fs";
import path from "path";

function readSource(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8"
  );
}

describe("회원앱 유단자회 시즌·휴무 상태", () => {
  const screen = readSource(
    "app/yudanja/index.jsx"
  );

  const api = readSource(
    "src/api/yudanjaContent.js"
  );

  test("기존 유단자 홈 API를 사용한다", () => {
    expect(api).toContain(
      "/member/yudanja-home"
    );
  });

  test("이번 시즌 실제 진행 회차를 표시한다", () => {
    expect(screen).toContain("이번 시즌");
    expect(screen).toContain(
      "회차 진행 중"
    );
    expect(screen).toContain(
      "homeData.season.completedCount"
    );
  });

  test("오늘 수련 예정·휴무·없음 상태를 구분한다", () => {
    expect(screen).toContain(
      "오늘 수련 휴무"
    );
    expect(screen).toContain(
      "오늘 수련 예정"
    );
    expect(screen).toContain(
      "오늘 수련 없음"
    );
  });

  test("내부 휴무 사유를 회원에게 노출하지 않는다", () => {
    expect(screen).not.toContain(
      "yudanjaClosedReason"
    );
    expect(screen).not.toContain(
      "closure.reason"
    );
  });
});
