const listeners = new Set();

export function emitAttendanceDataChanged() {
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch (error) {
      console.log("출석 데이터 갱신 이벤트 처리 실패:", error);
    }
  }
}

export function subscribeAttendanceDataChanged(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}