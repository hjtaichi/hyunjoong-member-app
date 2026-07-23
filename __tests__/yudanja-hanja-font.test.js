import fs from "fs";
import path from "path";

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    "app/yudanja/training-items.jsx"
  ),
  "utf8"
);

describe("유단자 수련항목 한자 폰트", () => {
  test("한자 단독 줄도 ZhaoKai 스타일을 직접 적용한다", () => {
    expect(source).toContain(
      "!textParts.korean && textParts.hanja && styles.hanjaText"
    );
    expect(source).toContain(
      'hanja: "ZhaoKai"'
    );
  });
});
