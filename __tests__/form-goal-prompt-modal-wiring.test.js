const fs = require("fs");
const path = require("path");

function read(rel) {
  return fs.readFileSync(
    path.join(process.cwd(), rel),
    "utf8"
  );
}

describe("form goal custom prompt modal wiring", () => {
  const screenHook = read(
    "src/features/taegukwon/useTaegukwonScreen.js"
  );
  const screen = read(
    "app/(tabs)/taegukwon.jsx"
  );
  const modal = read(
    "src/features/taegukwon/FormGoalPromptModal.jsx"
  );

  test("useTaegukwonScreen receives and returns prompt state", () => {
    expect(
      (screenHook.match(/formGoalPrompt,/g) || []).length
    ).toBeGreaterThanOrEqual(2);

    expect(
      (screenHook.match(/closeFormGoalPrompt,/g) || []).length
    ).toBeGreaterThanOrEqual(2);

    expect(
      (screenHook.match(/confirmFormGoalPrompt,/g) || []).length
    ).toBeGreaterThanOrEqual(2);
  });

  test("taegukwon screen renders the custom prompt modal", () => {
    expect(screen).toContain(
      'import FormGoalPromptModal from "../../src/features/taegukwon/FormGoalPromptModal";'
    );
    expect(screen).toContain(
      "<FormGoalPromptModal"
    );
    expect(screen).toContain(
      "mode={formGoalPrompt?.mode}"
    );
    expect(screen).toContain(
      "onConfirm={confirmFormGoalPrompt}"
    );
    expect(screen).toContain(
      "onClose={closeFormGoalPrompt}"
    );
  });

  test("modal supports two-button confirm and one-button notice modes", () => {
    expect(modal).toContain(
      'const isConfirm = mode === "confirm";'
    );
    expect(modal).toContain(
      "{isConfirm ? ("
    );
    expect(modal).toContain(
      "styles.cancelButton"
    );
    expect(modal).toContain(
      "styles.confirmButton"
    );
    expect(modal).toContain(
      "styles.singleButton"
    );
  });

  test("modal keeps the warm member-app visual tone", () => {
    expect(modal).toContain(
      'backgroundColor: "#FFFDF9"'
    );
    expect(modal).toContain(
      'backgroundColor: "#866152"'
    );
    expect(modal).toContain(
      'fontFamily: "MaruBuriBold"'
    );
  });

  test("prompt body remains comfortably readable after visual tuning", () => {
    const blockMatch = modal.match(
      /message:\s*\{([\s\S]*?)\n\s*\},/
    );

    expect(blockMatch).not.toBeNull();

    const block = blockMatch[1];

    const fontSizeMatch = block.match(
      /fontSize:\s*(\d+)/
    );
    const lineHeightMatch = block.match(
      /lineHeight:\s*(\d+)/
    );

    expect(fontSizeMatch).not.toBeNull();
    expect(lineHeightMatch).not.toBeNull();

    const fontSize = Number(fontSizeMatch[1]);
    const lineHeight = Number(lineHeightMatch[1]);

    expect(fontSize).toBeGreaterThanOrEqual(15);
    expect(lineHeight).toBeGreaterThanOrEqual(
      fontSize
    );
  });
});
