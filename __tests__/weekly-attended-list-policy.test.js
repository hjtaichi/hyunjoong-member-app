import fs from "node:fs";
import path from "node:path";

import {
  getCalendarMonthKeysForDates,
  getCurrentWeekDateKeys,
  shouldShowWeeklyAttendedSchedule,
} from "../src/features/schedule/scheduleUtils";

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8"
  );
}

describe("이번 주 실제 참여 수업 리스트 정책", () => {
  test("월을 넘더라도 월요일부터 일요일까지 한 주로 묶는다", () => {
    const dateKeys = getCurrentWeekDateKeys("2026-08-01");

    expect(dateKeys).toEqual([
      "2026-07-27",
      "2026-07-28",
      "2026-07-29",
      "2026-07-30",
      "2026-07-31",
      "2026-08-01",
      "2026-08-02",
    ]);

    expect(getCalendarMonthKeysForDates(dateKeys)).toEqual([
      "2026-07",
      "2026-08",
    ]);
  });

  test("실제 출석만 표시하고 예약·미출석·보정출석은 제외한다", () => {
    expect(
      shouldShowWeeklyAttendedSchedule({
        title: "오전 10시 태극권반",
        attendanceStatus: "present",
      })
    ).toBe(true);

    expect(
      shouldShowWeeklyAttendedSchedule({
        title: "오전 10시 태극권반",
        attendanceStatus: "reserved",
      })
    ).toBe(false);

    expect(
      shouldShowWeeklyAttendedSchedule({
        title: "오전 10시 태극권반",
        attendanceStatus: null,
      })
    ).toBe(false);

    expect(
      shouldShowWeeklyAttendedSchedule({
        title: "오전 10시 태극권반",
        attendanceStatus: "present",
        isAdminAdjustment: true,
      })
    ).toBe(false);
  });

  test("권한 있는 회원의 유단자 실제 출석만 표시한다", () => {
    const item = {
      title: "월요일 유단자수련",
      attendanceStatus: "present",
    };

    expect(
      shouldShowWeeklyAttendedSchedule(item, {
        isYudanjaMember: true,
      })
    ).toBe(true);

    expect(
      shouldShowWeeklyAttendedSchedule(item, {
        isYudanjaMember: false,
      })
    ).toBe(false);
  });

  test("리스트는 달력 월과 분리된 주간 API 병합 구조를 사용한다", () => {
    const hook = read(
      "src/features/schedule/useScheduleScreen.js"
    );
    const list = read(
      "src/features/schedule/components/WeekListView.jsx"
    );
    const screen = read("app/(tabs)/schedule.jsx");

    expect(hook).toContain("getCurrentWeekDateKeys(todayString)");
    expect(hook).toContain("getCalendarMonthKeysForDates");
    expect(hook).toContain("const responses = await Promise.all(");
    expect(hook).toContain("setWeekScheduleByDate(mergedScheduleByDate)");

    expect(list).toContain("이번 주 참여 수업");
    expect(list).toContain("shouldShowWeeklyAttendedSchedule");
    expect(list).toContain("이번 주 참여한 수업이 없습니다.");
    expect(list).not.toContain("일정이 없습니다.");

    expect(screen).toContain("weekScheduleByDate={weekScheduleByDate}");
    expect(screen).toContain("weeklyListLoading={weeklyListLoading}");
  });
});
