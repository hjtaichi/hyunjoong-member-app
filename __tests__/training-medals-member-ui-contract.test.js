const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8"
  );
}

describe("member training medals UI contract", () => {
  const api = read(
    "src/api/memberTrainingMedals.js"
  );
  const hook = read(
    "src/features/home/useHomeScreen.js"
  );
  const header = read(
    "src/features/home/components/HomeHeader.jsx"
  );
  const medalComponent = read(
    "src/features/home/components/HomeTrainingMedals.jsx"
  );
  const home = read("app/(tabs)/home.jsx");
  const gallery = read("app/training-medals.jsx");

  test("uses shared authenticated client", () => {
    expect(api).toContain(
      'import client from "./client"'
    );
    expect(api).toContain(
      '"/api/member/me/training-medals"'
    );
  });

  test("home fetches medals without blocking core home data", () => {
    expect(hook).toContain(
      "getMemberTrainingMedals"
    );
    expect(hook).toContain("trainingMedals");
    expect(hook).toContain("collection: []");
  });

  test("home renders max three representative medal images", () => {
    expect(header).toContain(
      "<HomeTrainingMedals"
    );
    expect(header).toContain(
      "trainingMedals = []"
    );
    expect(medalComponent).toContain(
      "getTrainingMedalImageSource"
    );
    expect(medalComponent).toContain(
      ".slice(0, 3)"
    );
    expect(medalComponent).toContain("<Image");
  });

  test("home opens training medal gallery", () => {
    expect(home).toContain(
      'trainingMedals={trainingMedals?.home || []}'
    );
    expect(home).toContain(
      'router.push("/training-medals")'
    );
  });

  test("gallery reuses canonical form names and renders annual plus per-form medals", () => {
    expect(gallery).toContain(
      "FORM_DEFINITIONS"
    );
    expect(gallery).toContain(
      "수련의 결실"
    );
    expect(gallery).toContain(
      "data?.collection"
    );
    expect(gallery).toContain(
      "data?.annual"
    );
    expect(gallery).toContain(
      "getTrainingMedalImageSource"
    );
    expect(gallery).toContain(
      "TRAINING_MEDAL_CABINET_IMAGE"
    );
  });
});