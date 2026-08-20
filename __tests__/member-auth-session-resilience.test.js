const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8",
  );
}

describe("member auth session resilience", () => {
  const client = read("src/api/client.js");
  const home = read(
    "src/features/home/useHomeScreen.js",
  );
  const authContext = read(
    "src/contexts/AuthContext.jsx",
  );

  test("transient refresh failures preserve stored session", () => {
    expect(client).toContain(
      "MEMBER_AUTH_TRANSIENT_REFRESH_PRESERVE_V1",
    );

    expect(client).toContain(
      "refreshStatus === 401",
    );

    expect(client).toContain(
      "refreshStatus === 403",
    );

    expect(client).toContain(
      "if (isTerminalRefreshFailure)",
    );

    expect(client).not.toMatch(
      /catch \(refreshError\) \{\s*await clearAuthStorage\(\);/,
    );
  });

  test("missing refresh token still clears the session", () => {
    const start =
      client.indexOf("if (!refreshToken)");

    expect(start).toBeGreaterThanOrEqual(0);

    const block =
      client.slice(start, start + 350);

    expect(block).toContain(
      "await clearAuthStorage();",
    );
  });

  test("successful refresh still stores the new access token", () => {
    expect(client).toContain(
      "await setAccessToken(newAccessToken);",
    );

    expect(client).toContain(
      "resolveRefreshQueue(newAccessToken);",
    );
  });

  test("home does not globally logout for generic 401 or 403", () => {
    const marker =
      home.indexOf(
        "MEMBER_HOME_GENERIC_STATUS_NO_GLOBAL_LOGOUT_V2",
      );

    expect(marker).toBeGreaterThanOrEqual(0);

    const block = home.slice(
      Math.max(0, marker - 450),
      marker + 450,
    );

    expect(block).not.toContain(
      "error?.response?.status === 401",
    );

    expect(block).not.toContain(
      "error?.response?.status === 403",
    );

    expect(block).toContain(
      'errorMessage.includes("퇴관")',
    );
  });

  test("explicit ended-member policy remains", () => {
    const endedWord = "\uD1F4\uAD00";

    expect(authContext).toContain(
      'memberStatus === "ended"',
    );

    expect(authContext).toContain(
      "await clearAuthStorage();",
    );

    expect(home).toContain(
      `errorMessage.includes("${endedWord}")`,
    );
  });

  test("AuthContext security policy was not weakened", () => {
    expect(authContext).toContain(
      "status === 401 || status === 403",
    );

    expect(authContext).toContain(
      "const meResult = await getMeApi(savedToken);",
    );
  });
});
