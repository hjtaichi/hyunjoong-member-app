export function getRankBadgeColors(rankLevel) {
  switch (Number(rankLevel)) {
    case 1:
      return { backgroundColor: "#F4E4C8", borderColor: "#E1C99E", textColor: "#7A4F1E" };
    case 2:
      return { backgroundColor: "#E8D8BE", borderColor: "#C9AA78", textColor: "#5F4633" };
    case 3:
      return { backgroundColor: "#D8C4A3", borderColor: "#B8925F", textColor: "#4A3324" };
    case 4:
      return { backgroundColor: "#C89E6A", borderColor: "#A9793E", textColor: "#FFFFFF" };
    case 5:
      return { backgroundColor: "#6B4F46", borderColor: "#4B352F", textColor: "#FFFFFF" };
    default:
      return { backgroundColor: "#F5EAE4", borderColor: "#DCC6BE", textColor: "#76564B" };
  }
}