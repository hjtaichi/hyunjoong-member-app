"use strict";

const fs = require("fs");
const path = require("path");

const formSource = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/features/taegukwon/useFormRecords.js"
  ),
  "utf8"
);

const clientSource = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/api/client.js"
  ),
  "utf8"
);

describe("투로 기록 인증 세션 갱신 계약", () => {
  test("투로 조회·기록·목표·대표투로 저장은 refresh 가능한 공통 client를 사용한다", () => {
    expect(formSource).toContain(
      'import client from "../../api/client";'
    );

    expect(formSource).toContain(
      '"/api/member/me/form-records"'
    );
    expect(formSource).toContain(
      '"/api/member/me/form-goals"'
    );
    expect(formSource).toContain(
      '"/api/member/me/favorite-form"'
    );

    expect(formSource).toContain("client.get(");
    expect(formSource).toContain("client.post(");
    expect(formSource).toContain("client.patch(");

    expect(formSource).not.toContain(
      'Authorization: \`Bearer ${token}\`'
    );
    expect(formSource).not.toContain("API_BASE_URL");
  });

  test("공통 client는 저장된 최신 access token을 읽고 401을 refresh 후 재시도한다", () => {
    expect(clientSource).toContain(
      "const token = await getAccessToken()"
    );
    expect(clientSource).toContain(
      "status !== 401"
    );
    expect(clientSource).toContain(
      '"/api/auth/refresh"'
    );
    expect(clientSource).toContain(
      "await setAccessToken(newAccessToken)"
    );
    expect(clientSource).toContain(
      "return client(originalRequest)"
    );
  });

  test("투로 목표 저장 성공 안내에 선택 투로명과 목표 횟수를 표시한다", () => {
    expect(formSource).toContain(
      'const selectedFormName = selectedForm?.name || "투로";'
    );

    expect(formSource).toContain(
      '${selectedFormName} ${targetCountValue}회 목표가 설정되었습니다.'
    );
  });
});
