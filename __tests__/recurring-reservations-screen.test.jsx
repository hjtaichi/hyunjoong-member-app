import React from "react";
import {
  Alert,
  Text,
} from "react-native";
import {
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";

import { useAuth } from "../src/contexts/AuthContext";
import {
  getRecurringReservations,
  saveRecurringReservations,
} from "../src/api/memberRecurringReservations";
import { getMemberHome } from "../src/api/memberHome";
import RecurringReservationsScreen from "../app/recurring-reservations";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../src/api/memberRecurringReservations", () => ({
  getRecurringReservations: jest.fn(),
  saveRecurringReservations: jest.fn(),
}));

jest.mock("../src/api/memberHome", () => ({
  getMemberHome: jest.fn(),
}));

jest.mock("../src/components/ScreenHeader", () => {
  const ReactModule = require("react");
  const {
    Text: NativeText,
  } = require("react-native");

  return {
    __esModule: true,
    default: ({ title }) =>
      ReactModule.createElement(
        NativeText,
        null,
        title
      ),
  };
});

describe("정기출석 설정 화면", () => {
  let alertSpy;

  beforeAll(() => {
    alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => {});
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({
      token: "member-token",
    });

    getRecurringReservations.mockResolvedValue({
      items: [],
    });

    getMemberHome.mockResolvedValue({
      member: {
        canAccessYudanjaClass: false,
      },
    });

    saveRecurringReservations.mockResolvedValue({
      saved: true,
    });
  });

  async function renderLoadedScreen() {
    await render(
      <RecurringReservationsScreen />
    );

    expect(
      await screen.findByText("저장")
    ).toBeTruthy();
  }

  test("정기예약과 유단자 권한을 함께 조회한다", async () => {
    getRecurringReservations.mockResolvedValue({
      items: [
        {
          weekday: 2,
          sessionTimeKey: "AM_10",
        },
        {
          weekday: 2,
          sessionTimeKey: "PM_4",
        },
        {
          weekday: 2,
          sessionTimeKey: "AM_10",
        },
        {
          weekday: 1,
          sessionTimeKey: "MON_YUDANJA",
        },
      ],
    });

    getMemberHome.mockResolvedValue({
      member: {
        canAccessYudanjaClass: true,
      },
    });

    await renderLoadedScreen();

    expect(
      getRecurringReservations
    ).toHaveBeenCalledWith("member-token");

    expect(getMemberHome).toHaveBeenCalledWith(
      "member-token"
    );

    expect(
      screen.getByText(
        "오전 10시부 · 오후 4시부"
      )
    ).toBeTruthy();
  });

  test("정기예약 조회 실패 메시지를 표시한다", async () => {
    getRecurringReservations.mockRejectedValue(
      new Error("정기예약 조회 실패")
    );

    await render(
      <RecurringReservationsScreen />
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        "정기예약 조회 실패"
      );
    });

    expect(
      await screen.findByText("저장")
    ).toBeTruthy();
  });

  test("한 요일에 여러 시간대를 선택할 수 있다", async () => {
    const user = userEvent.setup();

    await renderLoadedScreen();

    await user.press(
      screen.getByText("화요일")
    );

    await user.press(
      screen.getByText("오전 10시부")
    );

    await user.press(
      screen.getByText("오후 7시부")
    );

    await user.press(
      screen.getByText("닫기")
    );

    expect(
      screen.getByText(
        "오전 10시부 · 오후 7시부"
      )
    ).toBeTruthy();
  });

  test("선택한 일반 정기예약을 PUT 저장한다", async () => {
    const user = userEvent.setup();

    getRecurringReservations.mockResolvedValue({
      items: [
        {
          weekday: 2,
          sessionTimeKey: "AM_10",
        },
      ],
    });

    await renderLoadedScreen();

    await user.press(
      screen.getByText("저장")
    );

    await waitFor(() => {
      expect(
        saveRecurringReservations
      ).toHaveBeenCalledWith(
        "member-token",
        {
          isEnabled: true,
          items: [
            {
              weekday: 2,
              sessionTimeKey: "AM_10",
            },
          ],
        }
      );
    });
  });

  test("선택 항목이 없으면 비활성 상태로 저장한다", async () => {
    const user = userEvent.setup();

    await renderLoadedScreen();

    await user.press(
      screen.getByText("저장")
    );

    await waitFor(() => {
      expect(
        saveRecurringReservations
      ).toHaveBeenCalledWith(
        "member-token",
        {
          isEnabled: false,
          items: [],
        }
      );
    });
  });

  test("권한이 있는 회원은 유단자 자동예약을 추가한다", async () => {
    const user = userEvent.setup();

    getMemberHome.mockResolvedValue({
      member: {
        canAccessYudanjaClass: true,
      },
    });

    await renderLoadedScreen();

    await user.press(
      screen.getByText(
        /유단자.*자동 예약/
      )
    );

    await user.press(
      screen.getByText("저장")
    );

    await waitFor(() => {
      expect(
        saveRecurringReservations
      ).toHaveBeenCalledWith(
        "member-token",
        {
          isEnabled: true,
          items: [
            {
              weekday: 1,
              sessionTimeKey: "MON_YUDANJA",
            },
          ],
        }
      );
    });
  });

  test("유단자 권한이 없으면 유단자 예약을 저장하지 않는다", async () => {
    const user = userEvent.setup();

    getRecurringReservations.mockResolvedValue({
      items: [
        {
          weekday: 1,
          sessionTimeKey: "MON_YUDANJA",
        },
      ],
    });

    getMemberHome.mockResolvedValue({
      member: {
        canAccessYudanjaClass: false,
      },
    });

    await renderLoadedScreen();

    await user.press(
      screen.getByText("저장")
    );

    await waitFor(() => {
      expect(
        saveRecurringReservations
      ).toHaveBeenCalledWith(
        "member-token",
        {
          isEnabled: false,
          items: [],
        }
      );
    });
  });

  test("저장 실패 메시지를 표시하고 다시 저장할 수 있다", async () => {
    const user = userEvent.setup();

    saveRecurringReservations.mockRejectedValue(
      new Error("정기예약 저장 실패")
    );

    await renderLoadedScreen();

    await user.press(
      screen.getByText("저장")
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        "정기예약 저장 실패"
      );
    });

    expect(
      screen.getByText("저장")
    ).toBeTruthy();
  });
});