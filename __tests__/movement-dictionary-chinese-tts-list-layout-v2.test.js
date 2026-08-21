const fs = require("fs");
const path = require("path");

function read(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf8");
}

describe("movement dictionary inline list speaker v2.4", () => {
  test("speaker circles are gone and speakers sit beside titles", () => {
    const form = read("app/movement-dictionary/[formId].jsx");

    expect(form).toContain(
      "HJTAICHI_CHINESE_TTS_INLINE_LIST_SPEAKER_V24"
    );

    expect(
      (form.match(/style=\{styles\.movementTitleRow\}/g) || []).length
    ).toBeGreaterThanOrEqual(2);

    expect(
      (form.match(/style=\{styles\.inlineSpeakerButton\}/g) || []).length
    ).toBeGreaterThanOrEqual(2);

    expect(form).not.toContain(
      "style={styles.speakerButton}"
    );
  });

  test("inline speaker is transparent with a small title gap", () => {
    const form = read("app/movement-dictionary/[formId].jsx");

    expect(form).toMatch(
      /inlineSpeakerButton\s*:\s*\{[\s\S]*?marginLeft\s*:\s*6/
    );

    expect(form).toMatch(
      /inlineSpeakerButton\s*:\s*\{[\s\S]*?backgroundColor\s*:\s*"transparent"/
    );

    expect(form).toMatch(
      /inlineSpeakerIcon\s*:\s*\{[\s\S]*?width\s*:\s*19[\s\S]*?height\s*:\s*19/
    );
  });

  test("speaker click still speaks hanja without opening the row", () => {
    const form = read("app/movement-dictionary/[formId].jsx");

    expect(form).toContain(
      "void speakChinese(movement.hanja)"
    );
    expect(form).toContain(
      "void speakChinese(targetMovement.hanja)"
    );
    expect(form).toContain(
      "event?.stopPropagation?.()"
    );
  });
});
