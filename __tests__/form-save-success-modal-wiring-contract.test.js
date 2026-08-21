"use strict";

const fs = require("fs");
const path = require("path");

const formHook = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/features/taegukwon/useFormRecords.js"
  ),
  "utf8"
);

const screenHook = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/features/taegukwon/useTaegukwonScreen.js"
  ),
  "utf8"
);

const screen = fs.readFileSync(
  path.join(
    process.cwd(),
    "app/(tabs)/taegukwon.jsx"
  ),
  "utf8"
);

const modal = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/features/taegukwon/FormSaveSuccessModal.jsx"
  ),
  "utf8"
);

describe("투로 저장 성공 모달 전체 배선 계약", () => {
  test("useFormRecords가 성공 상태를 반환한다", () => {
    expect(formHook).toContain(
      "formSaveSuccess,"
    );

    expect(formHook).toContain(
      "closeFormSaveSuccess,"
    );
  });

  test("useTaegukwonScreen이 useFormRecords에서 성공 상태를 받는다", () => {
    const wiringEnd =
      screenHook.indexOf("} = useFormRecords({");

    expect(wiringEnd).toBeGreaterThan(0);

    const wiringStart =
      screenHook.lastIndexOf(
        "const {",
        wiringEnd
      );

    expect(wiringStart).toBeGreaterThanOrEqual(0);

    const wiringBlock =
      screenHook.slice(
        wiringStart,
        wiringEnd
      );

    const expectedInOrder = [
      "selectedForm,",
      "formSaveSuccess,",
      "closeFormSaveSuccess,",
      "handleSaveFormRecord,",
      "handleSaveFormGoal,",
      "handleSaveFavoriteForm,",
    ];

    let previousIndex = -1;

    for (const token of expectedInOrder) {
      const tokenIndex =
        wiringBlock.indexOf(token);

      expect(tokenIndex).toBeGreaterThan(
        previousIndex
      );

      previousIndex = tokenIndex;
    }
  });

  test("useTaegukwonScreen이 성공 상태를 화면으로 반환한다", () => {
    const returnStart =
      screenHook.lastIndexOf("return {");

    expect(returnStart).toBeGreaterThanOrEqual(0);

    const returnEnd =
      screenHook.indexOf(
        "};",
        returnStart
      );

    expect(returnEnd).toBeGreaterThan(
      returnStart
    );

    const returnBlock =
      screenHook.slice(
        returnStart,
        returnEnd
      );

    const expectedInOrder = [
      "selectedForm,",
      "formSaveSuccess,",
      "closeFormSaveSuccess,",
      "handleSaveFormRecord,",
      "handleSaveFormGoal,",
      "handleSaveFavoriteForm,",
      "personalProgress,",
    ];

    let previousIndex = -1;

    for (const token of expectedInOrder) {
      const tokenIndex =
        returnBlock.indexOf(token);

      expect(tokenIndex).toBeGreaterThan(
        previousIndex
      );

      previousIndex = tokenIndex;
    }
  });

  test("중간 screen hook에 두 상태가 각각 두 번 이상 존재한다", () => {
    const success =
      screenHook.match(/\bformSaveSuccess\b/g) || [];

    const close =
      screenHook.match(/\bcloseFormSaveSuccess\b/g) || [];

    expect(success.length).toBeGreaterThanOrEqual(2);
    expect(close.length).toBeGreaterThanOrEqual(2);
  });

  test("태극권 화면이 성공 상태를 실제 모달에 연결한다", () => {
    expect(screen).toContain(
      "formSaveSuccess,"
    );

    expect(screen).toContain(
      "closeFormSaveSuccess,"
    );

    expect(screen).toContain(
      "visible={formSaveSuccess?.visible}"
    );

    expect(screen).toContain(
      "title={formSaveSuccess?.title}"
    );

    expect(screen).toContain(
      "message={formSaveSuccess?.message}"
    );

    expect(screen).toContain(
      "onClose={closeFormSaveSuccess}"
    );
  });

  test("성공 모달은 기존 앱 디자인을 사용한다", () => {
    expect(modal).toContain(
      "styles.completionModalCard"
    );

    expect(modal).toContain(
      "styles.completionSaveButton"
    );

    expect(modal).toContain(
      "확인"
    );
  });

  test("목표 성공 문구와 세션 client도 그대로 유지한다", () => {
    expect(formHook).toContain(
      '${selectedFormName} ${targetCountValue}회 목표가 설정되었습니다.'
    );

    expect(formHook).toContain(
      'import client from "../../api/client";'
    );

    expect(formHook).toContain(
      '"/api/member/me/form-goals"'
    );
  });
});