const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8"
  );
}

describe("training medal artwork UI contract", () => {
  const assetMap = read(
    "src/features/home/trainingMedalAssets.js"
  );
  const homeMedals = read(
    "src/features/home/components/HomeTrainingMedals.jsx"
  );
  const header = read(
    "src/features/home/components/HomeHeader.jsx"
  );
  const gallery = read("app/training-medals.jsx");

  test("maps the supplied first-half and second-half medal art", () => {
    expect(assetMap).toContain(
      "training-medal-half-1.png"
    );
    expect(assetMap).toContain(
      "training-medal-half-2.png"
    );
  });

  test("maps annual art from 2026 through 2033", () => {
    for (let year = 2026; year <= 2033; year += 1) {
      expect(assetMap).toContain(
        `training-medal-annual-${year}.png`
      );
    }
  });

  test("home uses supplied medal images inline beside greeting", () => {
    expect(homeMedals).toContain("<Image");
    expect(homeMedals).toContain(
      "getTrainingMedalImageSource"
    );
    expect(homeMedals).not.toContain(
      'position: "absolute"'
    );
    expect(header).toContain(
      'flexDirection: "row"'
    );
    expect(header).toContain(
      "<HomeTrainingMedals"
    );
  });

  test("gallery uses supplied cabinet and repeats after twelve medals", () => {
    expect(gallery).toContain(
      "TRAINING_MEDAL_CABINET_IMAGE"
    );
    expect(gallery).not.toContain("<ImageBackground");
    expect(gallery).toContain("cabinetImage");
    expect(gallery).toContain("cabinetOverlay");
    expect(gallery).toContain(
      "ITEMS_PER_CABINET = 12"
    );
    expect(gallery).toContain(
      "getTrainingMedalImageSource"
    );
    expect(gallery).toContain("CabinetSlot");
  });
});