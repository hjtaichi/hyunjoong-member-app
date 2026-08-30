import React from "react";
import {
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  useAuth,
} from "../src/contexts/AuthContext";
import {
  getSavedLoginId,
  setSavedLoginId,
} from "../src/utils/storage";
import LoginScreen from "../src/screens/LoginScreen";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../src/utils/storage", () => ({
  getSavedLoginId: jest.fn(),
  setSavedLoginId: jest.fn(),
  removeSavedLoginId: jest.fn(),
}));

describe("NFC attendance login continuation", () => {
  let login;

  beforeEach(() => {
    jest.clearAllMocks();

    login = jest.fn().mockResolvedValue({
      ok: true,
    });

    getSavedLoginId.mockResolvedValue(null);
    setSavedLoginId.mockResolvedValue(undefined);

    useLocalSearchParams.mockReturnValue({
      nfcAttendanceToken:
        "hjtaichi_test_station_0123456789abcdef",
    });

    useAuth.mockReturnValue({
      login,
      isLoginLoading: false,
      isAuthenticated: false,
      isBootLoading: false,
      user: null,
    });
  });

  test("로그인 성공 후 NFC 출석 화면으로 복귀한다", async () => {
    const user = userEvent.setup();

    await render(<LoginScreen />);

    await user.type(
      screen.getByPlaceholderText("아이디"),
      "member01"
    );

    await user.type(
      screen.getByPlaceholderText("비밀번호"),
      "secret"
    );

    await user.press(
      screen.getByText("로그인")
    );

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/nfc-attendance",
        params: {
          token:
            "hjtaichi_test_station_0123456789abcdef",
        },
      });
    });
  });
});