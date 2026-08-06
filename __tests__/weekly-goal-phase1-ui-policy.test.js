const fs = require("node:fs");
const path = require("node:path");
const {
  getScheduleUiMeta,
  isSpecialScheduleNotice,
  isYudanjaSchedule,
  shouldOpenScheduleBottomSheet,
  shouldShowSelectedSchedule,
} = require("../src/features/schedule/scheduleUtils");

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("주간 목표 전환 1단계 UI 정책", () => {
  test("홈 월 출석 현황은 실제 출석과 유단자의 월요일 예약만 표시한다", () => {
    const home = read("app/(tabs)/home.jsx");
    const attendanceCalendar = read(
      "src/features/home/components/AttendanceCalendar.jsx"
    );

    expect(home).toContain("const hasYudanjaReserved");
    expect(home).toContain(
      'attendanceStatus: hasPresent ? "present" : hasYudanjaReserved ? "reserved" : null'
    );
    expect(home).toContain("showYudanjaReservation={isYudanja}");
    expect(attendanceCalendar).toContain("showYudanjaReservation");
    expect(attendanceCalendar).toContain("유단자회 예약");
    expect(attendanceCalendar).toContain(">출석</Text>");
  });

  test("일반 수업의 예약 상태와 예약 동작은 숨긴다", () => {
    const meta = getScheduleUiMeta(
      {
        title: "오후 7시 태극권반",
        attendanceStatus: "reserved",
        canCancelReservation: true,
        recurringMeta: { isRecurring: false },
      },
      { isReservableDate: true }
    );

    expect(meta).toMatchObject({
      tone: "plain",
      label: null,
      actionLabel: null,
      actionType: null,
      isYudanja: false,
    });
  });

  test("일반 수업의 실제 출석 완료는 표시한다", () => {
    const meta = getScheduleUiMeta(
      {
        title: "오전 10시 태극권반",
        attendanceStatus: "present",
        canCancelAttendance: false,
      },
      { isReservableDate: true }
    );

    expect(meta).toMatchObject({
      tone: "done",
      label: "출석 완료",
      actionLabel: null,
      isYudanja: false,
    });
  });

  test("유단자수련은 직접 예약과 정기예약 동작을 유지한다", () => {
    expect(isYudanjaSchedule({ title: "월요일 유단자수련" })).toBe(true);

    const available = getScheduleUiMeta(
      { title: "월요일 유단자수련", canReserve: true },
      { isReservableDate: true }
    );
    expect(available).toMatchObject({
      label: "예약 가능",
      actionLabel: "출석 예정",
      actionType: "reserve",
      isYudanja: true,
    });

    const recurring = getScheduleUiMeta(
      {
        title: "월요일 유단자수련",
        attendanceStatus: "reserved",
        canCancelReservation: true,
        recurringMeta: {
          isRecurring: true,
          matchedRecurringRule: true,
          memberRecurringReservationId: 10,
        },
      },
      { isReservableDate: true }
    );
    expect(recurring).toMatchObject({
      label: "정기출석 예정",
      actionLabel: "이번만 쉬기",
      actionType: "skipOnce",
      isYudanja: true,
    });
  });

  test("일정 리스트는 이번 주 실제 참여 수업만 표시한다", () => {
    const weekList = read("src/features/schedule/components/WeekListView.jsx");
    const summary = read(
      "src/features/schedule/components/SelectedScheduleSummary.jsx"
    );
    const bottomSheet = read(
      "src/features/schedule/components/ScheduleBottomSheet.jsx"
    );

    expect(weekList).toContain("이번 주 참여 수업");
    expect(weekList).toContain("shouldShowWeeklyAttendedSchedule");
    expect(weekList).toContain("이번 주 참여한 수업이 없습니다.");
    expect(weekList).not.toContain("일정이 없습니다.");
    expect(weekList).toContain("{uiMeta.label ? (");
    expect(summary).toContain("{uiMeta.label ? (");
    expect(summary).toContain("if (!shouldShow)");
    expect(summary).toContain("selectedDayInfo?.holidayName");
    expect(summary).toContain("canOpenSheet");
    expect(summary).toContain("disabled={!canOpenSheet}");
    expect(bottomSheet).toContain("{finalUiMeta.label ? (");
  });

  test("달력 아래 일정은 오늘 일반수업과 출석 기록·특별 일정·유단자 예약을 표시한다", () => {
    const generalClass = { title: "오후 7시 태극권반" };
    const attendedClass = {
      title: "오후 7시 태극권반",
      attendanceStatus: "present",
    };
    const seminar = { title: "태극권 세미나" };
    const yudanja = { title: "월요일 유단자수련" };

    expect(
      shouldShowSelectedSchedule(generalClass, {
        dateDiff: -1,
        isYudanjaMember: false,
      })
    ).toBe(false);
    expect(
      shouldShowSelectedSchedule(attendedClass, {
        dateDiff: -1,
        isYudanjaMember: false,
      })
    ).toBe(true);
    expect(
      shouldShowSelectedSchedule(generalClass, {
        dateDiff: 0,
        isYudanjaMember: false,
      })
    ).toBe(true);
    expect(
      shouldShowSelectedSchedule(generalClass, {
        dateDiff: 1,
        isYudanjaMember: false,
      })
    ).toBe(false);
    expect(isSpecialScheduleNotice(seminar)).toBe(true);
    expect(
      shouldShowSelectedSchedule(seminar, {
        dateDiff: 3,
        isYudanjaMember: false,
      })
    ).toBe(true);
    expect(
      shouldShowSelectedSchedule(yudanja, {
        dateDiff: 3,
        isYudanjaMember: true,
      })
    ).toBe(true);
    expect(
      shouldShowSelectedSchedule(yudanja, {
        dateDiff: 0,
        isYudanjaMember: false,
      })
    ).toBe(false);
    expect(
      shouldShowSelectedSchedule(yudanja, {
        dateDiff: 3,
        isYudanjaMember: false,
      })
    ).toBe(false);
  });


  test("바텀시트는 오늘 일반수업에 열리고 과거·휴관일에는 열리지 않는다", () => {
    const attended = {
      title: "오후 7시 태극권반",
      attendanceStatus: "present",
    };
    const general = { title: "오전 10시 태극권반" };
    const yudanja = { title: "월요일 유단자수련" };

    expect(
      shouldOpenScheduleBottomSheet({
        dateDiff: -1,
        dayInfo: {},
        schedules: [attended],
      })
    ).toBe(false);

    expect(
      shouldOpenScheduleBottomSheet({
        dateDiff: 0,
        dayInfo: {},
        schedules: [general],
      })
    ).toBe(true);

    expect(
      shouldOpenScheduleBottomSheet({
        dateDiff: 0,
        dayInfo: { isHoliday: true, isOpenHoliday: false },
        schedules: [general],
      })
    ).toBe(false);

    expect(
      shouldOpenScheduleBottomSheet({
        dateDiff: 1,
        dayInfo: { isHoliday: true, isOpenHoliday: true },
        schedules: [general],
      })
    ).toBe(false);

    expect(
      shouldOpenScheduleBottomSheet({
        dateDiff: 0,
        dayInfo: { isHoliday: true, isOpenHoliday: true },
        schedules: [general],
      })
    ).toBe(true);

    expect(
      shouldOpenScheduleBottomSheet({
        dateDiff: 0,
        dayInfo: {},
        schedules: [yudanja],
        isYudanjaMember: false,
      })
    ).toBe(false);

    expect(
      shouldOpenScheduleBottomSheet({
        dateDiff: 3,
        dayInfo: {},
        schedules: [yudanja],
        isYudanjaMember: true,
      })
    ).toBe(true);
  });

  test("유단자회 정기예약 설정은 일정 탭에만 둔다", () => {
    const schedule = read("app/(tabs)/schedule.jsx");
    const mypage = read("app/(tabs)/mypage.jsx");
    const recurring = read("app/recurring-reservations.jsx");

    expect(schedule).toContain("유단자회 정기예약");
    expect(schedule).toContain("매주 월요일 유단자수련 자동 예약");
    expect(schedule).toContain('router.push("/recurring-reservations")');
    expect(mypage).not.toContain("정기 출석 설정");
    expect(mypage).not.toContain('router.push("/recurring-reservations")');
    expect(recurring).not.toContain("WEEKDAY_ROWS");
    expect(recurring).toContain('sessionTimeKey: YUDANJA_SESSION_TIME_KEY');
  });

  test("주간 목표 모달은 1~15회 숫자 입력형으로 간결하게 표시한다", () => {
    const modal = read(
      "src/features/home/components/WeeklyGoalModal.jsx"
    );

    expect(modal).toContain("TextInput");
    expect(modal).toContain("WEEKLY_GOAL_MAX");
    expect(modal).toMatch(
      /getMinimumSelectableWeeklyGoal\(\r?\n\s*attendanceCount,\r?\n\s*\)/
    );
    expect(modal).toContain("이번 주 일반수련 출석");
    expect(
  modal.replace(/\s+/g, " ")
).toContain(
  "이미 출석한 횟수보다 낮게 설정할 수"
);
    expect(modal).toContain(
      "다음 주부터 적용할 목표를"
    );
    expect(modal).toContain("저장하기");
    expect(modal).not.toContain("GOAL_OPTIONS");
    expect(modal).toContain("이번 주 목표 쉬기");
    expect(modal).not.toContain("변경사항 저장");
  });

});
