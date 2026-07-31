const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    "app/(tabs)/inquiry/[roomId].jsx",
  ),
  "utf8",
);

describe("회원 문의 200자 제한", () => {
  test("입력창이 200자를 제한하고 00/200 형식으로 표시한다", () => {
    expect(source).toContain(
      "const INQUIRY_MESSAGE_MAX_LENGTH = 200;",
    );
    expect(source).toContain(
      "maxLength={INQUIRY_MESSAGE_MAX_LENGTH}",
    );
    expect(source).toContain(
      'String(input.length).padStart(2, "0")',
    );
    expect(source).toContain(
      "trimmed.length > INQUIRY_MESSAGE_MAX_LENGTH",
    );
    expect(source).toContain(
      'const INQUIRY_MESSAGE_OVER_LIMIT = "200자를 초과했습니다.";',
    );
  });
});
