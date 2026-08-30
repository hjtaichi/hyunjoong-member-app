const fs = require("fs");
const path = require("path");

describe("secure NFC member flow contract", () => {
  const root =
    path.join(__dirname, "..");

  const api =
    fs.readFileSync(
      path.join(
        root,
        "src",
        "api",
        "memberAttendance.js"
      ),
      "utf8"
    );

  const login =
    fs.readFileSync(
      path.join(
        root,
        "src",
        "screens",
        "LoginScreen.js"
      ),
      "utf8"
    );

  const secureScreen =
    fs.readFileSync(
      path.join(
        root,
        "app",
        "nfc-secure-attendance.js"
      ),
      "utf8"
    );

  const oldScreen =
    fs.readFileSync(
      path.join(
        root,
        "app",
        "nfc-attendance.js"
      ),
      "utf8"
    );

  test("adds proof-only secure API without removing Phase1 API", () => {
    expect(api).toContain(
      "markSecureNfcAttendance"
    );

    expect(api).toContain(
      "/api/member/me/attendance/nfc-secure"
    );

    expect(api).toContain(
      "proofToken"
    );

    expect(api).toContain(
      "markNfcAttendance"
    );

    expect(api).toContain(
      "/api/member/me/attendance/nfc"
    );
  });

  test("secure screen sends proof to login when unauthenticated", () => {
    expect(secureScreen).toContain(
      'pathname: "/login"'
    );

    expect(secureScreen).toContain(
      "nfcAttendanceProof"
    );

    expect(secureScreen).toContain(
      "markSecureNfcAttendance"
    );
  });

  test("login returns secure proof to secure screen with priority", () => {
    const proofBranch =
      login.indexOf(
        "if (nfcAttendanceProof)"
      );

    const oldNfcBranch =
      login.indexOf(
        "if (nfcAttendanceToken)"
      );

    expect(proofBranch)
      .toBeGreaterThanOrEqual(0);

    expect(oldNfcBranch)
      .toBeGreaterThan(proofBranch);

    expect(login).toContain(
      'pathname: "/nfc-secure-attendance"'
    );

    expect(login).toContain(
      "proof: nfcAttendanceProof"
    );
  });

  test("old Phase1 screen still uses old API", () => {
    expect(oldScreen).toContain(
      "markNfcAttendance"
    );

    expect(oldScreen)
      .not.toContain(
        "markSecureNfcAttendance"
      );
  });
});