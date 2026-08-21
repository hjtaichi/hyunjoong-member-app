const fs = require("fs");
const path = require("path");

function read(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf8");
}

describe("movement dictionary Chinese TTS layout v2.2", () => {
  test("full listen text reuses badge typography", () => {
    const form = read("app/movement-dictionary/[formId].jsx");

    expect(form).toContain(
      '<Text style={[styles.badgeText, styles.listenAllCompactText]}>'
    );

    expect(form).toMatch(
      /listenAllCompactText\s*:\s*\{\s*color\s*:\s*"#8E6E45"\s*,?\s*\}/
    );
  });

  test("full listen remains compact beside the illustration badge", () => {
    const form = read("app/movement-dictionary/[formId].jsx");

    expect(form).toContain(
      "HJTAICHI_CHINESE_TTS_FULL_LISTEN_COMPACT"
    );
    expect(form).toContain("styles.metaActions");
    expect(form).toContain("styles.listenAllCompactButton");
    expect(form).toContain("styles.listenAllCompactIcon");
  });

  test("detail speaker tuning remains intact", () => {
    const detail = read(
      "app/movement-dictionary/[formId]/[stepOrder].jsx"
    );

    expect(detail).toMatch(
      /heroSpeakerButton\s*:\s*\{[\s\S]*?backgroundColor\s*:\s*"transparent"/
    );
    expect(detail).toMatch(
      /heroSpeakerIcon\s*:\s*\{[\s\S]*?width\s*:\s*26[\s\S]*?height\s*:\s*26/
    );
  });
});
