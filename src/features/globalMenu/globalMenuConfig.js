export const GLOBAL_MENU_DRAWER_RATIO = 0.55;

export const GLOBAL_MENU_SECTIONS = Object.freeze([
  {
    key: "home",
    label: "홈",
    icon: "home-outline",
    items: [
      {
        key: "today-training",
        label: "오늘의 수련",
        pathname: "/(tabs)/home",
        params: { menuAction: "today" },
      },
      {
        key: "attendance-check",
        label: "출석하기",
        pathname: "/qr-attendance",
      },
      {
        key: "attendance-status",
        label: "출석 현황",
        pathname: "/(tabs)/home",
        params: { menuAction: "attendance" },
      },
      {
        key: "weekly-goal",
        label: "주간 출석 목표 설정",
        pathname: "/(tabs)/home",
        params: { menuAction: "weeklyGoal" },
      },
    ],
  },
  {
    key: "taegukwon",
    label: "태극권",
    icon: "body-outline",
    items: [
      {
        key: "personal-progress",
        label: "나의 수련 진도",
        pathname: "/(tabs)/taegukwon",
        params: { tab: "training" },
      },
      {
        key: "training-journey",
        label: "수련 과정",
        pathname: "/training-journey",
      },
      {
        key: "coaching-videos",
        label: "내 수련 영상 올리기",
        pathname: "/coaching-videos",
      },
      {
        key: "movement-dictionary",
        label: "투로명이 궁금해요",
        pathname: "/movement-dictionary",
      },
      {
        key: "gongbeop",
        label: "공력 기록",
        pathname: "/(tabs)/taegukwon",
        params: { tab: "gongbeop" },
      },
      {
        key: "form-record",
        label: "투로 기록",
        pathname: "/(tabs)/taegukwon",
        params: { tab: "formRecord" },
      },
      {
        key: "yudanja",
        label: "유단자 전용",
        pathname: "/yudanja",
        permission: "yudanja",
        lockedVisible: true,
      },
      {
        key: "private-lessons",
        label: "개인지도",
        pathname: "/private-lessons",
        permission: "privateLesson",
        lockedVisible: true,
      },
    ],
  },
  {
    key: "schedule",
    label: "일정",
    icon: "calendar-outline",
    items: [
      {
        key: "weekly-schedule",
        label: "이번 주 수련 일정",
        pathname: "/(tabs)/schedule",
        params: { view: "list" },
      },
      {
        key: "calendar-view",
        label: "달력으로 보기",
        pathname: "/(tabs)/schedule",
        params: { view: "calendar" },
      },
      {
        key: "list-view",
        label: "목록으로 보기",
        pathname: "/(tabs)/schedule",
        params: { view: "list" },
      },
      {
        key: "yudanja-reservation",
        label: "유단자회 예약",
        pathname: "/(tabs)/schedule",
        params: {
          view: "calendar",
          menuAction: "yudanjaReservation",
        },
        permission: "yudanja",
        hiddenWhenLocked: true,
      },
      {
        key: "yudanja-recurring",
        label: "유단자회 정기예약",
        pathname: "/recurring-reservations",
        permission: "yudanja",
        hiddenWhenLocked: true,
      },
    ],
  },
  {
    key: "inquiry",
    label: "소식/문의",
    icon: "chatbubble-ellipses-outline",
    items: [
      {
        key: "important-notice",
        label: "중요 공지",
        pathname: "/(tabs)/inquiry",
        params: { tab: "notice" },
      },
      {
        key: "all-notices",
        label: "전체 공지",
        pathname: "/notice",
      },
      {
        key: "dojang-album",
        label: "도장 앨범",
        pathname: "/dojang-album",
      },
      {
        key: "training-guide",
        label: "수련 가이드",
        pathname: "/(tabs)/inquiry/guide",
      },
      {
        key: "training-schedule",
        label: "수련 시간표",
        pathname: "/(tabs)/inquiry/schedule",
      },
      {
        key: "faq",
        label: "자주 묻는 질문",
        pathname: "/(tabs)/inquiry/faq",
      },
      {
        key: "shop",
        label: "수련용품 Shop",
        pathname: "/shop",
      },
      {
        key: "inquiry-list",
        label: "문의 내역",
        pathname: "/(tabs)/inquiry/all",
      },
      {
        key: "new-inquiry",
        label: "문의 남기기",
        pathname: "/(tabs)/inquiry",
        params: { tab: "inquiry", menuAction: "startInquiry" },
      },
    ],
  },
  {
    key: "mypage",
    label: "내정보",
    icon: "person-outline",
    items: [
      {
        key: "profile",
        label: "내 프로필",
        pathname: "/(tabs)/mypage",
      },
      {
        key: "payment",
        label: "회비 상태",
        pathname: "/(tabs)/mypage",
        params: { menuAction: "payment" },
      },
      {
        key: "yudanja-card",
        label: "유단자회 회원증",
        pathname: "/(tabs)/mypage",
        params: { menuAction: "yudanjaCard" },
        permission: "yudanja",
        hiddenWhenLocked: true,
      },
      {
        key: "training-history",
        label: "수련 History",
        pathname: "/training-history",
      },
      {
        key: "trial-application",
        label: "함께 수련하기",
        pathname: "/trial-application",
      },
      {
        key: "notification-settings",
        label: "알림 설정",
        pathname: "/notification-settings",
      },
      {
        key: "profile-edit",
        label: "내 정보 설정",
        pathname: "/profile-edit",
      },
    ],
  },
]);

export function filterGlobalMenuSections({
  canAccessYudanja = false,
  hasPrivateLessonAccess = false,
  isPausedMember = false,
} = {}) {
  const permissionMap = {
    yudanja: canAccessYudanja,
    privateLesson: hasPrivateLessonAccess,
  };

  const sourceSections = isPausedMember
    ? GLOBAL_MENU_SECTIONS.filter((section) => section.key === "inquiry")
    : GLOBAL_MENU_SECTIONS;

  return sourceSections.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => {
        if (!item.permission) return true;
        if (permissionMap[item.permission]) return true;
        return item.hiddenWhenLocked !== true;
      })
      .map((item) => ({
        ...item,
        locked: item.permission
          ? permissionMap[item.permission] !== true
          : false,
      })),
  }));
}
