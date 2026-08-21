const fs = require("fs");
const path = require("path");

function read(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), "utf8");
}

describe("movement dictionary Chinese TTS contract v1.8", () => {
  test("full listen stops when form screen loses focus", () => {
    const form = read("app/movement-dictionary/[formId].jsx");

    expect(form).toMatch(
      /import\s*\{[^}]*\buseFocusEffect\b[^}]*\}\s*from\s*["']expo-router["']/s
    );

    expect(form).toContain(
      "HJTAICHI_CHINESE_TTS_AUTO_STOP_ON_LEAVE"
    );

    expect(form).toMatch(
      /useFocusEffect\(\s*React\.useCallback\(\(\)\s*=>\s*\{[\s\S]*?return\s*\(\)\s*=>\s*\{[\s\S]*?stopChineseSpeech\(\);/
    );
  });

  test("web/PWA speech stops when tab or app becomes hidden", () => {
    const form = read("app/movement-dictionary/[formId].jsx");

    expect(form).toContain("document.hidden");
    expect(form).toContain('"visibilitychange"');
    expect(form).toContain("stopWhenHidden");
    expect(form).toContain("stopChineseSpeech();");
  });

  test("full listen and stop toggle remain available", () => {
    const form = read("app/movement-dictionary/[formId].jsx");
    const speech = read("src/utils/chineseSpeech.js");

    expect(form).toContain("speakChineseSequence");
    expect(form).toContain("stopChineseSpeech");
    expect(form).toContain("전체듣기");
    expect(form).toContain("듣기 중지");

    expect(speech).toContain(
      "export function speakChineseSequence"
    );
    expect(speech).toContain(
      "export function stopChineseSpeech"
    );
  });

  test("custom speaker icon remains installed", () => {
    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          "assets/icons/chinese-tts-speaker.png"
        )
      )
    ).toBe(true);

    const form = read("app/movement-dictionary/[formId].jsx");

    expect(form).toContain("chinese-tts-speaker.png");
  });
});
