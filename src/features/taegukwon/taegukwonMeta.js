export const FORM_DEFINITIONS = [
  {
    id: "taeguk-29",
    name: "현중태극권 29식",
    minRank: 0,
  },
  {
    id: "taeguk-fan-29",
    name: "현중태극선 29식",
    minRank: 0,
  },
  {
    id: "taeguk-sword-52",
    name: "현중태극검 52식",
    minRank: 1,
  },
  {
    id: "daega-1-79",
    name: "현중태극권 대가1로 79식",
    minRank: 2,
  },
  {
    id: "dando-24",
    name: "현중태극단도 24식",
    minRank: 2,
  },
  {
    id: "daega-2-62",
    name: "현중태극권 대가2로 62식",
    minRank: 3,
  },
];


export const FORM_IMAGES = {
  "taeguk-29": require("../../../assets/images/form-records/taeguk-29.png"),
  "taeguk-fan-29": require("../../../assets/images/form-records/taeguk-fan-29.png"),
  "taeguk-sword-52": require("../../../assets/images/form-records/taeguk-sword-52.png"),
  "dando-24": require("../../../assets/images/form-records/dando-24.png"),
  "daega-1-79": require("../../../assets/images/form-records/daega-1-79.png"),
  "daega-2-62": require("../../../assets/images/form-records/daega-2-62.png"),
};


export const FORM_IMAGE_STYLES = {
    "daega-1-79": {
    featured: {
      right: -6,
      bottom: 85,
      width: 160,
      height: 175,
      opacity: 0.85,
    },
    small: {
      right: 1,
      bottom: -7,
      width: 85,
      height: 100,
    },
  },
  "dando-24": {
    featured: {
      right: -2,
      bottom: 100,
      width: 147,
      height: 147,
      opacity: 0.85,
    },
    small: {
      right: -1,
      bottom: 10,
      width: 77,
      height: 77,
    },
  },
};

export function getFormCategory(formId) {
  if (formId?.includes("fan")) return "태극선 · 반복수련";
  if (formId?.includes("sword")) return "태극검 · 반복수련";
  if (formId?.includes("dando")) return "단도 · 반복수련";
  if (formId?.includes("daega")) return "권법 · 반복수련";
  return "권법 · 반복수련";
}

export function getStatusLabel(status) {
  if (status === "done") return "완료";
  if (status === "current") return "진행중";
  if (status === "locked") return "잠금";
  return "예정";
}