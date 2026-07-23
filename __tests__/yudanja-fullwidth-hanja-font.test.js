import fs from "fs";
import path from "path";

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    "app/yudanja/training-items.jsx"
  ),
  "utf8"
);

describe("유단자 전각 괄호 한자 폰트", () => {
  test("반각과 전각 괄호를 모두 한자 구간으로 분리한다", () => {
    expect(source).toContain("（[^（）]+）");
    expect(source).toContain("styles.hanjaText");
    expect(source).toContain('hanja: "ZhaoKai"');
  });
});
