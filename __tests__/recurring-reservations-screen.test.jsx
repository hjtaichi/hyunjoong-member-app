import React from "react";
import { Alert } from "react-native";
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
  const { Text } = require("react-native");

  return {
    __esModule: true,
    default: ({ title }) =>
      ReactModule.createElement(Text, null, title),
  };
});

describe("유단자수련 정기예약 설정 화면", () => {
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
      <RecurringReservationsScreen />,
    );

    expect(
      await screen.findByText("저장"),
    ).toBeTruthy();
  }

  test("정기예약과 유단자 권한을 함께 조회한다", async () => {
    getRecurringReservations.mockResolvedValue({
      items: [
        {
          weekday: 1,
          sessionTimeKey: "MON_YUDANJA",
        },
        {
          weekday: 2,
          sessionTimeKey: "AM_10",
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
      getRecurringReservations,
    ).toHaveBeenCalledWith("member-token");

    expect(getMemberHome).toHaveBeenCalledWith(
      "member-token",
    );

    expect(
      screen.getByText("월요일 유단자수련"),
    ).toBeTruthy();

    expect(
      screen.getByText(
        "유단자수련 정기예약 사용 중",
      ),
    ).toBeTruthy();

    expect(screen.queryByText("화요일")).toBeNull();
  });

  test("일반 수업은 정기예약 대상이 아님을 안내한다", async () => {
    await renderLoadedScreen();

    expect(
      screen.getByText("일반 수업 예약 안내"),
    ).toBeTruthy();

    expect(
      screen.getByText(
        /일반 수업은 개별 예약과 정기예약을 사용하지 않으며/,
      ),
    ).toBeTruthy();
  });

  test("권한이 있는 회원은 월요일 유단자 정기예약을 저장한다", async () => {
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
        canAccessYudanjaClass: true,
      },
    });

    await renderLoadedScreen();

    await user.press(screen.getByText("저장"));

    await waitFor(() => {
      expect(
        saveRecurringReservations,
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
        },
      );
    });
  });

  test("권한이 있는 회원은 유단자 정기예약을 끌 수 있다", async () => {
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
        canAccessYudanjaClass: true,
      },
    });

    await renderLoadedScreen();

    await user.press(
      screen.getByText(
        "유단자수련 정기예약 사용 중",
      ),
    );

    await user.press(screen.getByText("저장"));

    await waitFor(() => {
      expect(
        saveRecurringReservations,
      ).toHaveBeenCalledWith(
        "member-token",
        {
          isEnabled: false,
          items: [],
        },
      );
    });
  });

  test("유단자 권한이 없으면 저장 버튼이 비활성화된다", async () => {
    await renderLoadedScreen();

    expect(
      screen.getByText(
        "유단자수련 권한이 있는 회원만 설정할 수 있습니다.",
      ),
    ).toBeTruthy();

    const saveText = screen.getByText("저장");
    const saveButton = saveText.parent;

    expect(
      saveButton?.props?.accessibilityState,
    ).toMatchObject({
      disabled: true,
    });

    expect(
      saveRecurringReservations,
    ).not.toHaveBeenCalled();
  });

  test("조회 실패 메시지를 표시한다", async () => {
    getRecurringReservations.mockRejectedValue(
      new Error("정기예약 조회 실패"),
    );

    await render(
      <RecurringReservationsScreen />,
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        "정기예약 조회 실패",
      );
    });
  });

  test("저장 실패 메시지를 표시하고 다시 저장할 수 있다", async () => {
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
        canAccessYudanjaClass: true,
      },
    });

    saveRecurringReservations.mockRejectedValue(
      new Error("정기예약 저장 실패"),
    );

    await renderLoadedScreen();

    await user.press(screen.getByText("저장"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        "정기예약 저장 실패",
      );
    });

    expect(screen.getByText("저장")).toBeTruthy();
  });
});
