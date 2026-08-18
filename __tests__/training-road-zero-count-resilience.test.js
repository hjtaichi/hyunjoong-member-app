import fs from "fs";
import path from "path";
import {
  getJourneyAttendanceCount,
} from "../src/features/trainingJourney/trainingJourneyUtils";

function readSource(...segments) {
  return fs.readFileSync(
    path.join(process.cwd(), ...segments),
    "utf8"
  );
}

describe("training road zero-count resilience", () => {
  test("journey count remains session-count based", () => {
    expect(
      getJourneyAttendanceCount({
        member: {
          totalAttendanceSessionCount: 8,
          totalAttendanceCount: 5,
        },
      })
    ).toBe(8);

    expect(
      getJourneyAttendanceCount({
        member: {
          totalAttendanceCount: 1000,
        },
        trainingStats: {
          totalAttendanceCount: 1000,
        },
      })
    ).toBe(0);
  });

  test("member home uses the refresh-capable shared client", () => {
    const source = readSource(
      "src",
      "api",
      "memberHome.js"
    );

    expect(source).toContain(
      'import client from "./client"'
    );

    expect(source).toContain(
      'client.get("/api/member/me/home"'
    );

    expect(source).not.toContain(
      'import { apiFetch } from "./api"'
    );
  });

  test("history events use the refresh-capable shared client", () => {
    const source = readSource(
      "src",
      "api",
      "memberHistoryEvents.js"
    );

    expect(source).toContain(
      'import client from "./client"'
    );

    expect(source).toContain(
      '"/api/member/me/history-events"'
    );

    expect(source).not.toContain(
      'import { apiFetch } from "./api"'
    );
  });

  test("history failure cannot discard a successful home response", () => {
    const source = readSource(
      "app",
      "training-history.jsx"
    );

    expect(source).toContain(
      "const home = await getMemberHome(token);"
    );

    expect(source).toContain(
      "setHomeData(home);"
    );

    expect(source).toContain(
      "const history = await getMyHistoryEvents(token);"
    );

    expect(source).not.toContain(
      "const [home, history] = await Promise.all(["
    );
  });

  test("missing home data is not rendered as zero training sessions", () => {
    const source = readSource(
      "app",
      "training-history.jsx"
    );

    expect(source).toContain(
      "if (!homeData) {"
    );

    expect(source).toContain(
      "수련 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
    );

    expect(source).toContain(
      "getJourneyAttendanceCount(homeData)"
    );
  });
});
