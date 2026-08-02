// HJTAICHI_MEMBER_BADGE_ASSETS_V1
export const MEMBER_BADGE_ASSETS = Object.freeze({
  YUDANJA_ASSOCIATION: require("../../../assets/badges/badge_yudanja_association.png"),
  BAESA_DISCIPLE: require("../../../assets/badges/badge_baesa_disciple.png"),
  HYUNJOONG_INSTRUCTOR_COURSE: require("../../../assets/badges/badge_instructor_course.png"),
  SPORTS_INSTRUCTOR_L2: require("../../../assets/badges/badge_sports_instructor_l2.png"),
  PREVIOUS_MONTH_GOAL_100: require("../../../assets/badges/badge_previous_month_goal_100.png"),
  PREVIOUS_WEEK_GOAL_ACHIEVED: require("../../../assets/badges/badge_previous_week_goal_achieved.png"),
});

export function getMemberBadgeImageSource(code) {
  return MEMBER_BADGE_ASSETS[String(code || "")] || null;
}
