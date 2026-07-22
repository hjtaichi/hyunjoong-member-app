import { readFileSync } from "node:fs";
import { join } from "node:path";

const protectedFiles = [
  "src/contexts/AuthContext.jsx",
  "src/api/client.js",
  "src/api/memberAttendance.js",
  "app/_layout.jsx",
];

const forbiddenConsoleCalls = [
  "console.log(",
  "console.error(",
  "console.warn(",
  "console.info(",
  "console.debug(",
];

function readSource(relativePath) {
  return readFileSync(
    join(process.cwd(), relativePath),
    "utf8"
  );
}

describe("Member-App 민감정보 런타임 로그 보호", () => {
  test.each(protectedFiles)(
    "%s에서 런타임 console 출력을 사용하지 않는다",
    (relativePath) => {
      const source = readSource(relativePath);

      for (const forbiddenCall of forbiddenConsoleCalls) {
        expect(source).not.toContain(forbiddenCall);
      }
    }
  );

  test("로그인 응답과 토큰 데이터를 출력하지 않는다", () => {
    const source = readSource(
      "src/contexts/AuthContext.jsx"
    );

    expect(source).not.toContain("login response:");
    expect(source).not.toContain(
      "token parse failed. payload ="
    );
    expect(source).not.toContain(
      "refreshMe 실패 data:"
    );
    expect(source).not.toContain(
      "bootstrap savedToken:"
    );
  });

  test("Push Token과 Web Push 구독을 출력하지 않는다", () => {
    const source = readSource("app/_layout.jsx");

    expect(source).not.toContain("EAS projectId:");
    expect(source).not.toContain("PUSH TOKEN:");
    expect(source).not.toContain(
      "기존 subscription:"
    );
    expect(source).not.toContain(
      "저장할 web subscription:"
    );
    expect(source).not.toContain(
      "알림 클릭됨:"
    );
  });

  test("출석 API의 민감 요청과 응답 로그를 출력하지 않는다", () => {
    const source = readSource(
      "src/api/memberAttendance.js"
    );

    expect(source).not.toContain(
      "[getMyAttendance] token exists ="
    );
    expect(source).not.toContain(
      "[getMyAttendance] data ="
    );
    expect(source).not.toContain(
      "[markAttendance] payload ="
    );
    expect(source).not.toContain(
      "[reserveAttendance] sessionId ="
    );
    expect(source).not.toContain(
      "[cancelAttendance] sessionId ="
    );
  });

  test("API 서버 주소를 console에 출력하지 않는다", () => {
    const source = readSource("src/api/client.js");

    expect(source).not.toContain(
      "API_BASE_URL:"
    );
  });
});
