const fs = require("fs");
const path = require("path");

function exists(rel) {
  return fs.existsSync(path.join(process.cwd(), rel));
}

function read(rel) {
  return fs.readFileSync(
    path.join(process.cwd(), rel),
    "utf8"
  );
}

describe("training medal final precommit contract", () => {
  const api = read("src/api/memberTrainingMedals.js");
  const gallery = read("app/training-medals.jsx");

  test("preview-only code is absent", () => {
    expect(
      exists(
        "src/features/home/trainingMedalPreview.js"
      )
    ).toBe(false);

    expect(api).not.toContain(
      "TRAINING_MEDAL_PREVIEW_DATA"
    );
    expect(api).not.toContain(
      "isTrainingMedalPreviewEnabled"
    );
    expect(api).not.toContain(
      "trainingMedalPreview"
    );
  });

  test("real authenticated medal API remains", () => {
    expect(api).toContain("client.get(");
    expect(api).toContain(
      '"/api/member/me/training-medals"'
    );
  });

  test("gallery is latest-first", () => {
    expect(gallery).toContain(
      "new Date(b.earnedAt || 0).getTime()"
    );
    expect(gallery).toContain(
      "return earnedDiff"
    );
  });

  test("gallery is paginated twelve medals per cabinet", () => {
    expect(gallery).toContain(
      "ITEMS_PER_CABINET = 12"
    );
    expect(gallery).toContain(
      "<Cabinet items={currentCabinetItems} />"
    );
    expect(gallery).toContain("pageCount");
  });

  test("final visual details are preserved", () => {
    expect(gallery).toContain(
      "TRAINING_MEDAL_ORNAMENT_IMAGE"
    );
    expect(gallery).toContain(
      "aspectRatio: 1150 / 2000"
    );
    expect(gallery).toContain(
      'fontFamily: "MaruBuriBold"'
    );
    expect(gallery).toContain(
      "목표를 이루며 쌓아온 수련의 시간을"
    );
    expect(gallery).toContain(
      "한 자리에서 돌아보세요."
    );
  });
});