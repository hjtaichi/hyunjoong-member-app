const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8"
  );
}

describe("unified form history tabs UI", () => {
  test("main form record screen has one past-history entry and no choice modal", () => {
    const source = read(
      "src/features/taegukwon/FormRecordSection.jsx"
    );

    expect(source).toContain(
      "지난 기록 보기 〉"
    );
    expect(source).toContain(
      'router.push("/form-activity-by-date")'
    );
    expect(source).not.toContain(
      "수련 기록 보기 〉"
    );
    expect(source).not.toContain(
      "FormActivityHistoryChoiceModal"
    );
    expect(source).not.toContain(
      "activityHistoryChoiceVisible"
    );
  });

  test("shared tabs are date, form, completed in that order", () => {
    const source = read(
      "src/features/records/FormHistoryTabs.jsx"
    );

    const date = source.indexOf(
      'label: "날짜별"'
    );
    const form = source.indexOf(
      'label: "투로별"'
    );
    const completed = source.indexOf(
      'label: "완료기록"'
    );

    expect(date).toBeGreaterThan(-1);
    expect(form).toBeGreaterThan(date);
    expect(completed).toBeGreaterThan(form);
  });

  test.each([
    [
      "app/form-activity-by-date.jsx",
      'activeTab="date"',
    ],
    [
      "app/form-activity-by-form.jsx",
      'activeTab="form"',
    ],
    [
      "app/form-record-history.jsx",
      'activeTab="completed"',
    ],
  ])(
    "%s renders the shared history tabs",
    (relativePath, activeTab) => {
      const source = read(relativePath);

      expect(source).toContain(
        "FormHistoryTabs"
      );
      expect(source).toContain(activeTab);
      expect(source).toContain(
        'title="지난 기록"'
      );
    }
  );

  test("date and form list pages use app theme background", () => {
    for (const relativePath of [
      "app/form-activity-by-date.jsx",
      "app/form-activity-by-form.jsx",
    ]) {
      const source = read(relativePath);

      expect(source).toContain(
        "backgroundColor: colors.background"
      );
      expect(source).toContain(
        "backgroundColor: colors.card"
      );
    }
  });

  test("completed tab keeps the existing completion grouping implementation", () => {
    const source = read(
      "app/form-record-history.jsx"
    );

    expect(source).toContain(
      "groupFormHistory"
    );
    expect(source).toContain(
      "expandedGroups"
    );
    expect(source).toContain(
      "건 완료"
    );
  });
});