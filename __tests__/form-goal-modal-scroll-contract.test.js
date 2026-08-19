const fs = require("fs");
const path = require("path");

describe("FormGoalModal small-screen scroll contract", () => {
  const modalPath = path.join(
    process.cwd(),
    "src",
    "features",
    "taegukwon",
    "FormGoalModal.jsx",
  );

  const stylePath = path.join(
    process.cwd(),
    "src",
    "features",
    "taegukwon",
    "taegukwonStyles.js",
  );

  const modalSource = fs.readFileSync(modalPath, "utf8");
  const styleSource = fs.readFileSync(stylePath, "utf8");

  test("uses an internal ScrollView for variable-height goal content", () => {
    expect(modalSource).toContain("ScrollView");
    expect(modalSource).toContain(
      "style={styles.formGoalModalScroll}",
    );
    expect(modalSource).toContain(
      "contentContainerStyle={styles.formGoalModalScrollContent}",
    );
    expect(modalSource).toContain(
      'keyboardShouldPersistTaps="handled"',
    );
  });

  test("keeps the action buttons outside the scroll body", () => {
    const scrollStart = modalSource.indexOf(
      "style={styles.formGoalModalScroll}",
    );

    const scrollEnd = modalSource.indexOf(
      "</ScrollView>",
      scrollStart,
    );

    const buttonRow = modalSource.indexOf(
      "style={styles.formModalButtonRow}",
    );

    expect(scrollStart).toBeGreaterThan(-1);
    expect(scrollEnd).toBeGreaterThan(scrollStart);
    expect(buttonRow).toBeGreaterThan(scrollEnd);
  });

  test("scroll area can shrink inside the modal max-height boundary", () => {
    expect(styleSource).toMatch(
      /formGoalModalScroll\s*:\s*\{[\s\S]*?flexShrink\s*:\s*1/,
    );

    expect(styleSource).toMatch(
      /formGoalModalScroll\s*:\s*\{[\s\S]*?minHeight\s*:\s*0/,
    );

    expect(styleSource).toMatch(
      /formRecordModalCard\s*:\s*\{[\s\S]*?maxHeight\s*:\s*"86%"/,
    );
  });
});