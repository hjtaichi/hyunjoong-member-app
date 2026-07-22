const fs = require("fs");
const path = require("path");

const {
  formatMemberNotificationDate,
} = require(
  "../src/features/notifications/formatMemberNotificationDate"
);

describe("회원 알림 날짜 표시", () => {
  test(
    "알림 날짜를 연도 두 자리와 24시간제로 표시한다",
    () => {
      const date = new Date(
        2026,
        6,
        22,
        15,
        19,
        48
      );

      expect(
        formatMemberNotificationDate(date)
      ).toBe("26.7.22 15:19");
    }
  );

  test(
    "월·일·시는 불필요한 0을 붙이지 않고 분은 두 자리로 표시한다",
    () => {
      const date = new Date(
        2026,
        0,
        2,
        9,
        5
      );

      expect(
        formatMemberNotificationDate(date)
      ).toBe("26.1.2 9:05");
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
    }
  );
});
