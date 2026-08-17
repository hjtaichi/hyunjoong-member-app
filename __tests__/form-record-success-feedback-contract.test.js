"use strict";

const fs = require("fs");
const path = require("path");

const hook = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/features/taegukwon/useFormRecords.js"
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

describe("투로 저장 성공 자체 모달 계약", () => {
  test("성공 안내 helper는 browser window.alert를 사용하지 않는다", () => {
    const match = hook.match(
      /function showFormSaveSuccess\([\s\S]*?\n\}/
    );

    expect(match).not.toBeNull();
    expect(match[0]).not.toContain("window.alert");
    expect(match[0]).toContain("setFormSaveSuccess({");
  });

  test("기존 목표 미설정 웹 안내와 Platform import는 유지한다", () => {
    expect(hook).toContain(
      'import { Alert, Platform } from "react-native";'
    );

    expect(hook).toContain(
      'window.alert("목표를 먼저 설정하세요.");'
    );
  });

  test("투로 저장 성공 상태를 자체 모달로 관리한다", () => {
    expect(hook).toContain(
      "const [formSaveSuccess, setFormSaveSuccess] = useState("
    );

    expect(hook).toContain(
      "closeFormSaveSuccess"
    );

    expect(hook).toContain(
      "setFormSaveSuccess({"
    );
  });

  test("투로 목표 성공 문구는 선택 투로명과 목표 횟수를 표시한다", () => {
    expect(hook).toContain(
      '"목표 설정 완료"'
    );

    expect(hook).toContain(
      '${selectedFormName} ${targetCountValue}회 목표가 설정되었습니다.'
    );

    expect(hook).not.toContain(
      '${selectedFormName}\\n${targetCountValue}회 목표가 설정되었습니다.'
    );
  });

  test("투로 기록 저장 성공도 동일한 자체 모달을 사용한다", () => {
    expect(hook).toContain(
      '"저장 완료"'
    );

    expect(hook).toContain(
      '"투로 기록이 저장되었습니다."'
    );
  });

  test("태극권 화면에 성공 모달이 연결되어 있다", () => {
    expect(screen).toContain(
      'import FormSaveSuccessModal from "../../src/features/taegukwon/FormSaveSuccessModal";'
    );

    expect(screen).toContain(
      "<FormSaveSuccessModal"
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

  test("성공 모달은 기존 현중태극권 완료 모달 디자인을 재사용한다", () => {
    expect(modal).toContain(
      "styles.recordModalOverlay"
    );

    expect(modal).toContain(
      "styles.completionModalCard"
    );

    expect(modal).toContain(
      "styles.completionTitle"
    );

    expect(modal).toContain(
      "styles.completionText"
    );

    expect(modal).toContain(
      "styles.completionButtonRow"
    );

    expect(modal).toContain(
      "styles.completionSaveButton"
    );

    expect(modal).toContain(
      "styles.completionSaveText"
    );

    expect(modal).toContain(
      "확인"
    );
  });

  test("세션 자동 갱신 공통 client와 저장 API를 유지한다", () => {
    expect(hook).toContain(
      'import client from "../../api/client";'
    );

    expect(hook).toContain(
      '"/api/member/me/form-goals"'
    );

    expect(hook).toContain(
      '"/api/member/me/form-records"'
    );
  });
});