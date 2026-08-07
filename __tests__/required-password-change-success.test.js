const fs = require("fs");
const path = require("path");

describe("필수 비밀번호 변경 성공 안내", () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      "app/required-password-change.jsx",
    ),
    "utf8",
  );

  test("성공 안내 후 로그인으로 이동한다", () => {
    expect(source).toContain(
      "비밀번호가 변경되었습니다.",
    );
    expect(source).toContain(
      "비밀번호 변경 완료",
    );
    expect(source).toContain(
      "showPasswordChangeSuccess(() =>",
    );
    expect(source).toContain(
      'router.replace("/login")',
    );
    expect(source).not.toContain(
      '{ text: "확인", onPress: () => showPasswordChangeSuccess',
    );
  });
});