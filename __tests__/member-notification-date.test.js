const fs = require("fs");
const path = require("path");

const {
  formatMemberNotificationDate,
} = require(
  "../src/features/notifications/formatMemberNotificationDate"
);

const {
  normalizeMemberNotification,
} = require(
  "../src/api/memberNotifications"
);

describe("회원 알림 날짜 표시", () => {
  test(
    "알림 날짜를 한국 시간 기준 연월일 시분으로 표시한다",
    () => {
      expect(
        formatMemberNotificationDate(
          "2026-07-22T06:19:48.000Z"
        )
      ).toBe("2026.07.22 15:19");
    }
  );

  test(
    "한국 자정 이후 날짜 변경도 정확히 표시한다",
    () => {
      expect(
        formatMemberNotificationDate(
          "2026-01-02T15:05:00.000Z"
        )
      ).toBe("2026.01.03 00:05");
    }
  );

  test.each([
    undefined,
    null,
    "",
    "   ",
    "invalid-date-value",
  ])(
    "날짜값이 없거나 잘못되면 날짜 정보 없음을 반환한다: %p",
    (value) => {
      expect(
        formatMemberNotificationDate(value)
      ).toBe("날짜 정보 없음");
    }
  );

  test(
    "Invalid Date 객체도 안전하게 처리한다",
    () => {
      expect(
        formatMemberNotificationDate(
          new Date("invalid")
        )
      ).toBe("날짜 정보 없음");
    }
  );

  test(
    "레거시 날짜 필드도 createdAt으로 정규화한다",
    () => {
      expect(
        normalizeMemberNotification({
          id: "notification-1",
          body: "알림 본문",
          created_at:
            "2026-07-22T06:19:48.000Z",
        })
      ).toMatchObject({
        id: "notification-1",
        message: "알림 본문",
        createdAt:
          "2026-07-22T06:19:48.000Z",
      });

      expect(
        normalizeMemberNotification({
          timestamp:
            "2026-07-23T01:05:00.000Z",
        }).createdAt
      ).toBe(
        "2026-07-23T01:05:00.000Z"
      );

      expect(
        normalizeMemberNotification({
          sentAt:
            "2026-07-24T02:10:00.000Z",
        }).createdAt
      ).toBe(
        "2026-07-24T02:10:00.000Z"
      );
    }
  );

  test(
    "createdAt이 레거시 날짜 필드보다 우선한다",
    () => {
      expect(
        normalizeMemberNotification({
          createdAt:
            "2026-07-25T00:00:00.000Z",
          created_at:
            "2026-07-20T00:00:00.000Z",
        }).createdAt
      ).toBe(
        "2026-07-25T00:00:00.000Z"
      );
    }
  );

  test(
    "회원 알림 화면이 공통 날짜 포매터를 사용한다",
    () => {
      const screenPath = path.join(
        __dirname,
        "..",
        "app",
        "member-notifications.jsx"
      );

      const source = fs.readFileSync(
        screenPath,
        "utf8"
      );

      expect(source).toContain(
        'from "../src/features/notifications/formatMemberNotificationDate"'
      );

      expect(source).toContain(
        "formatMemberNotificationDate(item.createdAt)"
      );

      expect(source).not.toMatch(
        /new\s+Date\(\s*item\.createdAt\s*\)\s*\.toLocaleString/
      );

      expect(source).not.toContain(
        "알림 화면 getMemberNotifications data"
      );

      expect(source).not.toContain(
        "카드 눌림 시작"
      );
    }
  );
});
