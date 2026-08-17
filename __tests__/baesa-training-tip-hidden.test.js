"use strict";

const fs = require("fs");
const path = require("path");

describe("baesa training Tip member UI policy", () => {
  test("TrainingSection hides current and history Tip UI", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src",
        "features",
        "taegukwon",
        "TrainingSection.jsx"
      ),
      "utf8"
    );

    expect(source).toContain(
      "trainingTipExcluded"
    );
    expect(source).toContain(
      'display: "none"'
    );
    expect(source).toContain(
      "coachingInlineText"
    );
    expect(source).toContain(
      "disabled={trainingTipExcluded}"
    );
  });

  test("DUPLICATE_STYLE_CONTRACT_V1 history button has one merged style prop", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src",
        "features",
        "taegukwon",
        "TrainingSection.jsx"
      ),
      "utf8"
    );

    expect(source).not.toMatch(
      /style=\{trainingTipExcluded\s*\?[^\n]+\}\s*\r?\n\s*disabled=\{trainingTipExcluded\}\s*\r?\n\s*style=\{tipHistoryStyles\.historyButton\}/
    );

    expect(source).toMatch(
      /tipHistoryStyles\.historyButton,[\s\S]{0,120}trainingTipExcluded\s*&&\s*\{\s*display:\s*"none"\s*\}/
    );
  });
});
