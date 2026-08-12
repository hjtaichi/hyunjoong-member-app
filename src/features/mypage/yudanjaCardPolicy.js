const STEM_THEMES = [
  "blue",
  "blue",
  "red",
  "red",
  "yellow",
  "yellow",
  "white",
  "white",
  "black",
  "black",
];

export function getYudanjaCardTheme(yearValue) {
  const year = Number(yearValue);

  if (!Number.isInteger(year)) {
    return "red";
  }

  const stemIndex = ((year - 4) % 10 + 10) % 10;
  return STEM_THEMES[stemIndex];
}