import fs from "fs";
import path from "path";

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    "app/(tabs)/inquiry/[roomId].jsx"
  ),
  "utf8"
);

describe("문의방 관리자 발신자", () => {
  test("회원이 아닌 메시지는 관장님으로 표시한다", () => {
    expect(source).toContain(
      '<Text style={styles.senderText}>'
    );
    expect(source).toContain("관장님");
    expect(source).not.toContain(
      'message.senderName || "상대방"'
    );
  });
});
