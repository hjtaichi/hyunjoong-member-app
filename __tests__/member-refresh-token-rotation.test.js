const fs = require("fs");
const path = require("path");

describe("member refresh token rotation contract", () => {
  test("shared API client stores the reissued refresh token", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src",
        "api",
        "client.js",
      ),
      "utf8",
    );

    expect(source).toContain(
      "MEMBER_REFRESH_ROTATION_V1",
    );
    expect(source).toContain(
      "const newRefreshToken = payload?.refreshToken || null;",
    );
    expect(source).toContain(
      "await setRefreshToken(newRefreshToken);",
    );
    expect(source).toContain(
      "await setAccessToken(newAccessToken);",
    );
  });

  test("boot refresh stores the reissued refresh token", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src",
        "contexts",
        "AuthContext.jsx",
      ),
      "utf8",
    );

    expect(source).toContain(
      "MEMBER_REFRESH_ROTATION_V1",
    );
    expect(source).toContain(
      "const refreshedRefreshToken =",
    );
    expect(source).toContain(
      "refreshPayload?.refreshToken || null;",
    );
    expect(source).toContain(
      "await setRefreshToken(refreshedRefreshToken);",
    );
  });
});