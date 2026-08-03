import fs from "fs";
import path from "path";

import {
  buildMemoHistoryList,
  formatMemoDate,
} from "../src/features/taegukwon/memoHistoryUtils";

describe("회원 지난 수련 메모", () => {
  test("같은 날의 날짜 필드 형식이 달라도 같은 날짜로 정상 표시한다", () => {
    const list = buildMemoHistoryList({
      memberMemo: "현재 메모",
      memberMemoHistory: [
        {
          id: "memo-1",
          content: "첫 번째 메모",
          createdAt: "2026-08-03T02:00:00.000Z",
        },
        {
          id: "memo-2",
          content: "두 번째 메모",
          created_at: "2026-08-03T01:00:00.000Z",
        },
        {
          id: "memo-3",
          content: "날짜 없는 이전 메모",
          createdAt: "not-a-date",
        },
      ],
      now: new Date("2026-08-03T03:00:00.000Z"),
    });

    expect(list).toHaveLength(3);
    expect(list[0].dateLabel).toBe(
      formatMemoDate(
        new Date("2026-08-03T02:00:00.000Z")
      )
    );
    expect(list[1].dateLabel).toBe(
      formatMemoDate(
        new Date("2026-08-03T01:00:00.000Z")
      )
    );
    expect(list[2].dateLabel).toBe(
      list[1].dateLabel
    );
    expect(
      list.some(
        (memo) =>
          memo.dateLabel === "Invalid Date"
      )
    ).toBe(false);
  });

  test("서버 이력이 있으면 현재 메모를 중복으로 앞에 추가하지 않는다", () => {
    const list = buildMemoHistoryList({
      memberMemo: "현재 메모",
      memberMemoHistory: [
        {
          id: "memo-current",
          content: "현재 메모",
          createdAt: "2026-08-03T02:00:00.000Z",
        },
        {
          id: "memo-old",
          content: "이전 메모",
          createdAt: "2026-08-03T01:00:00.000Z",
        },
      ],
    });

    expect(list.map((memo) => memo.id)).toEqual([
      "memo-current",
      "memo-old",
    ]);
    expect(list.every((memo) => memo.canDelete)).toBe(true);
  });

  test("서버 이력이 없는 기존 메모는 날짜를 표시하되 삭제 대상으로 만들지 않는다", () => {
    const list = buildMemoHistoryList({
      memberMemo: "기존 메모",
      memberMemoHistory: [],
      now: new Date("2026-08-03T03:00:00.000Z"),
    });

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: "current-fallback",
      content: "기존 메모",
      canDelete: false,
    });
  });

  test("회원앱은 삭제 확인과 DELETE API를 연결한다", () => {
    const hookSource = fs.readFileSync(
      path.join(
        __dirname,
        "../src/features/taegukwon/useTaegukwonScreen.js"
      ),
      "utf8"
    );

    const modalSource = fs.readFileSync(
      path.join(
        __dirname,
        "../src/features/taegukwon/MemoHistoryModal.jsx"
      ),
      "utf8"
    );

    expect(hookSource).toContain(
      "이 수련 메모를 삭제할까요?"
    );
    expect(hookSource).toContain(
      'method: "DELETE"'
    );
    expect(hookSource).toContain(
      "/api/member/me/personal-memo/"
    );
    expect(hookSource).toContain(
      'Platform.OS === "web"'
    );
    expect(hookSource).toContain(
      "window.confirm("
    );
    expect(hookSource).toContain(
      "void deleteMemo();"
    );
    expect(modalSource).toContain(
      "handleDeleteMemberMemo(memo)"
    );
    expect(modalSource).toMatch(
      /deleting\s*\?\s*"삭제 중"\s*:\s*"삭제"/
    );
  });
});
