import fs from "fs";
import path from "path";

function readSource(...segments) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8");
}

describe("회원 자동 로그인 회귀 보호", () => {
  test("로그인·회원가입·갱신 401은 기존 refresh token으로 재시도하지 않는다", () => {
    const source = readSource("src", "api", "client.js");

    expect(source).toContain("function isPublicAuthRequest");
    expect(source).toContain('"/api/auth/login"');
    expect(source).toContain('"/api/auth/register"');
    expect(source).toContain('"/api/auth/refresh"');
    expect(source).toContain("isPublicAuthRequest(originalRequest.url)");
  });

  test("refresh 실패 시 동시 대기 요청을 모두 거부한다", () => {
    const source = readSource("src", "api", "client.js");

    expect(source).toContain("function rejectRefreshQueue");
    expect(source).toContain("refreshQueue.forEach(({ reject }) => reject(error))");
    expect(source).toContain("rejectRefreshQueue(refreshError)");
  });

  test("저장소의 token 갱신·초기화를 AuthContext에 알린다", () => {
    const storageSource = readSource("src", "utils", "storage.js");
    const contextSource = readSource("src", "contexts", "AuthContext.jsx");

    expect(storageSource).toContain("export function subscribeAuthStorage");
    expect(storageSource).toContain('type: "access-token"');
    expect(storageSource).toContain('type: "clear"');
    expect(contextSource).toContain("subscribeAuthStorage((event) =>");
    expect(contextSource).toContain("setToken(event.accessToken || null)");
  });
});
