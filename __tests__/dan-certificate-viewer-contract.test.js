const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(rel) {
  return fs.readFileSync(
    path.join(root, rel),
    "utf8"
  );
}

const modalSource = read(
  "src/features/trainingJourney/DanCertificateModal.jsx"
);

describe("dan certificate viewer contract", () => {
  test("promotion roadmap opens certificate viewer", () => {
    const source = read(
      "app/training-history.jsx"
    );

    expect(source).toContain(
      'kind: "promotion"'
    );

    expect(source).toContain(
      "promotion,"
    );

    expect(source).toContain(
      "setSelectedDanPromotion"
    );

    expect(source).toContain(
      "<DanCertificateModal"
    );
  });

  test("certificate dates use Korea timezone instead of raw UTC date slicing", () => {
    expect(modalSource).toContain(
      'timeZone: "Asia/Seoul"'
    );

    expect(modalSource).toContain(
      "new Intl.DateTimeFormat"
    );

    expect(modalSource).not.toContain(
      "String(value).slice(0, 10)"
    );
  });

  test("viewer uses both certificate templates", () => {
    expect(modalSource).toContain(
      "korea-wushu-certificate.png"
    );

    expect(modalSource).toContain(
      "korea-taichi-certificate.png"
    );

    expect(modalSource).toContain(
      "koreaWushuAssociationCertificateNo"
    );

    expect(modalSource).toContain(
      "koreaWushuAssociationIssuedAt"
    );

    expect(modalSource).toContain(
      "koreaWushuAssociationInstructorName"
    );

    expect(modalSource).toContain(
      "koreaWushuAssociationEnglishName"
    );

    expect(modalSource).toContain(
      "koreaTaichiFederationCertificateNo"
    );

    expect(modalSource).toContain(
      "koreaTaichiFederationIssuedAt"
    );

    expect(modalSource).toContain(
      "koreaTaichiFederationInstructorName"
    );

    expect(modalSource).toContain(
      "member?.birthDate"
    );
  });

  test("Wushu certificate renders dan rank", () => {
    expect(modalSource).toContain(
      "styles.wushuRank"
    );

    expect(modalSource).toContain(
      'promotion?.danRank ? String(promotion.danRank) : ""'
    );

    expect(modalSource).toContain(
      "wushuRank: {"
    );
  });

  test("Wushu certificate separates Korean and English names around NAME", () => {
    expect(modalSource).toContain(
      "styles.wushuNameKo"
    );

    expect(modalSource).toContain(
      "styles.wushuNameEn"
    );

    expect(modalSource).toContain(
      '{member?.name || ""}'
    );

    expect(modalSource).toContain(
      '{promotion?.koreaWushuAssociationEnglishName || ""}'
    );

    expect(modalSource).toContain(
      "wushuNameKo: {"
    );

    expect(modalSource).toContain(
      "wushuNameEn: {"
    );
  });
});
