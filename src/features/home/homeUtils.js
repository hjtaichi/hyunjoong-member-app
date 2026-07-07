export function pad(n) {
  return String(n).padStart(2, "0");
}

export function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

export function getDateDiffInDays(fromDateString, toDateStringValue) {
  const from = new Date(`${fromDateString}T00:00:00`);
  const to = new Date(`${toDateStringValue}T00:00:00`);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return null;
  }

  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getSessionDisplayLabel(item) {
  const title = item?.title || item?.name || "";
  const className = item?.className || "";

  if (title.includes("유단자") || className.includes("유단자")) {
    return "유단자수련";
  }

  const regularTitles = [
    "오전 10시 태극권반",
    "오후 4시 태극권반",
    "오후 7시 태극권반",
    "토요 1시 30분 태극권반",
    "현중태극권 수업",
  ];

  const isRegularTitle = regularTitles.some((text) => title.includes(text));

  if (title && !isRegularTitle) {
    return title;
  }

  const startText = item?.startTime || "";

  if (startText.includes("오전 10:00")) return "오전 10시부";
  if (startText.includes("오후 4:00")) return "오후 4시부";
  if (startText.includes("오후 7:00")) return "오후 7시부";
  if (startText.includes("오후 1:30")) return "오후 1시 30분부";

  return item?.timeLabel || title || "수업";
}

export function getSessionSubLabel(item) {
  const title = item?.title || item?.name || "현중태극권";
  if (title.includes("유단자")) return "월요일 저녁 유단자 수업";
  return "현중태극권";
}

export function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    cells.push(new Date(year, month - 1, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

export function getStatusMeta(dayInfo) {
  if (!dayInfo) {
    return { label: "", tone: "default" };
  }

  if (dayInfo.attendanceStatus === "present") {
    return { label: "", tone: "present" };
  }

  if (dayInfo.attendanceStatus === "reserved") {
    return { label: "", tone: "reserved" };
  }

  if (dayInfo.attendanceStatus === "absent") {
    return { label: "", tone: "absent" };
  }

  return { label: "", tone: "default" };
}

export function parseKoreanStartTimeToDate(dateString, startTimeText) {
  if (!dateString || !startTimeText) return null;

  const match = String(startTimeText).match(/(오전|오후)\s*(\d+):(\d+)/);
  if (!match) return null;

  const period = match[1];
  let hour = Number(match[2]);
  const minute = Number(match[3]);

  if (period === "오후" && hour !== 12) hour += 12;
  if (period === "오전" && hour === 12) hour = 0;

  return new Date(
    `${dateString}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}:00`
  );
}

export function canCheckInTodaySession(item, todayString) {
  const start = parseKoreanStartTimeToDate(todayString, item?.startTime);
  if (!start) return false;

  const now = new Date();
  const startText = item?.startTime || "";

  const checkInStart = new Date(start);
  const checkInEnd = new Date(start);

  if (startText.includes("오전 10:00")) {
    checkInStart.setHours(9, 0, 0, 0);
    checkInEnd.setHours(13, 0, 0, 0);
  } else if (startText.includes("오후 4:00")) {
    checkInStart.setHours(15, 0, 0, 0);
    checkInEnd.setHours(18, 0, 0, 0);
  } else if (startText.includes("오후 7:00")) {
    checkInStart.setHours(18, 0, 0, 0);
    checkInEnd.setHours(21, 0, 0, 0);
  } else if (startText.includes("오후 1:30")) {
    checkInStart.setHours(13, 0, 0, 0);
    checkInEnd.setHours(15, 30, 0, 0);
  } else {
    checkInStart.setHours(checkInStart.getHours() - 1);
    checkInEnd.setMinutes(checkInEnd.getMinutes() + 90);
  }

  return now >= checkInStart && now <= checkInEnd;
}

export function isWithinTodayAttendanceLockWindow(item, todayString) {
  return canCheckInTodaySession(item, todayString);
}

export function canCancelAttendance(item) {
  if (item?.attendanceStatus !== "present") return false;
  if (!item?.checkedAt) return false;

  const checkedAt = new Date(item.checkedAt);
  const now = new Date();

  const limit = new Date(checkedAt);
  limit.setMinutes(limit.getMinutes() + 10);

  return now <= limit;
}

export function getNearestCheckInSession(sessions, todayString) {
  const now = new Date();

  const candidates = sessions
    .map((item) => {
      const start = parseKoreanStartTimeToDate(todayString, item?.startTime);
      if (!start) return null;

      const checkInStart = new Date(start);
      checkInStart.setHours(checkInStart.getHours() - 1);

      const checkInEnd = new Date(start);
      checkInEnd.setMinutes(checkInEnd.getMinutes() + 90);

      const isCheckInWindow = now >= checkInStart && now <= checkInEnd;

      if (!isCheckInWindow) return null;

      return {
        item,
        diff: Math.abs(start.getTime() - now.getTime()),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.diff - b.diff);

  return candidates[0]?.item || null;
}