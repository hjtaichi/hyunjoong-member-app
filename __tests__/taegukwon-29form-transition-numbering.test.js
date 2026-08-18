const fs = require("fs");
const path = require("path");

const detailPath = path.join(
  __dirname,
  "..",
  "app",
  "taegukwon",
  "[curriculumId].jsx"
);

const source = fs.readFileSync(detailPath, "utf8");

describe("현중태극권 29식 과도식 표시 번호 정책", () => {
  test("33개 내부 순서는 유지하면서 29식 표시 번호를 사용한다", () => {
    expect(source).toContain(
      '{ displayNo: "6-1", baseNo: 6, isTransition: true }'
    );
    expect(source).toContain(
      '{ displayNo: "25-1", baseNo: 25, isTransition: true }'
    );
    expect(source).toContain(
      '{ displayNo: "25-2", baseNo: 25, isTransition: true }'
    );
    expect(source).toContain(
      '{ displayNo: "26-1", baseNo: 26, isTransition: true }'
    );
    expect(source).toContain(
      '{ displayNo: "29", baseNo: 29, isTransition: false }'
    );
  });

  test("단체 진도 범위는 내부 33번이 아니라 29식 기준 번호로 판정한다", () => {
    expect(source).toContain(
      "const canonicalStepNo = Number(stepItem.baseNo || stepNo);"
    );
    expect(source).toContain("canonicalStepNo >= startStep");
    expect(source).toContain("canonicalStepNo <= endStep");
  });

  test("개인 현재 진도도 29식 기준 번호로 본식과 과도식을 함께 판정한다", () => {
    expect(source).toContain(
      "currentStep === canonicalStepNo"
    );
    expect(source).toContain(
      "currentStep > canonicalStepNo"
    );
    expect(source).toContain(
      "currentStep < canonicalStepNo"
    );
    expect(source).toContain(
      "currentCanonicalStepItem"
    );
  });

  test("화면 배지는 내부 배열 번호 대신 표시 번호를 사용한다", () => {
    expect(source).toContain("{displayStepNo}");
  });
});