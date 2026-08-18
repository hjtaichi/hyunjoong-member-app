import {
  formatKoreaRecordTime,
  getKoreaRecordDateKey,
  groupFormActivityByDate,
  groupFormActivityByForm,
} from "../src/features/records/formActivityHistoryUtils";

describe("form activity history utils", () => {
  const items = [
    {
      id: "a",
      formKey: "taeguk-29",
      formName: "현중태극권 29식",
      count: 3,
      createdAt:
        "2026-08-18T02:12:00.000Z",
    },
    {
      id: "b",
      formKey: "fan-29",
      formName: "현중태극선 29식",
      count: 2,
      createdAt:
        "2026-08-18T06:35:00.000Z",
    },
    {
      id: "c",
      formKey: "taeguk-29",
      formName: "현중태극권 29식",
      count: 5,
      createdAt:
        "2026-08-17T11:18:00.000Z",
    },
  ];

  test("formats record time in Korea time", () => {
    expect(
      formatKoreaRecordTime(
        "2026-08-18T02:12:00.000Z"
      )
    ).toBe("11:12");

    expect(
      getKoreaRecordDateKey(
        "2026-08-17T16:30:00.000Z"
      )
    ).toBe("2026-08-18");
  });

  test("groups mixed forms by Korea calendar date", () => {
    const groups =
      groupFormActivityByDate(items);

    expect(groups[0]).toMatchObject({
      key: "2026-08-18",
      totalCount: 5,
      formCount: 2,
    });
    expect(groups[0].items).toHaveLength(2);
  });

  test("groups records by form without merging individual entries", () => {
    const groups =
      groupFormActivityByForm(items);

    const taeguk = groups.find(
      (group) =>
        group.formKey === "taeguk-29"
    );

    expect(taeguk).toMatchObject({
      totalCount: 8,
    });
    expect(taeguk.items).toHaveLength(2);
  });
});