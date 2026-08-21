const fs = require("fs");
const path = require("path");

const hook = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/features/taegukwon/useFormRecords.js"
  ),
  "utf8"
);

describe("form goal no-decrease + custom modal behavior", () => {
  test("started goal decrease is blocked before API save", () => {
    expect(hook).toContain(
      "HJTAICHI_FORM_GOAL_CLIENT_NO_DECREASE"
    );
    expect(hook).toContain(
      "existingCurrentCount > 0"
    );
    expect(hook).toContain(
      "targetCountValue < existingTargetCount"
    );
    expect(hook).toContain(
      "await showFormGoalNotice({"
    );
  });

  test("decrease notice keeps the actual original target dynamically", () => {
    const guardStart = hook.indexOf(
      "HJTAICHI_FORM_GOAL_CLIENT_NO_DECREASE"
    );
    const nextFlow = hook.indexOf(
      "const isInitialGoal",
      guardStart
    );

    expect(guardStart).toBeGreaterThanOrEqual(0);
    expect(nextFlow).toBeGreaterThan(guardStart);

    const guardBlock = hook.slice(
      guardStart,
      nextFlow
    );

    expect(guardBlock).toContain(
      "existingTargetCount"
    );
    expect(guardBlock).toContain(
      "showFormGoalNotice"
    );
    expect(guardBlock).toContain(
      "setFormGoalModalVisible(false)"
    );
    expect(guardBlock).toContain(
      "setFormGoalModalVisible(true)"
    );
  });

  test("initial and changed goals both require custom confirmation", () => {
    expect(hook).toContain(
      "const isInitialGoal"
    );
    expect(hook).toContain(
      "confirmationTitle"
    );
    expect(hook).toContain(
      "confirmationMessage"
    );
    expect(hook).toContain(
      "existingTargetCount"
    );
    expect(hook).toContain(
      "targetCountValue"
    );
    expect(hook).toContain(
      "await requestFormGoalConfirmation({"
    );
  });

  test("goal decision flow uses app modal instead of browser confirm", () => {
    expect(hook).not.toContain(
      "confirmInitialFormGoal("
    );
    expect(hook).not.toContain(
      "showFormGoalNoDecreaseAlert("
    );
    expect(hook).not.toContain(
      "window.confirm("
    );
    expect(hook).toContain(
      "formGoalPrompt"
    );
  });

  test("prompt replaces edit modal instead of hiding behind it", () => {
    expect(hook).toContain(
      "HJTAICHI_FORM_GOAL_MODAL_STACK_V185"
    );

    expect(hook).toMatch(
      /setFormGoalModalVisible\(false\);[\s\S]*?await showFormGoalNotice/
    );

    expect(hook).toMatch(
      /setFormGoalModalVisible\(false\);[\s\S]*?await requestFormGoalConfirmation/
    );
  });

  test("prompt state and actions remain returned to the screen", () => {
    expect(hook).toContain(
      "formGoalPrompt,"
    );
    expect(hook).toContain(
      "closeFormGoalPrompt,"
    );
    expect(hook).toContain(
      "confirmFormGoalPrompt,"
    );
  });
});
