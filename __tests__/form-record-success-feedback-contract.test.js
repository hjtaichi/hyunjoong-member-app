"use strict";

const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/features/taegukwon/useFormRecords.js"
  ),
  "utf8"
);

describe("투로 저장 성공 안내 계약", () => {
  test("웹에서는 window.alert로 성공 안내를 확실히 표시한다", () => {
    expect(source).toContain(
      'import { Alert, Platform } from "react-native";'
    );
    expect(source).toContain(
      'Platform.OS === "web"'
    );
    expect(source).toContain(
      'typeof window.alert === "function"'
    );
    expect(source).toContain(
      "window.alert(message)"
    );
  });

  test("네이티브에서는 기존 Alert.alert 완료 안내를 유지한다", () => {
    expect(source).toContain(
      'Alert.alert("완료", message)'
    );
  });

  test("투로 목표 저장 성공 안내에 투로명과 횟수를 사용한다", () => {
    expect(source).toContain(
      'showFormSaveSuccess(`${selectedFormName} ${targetCountValue}회 목표가 설정되었습니다.`);'
    );
  });

  test("투로 기록 저장 성공도 같은 웹 호환 안내를 사용한다", () => {
    expect(source).toContain(
      'showFormSaveSuccess("투로 기록이 저장되었습니다.");'
    );
  });

  test("세션 갱신용 공통 client 사용은 유지한다", () => {
    expect(source).toContain(
      'import client from "../../api/client";'
    );
    expect(source).toContain(
      '"/api/member/me/form-goals"'
    );
    expect(source).toContain(
      '"/api/member/me/form-records"'
    );
  });
});
