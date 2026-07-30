export const DOBOK_V9_STYLE_LABELS = {
  straight: "일자형",
  chest: "가슴 사선형",
  "diagonal-waist": "가슴~허리 사선형",
};

export const DOBOK_V9_SLEEVE_LABELS = {
  plain: "단추 없음",
  "2button": "단추 2개",
  "3button": "단추 3개",
};

/*
 * The handwritten numbers in the photographed charts are intentionally not
 * treated as confirmed product codes. IDs below describe physical positions.
 * Replace labels/codes only after the owner confirms the chart mapping.
 */
export const DOBOK_V9_FABRIC_GROUPS = [
  {
    key: "fabricA",
    label: "원단 A",
    description: "첫 번째 색상표 · 위치 기준 임시 식별",
    futureTexture: {
      enabled: false,
      textureAsset: null,
      blendMode: "multiply",
      opacity: 0,
      roughness: null,
      sheen: null,
    },
    colors: [
      { key: "a-left-01", position: "왼쪽 1", label: "A 왼쪽 1", hex: "#EF4038" },
      { key: "a-left-02", position: "왼쪽 2", label: "A 왼쪽 2", hex: "#EBC4D8" },
      { key: "a-left-03", position: "왼쪽 3", label: "A 왼쪽 3", hex: "#CF245A" },
      { key: "a-left-04", position: "왼쪽 4", label: "A 왼쪽 4", hex: "#EA4D78" },
      { key: "a-left-05", position: "왼쪽 5", label: "A 왼쪽 5", hex: "#314A93" },
      { key: "a-left-06", position: "왼쪽 6", label: "A 왼쪽 6", hex: "#E7CED2" },
      { key: "a-left-07", position: "왼쪽 7", label: "A 왼쪽 7", hex: "#4C287A" },
      { key: "a-left-08", position: "왼쪽 8", label: "A 왼쪽 8", hex: "#A8ADB2" },
      { key: "a-left-09", position: "왼쪽 9", label: "A 왼쪽 9", hex: "#F39A73" },
      { key: "a-left-10", position: "왼쪽 10", label: "A 왼쪽 10", hex: "#403C40" },
      { key: "a-right-01", position: "오른쪽 1", label: "A 오른쪽 1", hex: "#E86C48" },
      { key: "a-right-02", position: "오른쪽 2", label: "A 오른쪽 2", hex: "#AFC8EC" },
      { key: "a-right-03", position: "오른쪽 3", label: "A 오른쪽 3", hex: "#EA485A" },
      { key: "a-right-04", position: "오른쪽 4", label: "A 오른쪽 4", hex: "#DDB94C" },
      { key: "a-right-05", position: "오른쪽 5", label: "A 오른쪽 5", hex: "#BBA9D9" },
      { key: "a-right-06", position: "오른쪽 6", label: "A 오른쪽 6", hex: "#258598" },
      { key: "a-right-07", position: "오른쪽 7", label: "A 오른쪽 7", hex: "#D8D8D1" },
      { key: "a-right-08", position: "오른쪽 8", label: "A 오른쪽 8", hex: "#183D93" },
      { key: "a-right-09", position: "오른쪽 9", label: "A 오른쪽 9", hex: "#363B4D" },
      { key: "a-right-10", position: "오른쪽 10", label: "A 오른쪽 10", hex: "#52AE9D" },
      { key: "a-right-11", position: "오른쪽 11", label: "A 오른쪽 11", hex: "#111317" },
    ],
  },
  {
    key: "fabricB",
    label: "원단 B",
    description: "두 번째 색상표 · 위치 기준 임시 식별",
    futureTexture: {
      enabled: false,
      textureAsset: null,
      blendMode: "multiply",
      opacity: 0,
      roughness: null,
      sheen: null,
    },
    colors: [
      { key: "b-left-01", position: "왼쪽 위 1", label: "B 왼쪽 위 1", hex: "#5B153E" },
      { key: "b-left-02", position: "왼쪽 위 2", label: "B 왼쪽 위 2", hex: "#2E3F9B" },
      { key: "b-left-03", position: "왼쪽 위 3", label: "B 왼쪽 위 3", hex: "#A94856" },
      { key: "b-left-04", position: "왼쪽 아래 1", label: "B 왼쪽 아래 1", hex: "#D8B9A6" },
      { key: "b-left-05", position: "왼쪽 아래 2", label: "B 왼쪽 아래 2", hex: "#9A9D63" },
      { key: "b-left-06", position: "왼쪽 아래 3", label: "B 왼쪽 아래 3", hex: "#F5F4EB" },
      { key: "b-left-07", position: "왼쪽 아래 4", label: "B 왼쪽 아래 4", hex: "#C7D2B5" },
      { key: "b-left-08", position: "왼쪽 아래 5", label: "B 왼쪽 아래 5", hex: "#A994BD" },
      { key: "b-left-09", position: "왼쪽 아래 6", label: "B 왼쪽 아래 6", hex: "#EDA274" },
      { key: "b-middle-01", position: "가운데 1", label: "B 가운데 1", hex: "#111114" },
      { key: "b-middle-02", position: "가운데 2", label: "B 가운데 2", hex: "#9E4932" },
      { key: "b-middle-03", position: "가운데 3", label: "B 가운데 3", hex: "#D8C9BA" },
      { key: "b-middle-04", position: "가운데 4", label: "B 가운데 4", hex: "#A8ACB4" },
      { key: "b-middle-05", position: "가운데 5", label: "B 가운데 5", hex: "#D0A56E" },
      { key: "b-middle-06", position: "가운데 6", label: "B 가운데 6", hex: "#AA7774" },
      { key: "b-middle-07", position: "가운데 7", label: "B 가운데 7", hex: "#B39C8B" },
      { key: "b-middle-08", position: "가운데 8", label: "B 가운데 8", hex: "#7FA5A5" },
      { key: "b-middle-09", position: "가운데 9", label: "B 가운데 9", hex: "#A32034" },
      { key: "b-middle-10", position: "가운데 10", label: "B 가운데 10", hex: "#847885" },
      { key: "b-middle-11", position: "가운데 11", label: "B 가운데 11", hex: "#E0B84F" },
      { key: "b-middle-12", position: "가운데 12", label: "B 가운데 12", hex: "#15313B" },
      { key: "b-middle-13", position: "가운데 13", label: "B 가운데 13", hex: "#91A8CA" },
      { key: "b-middle-14", position: "가운데 14", label: "B 가운데 14", hex: "#95555F" },
      { key: "b-middle-15", position: "가운데 15", label: "B 가운데 15", hex: "#173B6A" },
      { key: "b-middle-16", position: "가운데 16", label: "B 가운데 16", hex: "#E32636" },
      { key: "b-right-01", position: "오른쪽 1", label: "B 오른쪽 1", hex: "#17171A" },
      { key: "b-right-02", position: "오른쪽 2", label: "B 오른쪽 2", hex: "#B8CEB5" },
      { key: "b-right-03", position: "오른쪽 3", label: "B 오른쪽 3", hex: "#797078" },
      { key: "b-right-04", position: "오른쪽 4", label: "B 오른쪽 4", hex: "#9BAACA" },
      { key: "b-right-05", position: "오른쪽 5", label: "B 오른쪽 5", hex: "#17192E" },
      { key: "b-right-06", position: "오른쪽 6", label: "B 오른쪽 6", hex: "#C6B6D6" },
      { key: "b-right-07", position: "오른쪽 7", label: "B 오른쪽 7", hex: "#51414C" },
      { key: "b-right-08", position: "오른쪽 8", label: "B 오른쪽 8", hex: "#C9A1A5" },
      { key: "b-right-09", position: "오른쪽 9", label: "B 오른쪽 9", hex: "#17726F" },
      { key: "b-right-10", position: "오른쪽 10", label: "B 오른쪽 10", hex: "#D9B7B1" },
      { key: "b-right-11", position: "오른쪽 11", label: "B 오른쪽 11", hex: "#72182C" },
      { key: "b-right-12", position: "오른쪽 12", label: "B 오른쪽 12", hex: "#D5C9C1" },
      { key: "b-right-13", position: "오른쪽 13", label: "B 오른쪽 13", hex: "#294550" },
      { key: "b-right-14", position: "오른쪽 14", label: "B 오른쪽 14", hex: "#F1F0E9" },
      { key: "b-right-15", position: "오른쪽 15", label: "B 오른쪽 15", hex: "#182425" },
    ],
  },
];

export const DOBOK_V9_EMBROIDERY_CONFIG = {
  linkedColorByDefault: true,
  zones: {
    chest: { enabled: true },
    collar: { enabled: false },
    leftCuff: { enabled: false },
    rightCuff: { enabled: false },
  },
};

/*
 * Placement is kept in one editable config. Values are pixels in the original
 * 1024 x 1536 coordinate space. Cloud images stay horizontal and unrotated.
 */
export const DOBOK_V9_EMBROIDERY_LAYOUTS = {
  "female-straight-plain": {
    "chest": {
      "left": 570,
      "top": 383,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 430,
      "top": 320,
      "width": 30,
      "height": 17,
      "rotation": 45,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 492,
      "top": 307,
      "width": 28,
      "height": 20,
      "rotation": 27,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 532,
      "top": 305,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 557,
      "top": 287,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 310,
      "top": 721,
      "width": 60,
      "height": 35,
      "rotation": 0,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 670,
      "top": 721,
      "width": 60,
      "height": 35,
      "rotation": 0,
      "count": 1,
      "gap": 14
    }
  },
  "female-straight-2button": {
    "chest": {
      "left": 545,
      "top": 345,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 457,
      "top": 281,
      "width": 31,
      "height": 17,
      "rotation": 0,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 480,
      "top": 266,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 521,
      "top": 265,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 544,
      "top": 250,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 334,
      "top": 685,
      "width": 50,
      "height": 27,
      "rotation": 0,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 645,
      "top": 685,
      "width": 50,
      "height": 27,
      "rotation": 0,
      "count": 1,
      "gap": 14
    }
  },
  "female-straight-3button": {
    "chest": {
      "left": 545,
      "top": 410,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 457,
      "top": 281,
      "width": 31,
      "height": 17,
      "rotation": 0,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 473,
      "top": 308,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 516,
      "top": 310,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 540,
      "top": 293,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 317,
      "top": 740,
      "width": 50,
      "height": 27,
      "rotation": -8.5,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 645,
      "top": 740,
      "width": 50,
      "height": 27,
      "rotation": -6.5,
      "count": 1,
      "gap": 14
    }
  },
  "female-chest-plain": {
    "chest": {
      "left": 540,
      "top": 380,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 457,
      "top": 281,
      "width": 31,
      "height": 17,
      "rotation": 0,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 478,
      "top": 291,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 517,
      "top": 288,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 545,
      "top": 271,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 305,
      "top": 705,
      "width": 60,
      "height": 35,
      "rotation": 0,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 660,
      "top": 705,
      "width": 60,
      "height": 35,
      "rotation": 0,
      "count": 1,
      "gap": 14
    }
  },
  "female-chest-2button": {
    "chest": {
      "left": 540,
      "top": 370,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 457,
      "top": 281,
      "width": 28,
      "height": 20,
      "rotation": 30,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 486,
      "top": 279,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 522,
      "top": 280,
      "width": 28,
      "height": 15,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 549,
      "top": 263,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 330,
      "top": 708,
      "width": 50,
      "height": 27,
      "rotation": -12,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 650,
      "top": 708,
      "width": 50,
      "height": 27,
      "rotation": -5.5,
      "count": 1,
      "gap": 14
    }
  },
  "female-chest-3button": {
    "chest": {
      "left": 545,
      "top": 380,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 457,
      "top": 281,
      "width": 31,
      "height": 17,
      "rotation": 0,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 484,
      "top": 280,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 524,
      "top": 280,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 549,
      "top": 267,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 318,
      "top": 730,
      "width": 50,
      "height": 27,
      "rotation": -6,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 660,
      "top": 730,
      "width": 50,
      "height": 27,
      "rotation": -1,
      "count": 1,
      "gap": 14
    }
  },
  "female-diagonal-waist-plain": {
    "chest": {
      "left": 540,
      "top": 395,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 457,
      "top": 281,
      "width": 31,
      "height": 17,
      "rotation": 0,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 486,
      "top": 304,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 529,
      "top": 304,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 552,
      "top": 291,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 320,
      "top": 716,
      "width": 60,
      "height": 35,
      "rotation": 0,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 660,
      "top": 716,
      "width": 60,
      "height": 35,
      "rotation": 0,
      "count": 1,
      "gap": 14
    }
  },
  "female-diagonal-waist-2button": {
    "chest": {
      "left": 550,
      "top": 390,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 457,
      "top": 281,
      "width": 28,
      "height": 20,
      "rotation": 0,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 497,
      "top": 302,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 539,
      "top": 303,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 564,
      "top": 287,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 334,
      "top": 753,
      "width": 49,
      "height": 27,
      "rotation": -12.5,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 661,
      "top": 753,
      "width": 49,
      "height": 27,
      "rotation": 6.5,
      "count": 1,
      "gap": 14
    }
  },
  "female-diagonal-waist-3button": {
    "chest": {
      "left": 540,
      "top": 370,
      "width": 65,
      "height": 60,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 457,
      "top": 281,
      "width": 31,
      "height": 17,
      "rotation": 0,
      "count": 0,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 475,
      "top": 292,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 516,
      "top": 289,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 541,
      "top": 275,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 315,
      "top": 754,
      "width": 49,
      "height": 27,
      "rotation": -9,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 650,
      "top": 747,
      "width": 49,
      "height": 27,
      "rotation": -5,
      "count": 1,
      "gap": 14
    }
  },
  "male-straight-plain": {
    "chest": {
      "left": 570,
      "top": 390,
      "width": 70,
      "height": 65,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 459,
      "top": 278,
      "width": 28,
      "height": 20,
      "rotation": 30,
      "count": 1,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 485,
      "top": 296,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 527,
      "top": 292,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 555,
      "top": 279,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 290,
      "top": 730,
      "width": 60,
      "height": 35,
      "rotation": 0,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 680,
      "top": 730,
      "width": 60,
      "height": 35,
      "rotation": -7.5,
      "count": 1,
      "gap": 14
    }
  },
  "male-straight-2button": {
    "chest": {
      "left": 575,
      "top": 400,
      "width": 70,
      "height": 65,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 472,
      "top": 291,
      "width": 28,
      "height": 20,
      "rotation": 28,
      "count": 1,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 497,
      "top": 306,
      "width": 28,
      "height": 20,
      "rotation": 20,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 536,
      "top": 308,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 562,
      "top": 290,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 320,
      "top": 735,
      "width": 50,
      "height": 27,
      "rotation": 0,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 675,
      "top": 735,
      "width": 50,
      "height": 27,
      "rotation": 0,
      "count": 1,
      "gap": 14
    }
  },
  "male-straight-3button": {
    "chest": {
      "left": 560,
      "top": 380,
      "width": 70,
      "height": 65,
      "rotation": 0,
      "count": 1,
      "gap": 12
    },
    "collarLeftOuter": {
      "left": 468,
      "top": 286,
      "width": 28,
      "height": 20,
      "rotation": 23,
      "count": 1,
      "gap": 10
    },
    "collarLeftInner": {
      "left": 490,
      "top": 304,
      "width": 28,
      "height": 20,
      "rotation": 30,
      "count": 1,
      "gap": 9
    },
    "collarRightInner": {
      "left": 528,
      "top": 302,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 9
    },
    "collarRightOuter": {
      "left": 555,
      "top": 285,
      "width": 28,
      "height": 20,
      "rotation": -45,
      "count": 1,
      "gap": 10
    },
    "leftCuff": {
      "left": 320,
      "top": 714,
      "width": 50,
      "height": 27,
      "rotation": -20.5,
      "count": 1,
      "gap": 14
    },
    "rightCuff": {
      "left": 665,
      "top": 714,
      "width": 50,
      "height": 27,
      "rotation": 0,
      "count": 1,
      "gap": 14
    }
  }
};

export function getFabricGroup(key) {
  return DOBOK_V9_FABRIC_GROUPS.find((item) => item.key === key) ?? DOBOK_V9_FABRIC_GROUPS[0];
}

export function getFabricColor(groupKey, colorKey) {
  const group = getFabricGroup(groupKey);
  return group.colors.find((item) => item.key === colorKey) ?? group.colors[0];
}
