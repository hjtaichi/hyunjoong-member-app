export const TRAINING_MEDAL_HALF_IMAGES = {
  1: require("../../../assets/images/training-medals/training-medal-half-1.png"),
  2: require("../../../assets/images/training-medals/training-medal-half-2.png"),
};

export const TRAINING_MEDAL_ANNUAL_IMAGES = {
  2026: require("../../../assets/images/training-medals/training-medal-annual-2026.png"),
  2027: require("../../../assets/images/training-medals/training-medal-annual-2027.png"),
  2028: require("../../../assets/images/training-medals/training-medal-annual-2028.png"),
  2029: require("../../../assets/images/training-medals/training-medal-annual-2029.png"),
  2030: require("../../../assets/images/training-medals/training-medal-annual-2030.png"),
  2031: require("../../../assets/images/training-medals/training-medal-annual-2031.png"),
  2032: require("../../../assets/images/training-medals/training-medal-annual-2032.png"),
  2033: require("../../../assets/images/training-medals/training-medal-annual-2033.png"),
};

export const TRAINING_MEDAL_CABINET_IMAGE = require(
  "../../../assets/images/training-medals/training-medal-cabinet.png"
);

export function getTrainingMedalImageSource(medal) {
  if (!medal) return null;

  if (medal.type === "annual") {
    return TRAINING_MEDAL_ANNUAL_IMAGES[Number(medal.year)] || null;
  }

  return TRAINING_MEDAL_HALF_IMAGES[Number(medal.half)] || null;
}