import fs from "fs";
import path from "path";

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/screens/RegisterScreen.js"
  ),
  "utf8"
);

describe("회원가입 검증 안내", () => {
  test("필수 동의 전에도 가입 버튼을 눌러 이유를 안내한다", () => {
    expect(source).toContain(
      "disabled={isSubmitting}"
    );
    expect(source).toContain(
      'showAlert("안내", "필수 약관에 모두 동의해주세요.")'
    );
  });

  test("아이디와 비밀번호 조건 오류를 화면 알림으로 안내한다", () => {
    expect(source).toContain(
      "아이디는 영문 소문자, 숫자, _ 조합 4~20자로 입력해주세요."
    );
    expect(source).toContain(
      "비밀번호는 8자 이상, 영문/숫자 조합이어야 합니다."
    );
    expect(source).not.toContain(
      'Alert.alert("안내",'
    );
  });
});
