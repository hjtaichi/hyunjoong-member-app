import fs from "fs";
import path from "path";

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8"
  );
}

const detailSource = read(
  "app/(tabs)/inquiry/[roomId].jsx"
);

const allSource = read(
  "app/(tabs)/inquiry/all.jsx"
);

const indexSource = read(
  "app/(tabs)/inquiry/index.jsx"
);

describe("문의 관리자 답변 변경 반영", () => {
  test("답변이 없는 open 문의는 모든 회원 문의 화면에서 답변 대기로 표시한다", () => {
    for (const source of [
      detailSource,
      allSource,
      indexSource,
    ]) {
      expect(source).toContain(
        'if (status === "open") return "답변 대기";'
      );
    }
  });

  test("회원 문의방에는 관리자용 수정·삭제 조작을 노출하지 않는다", () => {
    expect(detailSource).not.toContain(
      "/admin/inquiries/"
    );
    expect(detailSource).not.toContain(
      "이 답변을 삭제하시겠습니까?"
    );
    expect(detailSource).not.toContain(
      "수정됨"
    );
  });
});
