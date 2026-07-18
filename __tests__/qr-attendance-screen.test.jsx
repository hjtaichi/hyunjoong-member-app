import React from "react";
import {
  Alert,
  Platform,
  View,
} from "react-native";
import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";

import {
  router,
} from "expo-router";
import {
  useCameraPermissions,
} from "expo-camera";
import { useAuth } from "../src/contexts/AuthContext";
import { markAttendance } from "../src/api/memberAttendance";
import QrAttendanceScreen from "../app/qr-attendance";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock("../src/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../src/api/memberAttendance", () => ({
  markAttendance: jest.fn(),
}));

jest.mock("expo-camera", () => {
  const ReactModule = require("react");
  const {
    View: NativeView,
  } = require("react-native");

  return {
    CameraView: (props) =>
      ReactModule.createElement(
        NativeView,
        {
          ...props,
          testID: "camera-view",
        }
      ),
    useCameraPermissions: jest.fn(),
  };
});

describe("실제 QR 출석 화면", () => {
  let alertSpy;
  let requestPermission;

  beforeAll(() => {
    if (Platform.OS === "web") {
      throw new Error(
        "QR 출석 테스트는 jest-expo native 환경에서 실행해야 합니다."
      );
    }

    alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => {});
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    requestPermission = jest.fn();

    useAuth.mockReturnValue({
      token: "qr-member-token",
    });

    useCameraPermissions.mockReturnValue([
      {
        granted: true,
        canAskAgain: false,
      },
      requestPermission,
    ]);

    markAttendance.mockResolvedValue({
      status: "present",
    });
  });

  function getScanHandler() {
    return screen
      .getByTestId("camera-view")
      .props.onBarcodeScanned;
  }

  test("요청 가능한 카메라 권한을 자동 요청한다", async () => {
    useCameraPermissions.mockReturnValue([
      {
        granted: false,
        canAskAgain: true,
      },
      requestPermission,
    ]);

    await render(<QrAttendanceScreen />);

    await waitFor(() => {
      expect(
        requestPermission
      ).toHaveBeenCalledTimes(1);
    });

    expect(markAttendance).not.toHaveBeenCalled();
  });

  test("카메라 권한이 없으면 이전 화면으로 돌아갈 수 있다", async () => {
    const user = userEvent.setup();

    useCameraPermissions.mockReturnValue([
      {
        granted: false,
        canAskAgain: false,
      },
      requestPermission,
    ]);

    await render(<QrAttendanceScreen />);

    expect(
      screen.getByText(
        "카메라 권한이 필요합니다"
      )
    ).toBeTruthy();

    await user.press(
      screen.getByText("돌아가기")
    );

    expect(router.back).toHaveBeenCalled();
  });

  test("memberapp QR에서 세션 ID를 읽어 출석 처리한다", async () => {
    await render(<QrAttendanceScreen />);

    const handleScan = getScanHandler();

    await act(async () => {
      await handleScan({
        data:
          "  memberapp://attendance-check?sessionId=501  ",
      });
    });

    expect(markAttendance).toHaveBeenCalledWith(
      "qr-member-token",
      {
        sessionId: "501",
      }
    );

    expect(Alert.alert).toHaveBeenCalledWith(
      "출석 완료",
      "출석이 정상 처리되었습니다.",
      expect.any(Array)
    );

    const confirmButton =
      Alert.alert.mock.calls[0][2][0];

    await act(async () => {
      confirmButton.onPress();
    });

    expect(router.replace).toHaveBeenCalledWith(
      "/(tabs)/home"
    );
  });

  test("JSON QR의 숫자 세션 ID도 문자열로 처리한다", async () => {
    await render(<QrAttendanceScreen />);

    const handleScan = getScanHandler();

    await act(async () => {
      await handleScan({
        data: JSON.stringify({
          type: "attendance",
          sessionId: 502,
        }),
      });
    });

    expect(markAttendance).toHaveBeenCalledWith(
      "qr-member-token",
      {
        sessionId: "502",
      }
    );
  });

  test("잘못된 QR은 API를 호출하지 않고 다시 스캔한다", async () => {
    await render(<QrAttendanceScreen />);

    const handleScan = getScanHandler();

    await act(async () => {
      await handleScan({
        data: "https://example.com/not-attendance",
      });
    });

    expect(markAttendance).not.toHaveBeenCalled();

    expect(Alert.alert).toHaveBeenCalledWith(
      "안내",
      "현중태극권 출석 QR이 아닙니다.",
      expect.any(Array)
    );

    expect(
      screen.queryByTestId("camera-view")
    ).toBeNull();

    const rescanButton =
      Alert.alert.mock.calls[0][2][0];

    await act(async () => {
      rescanButton.onPress();
    });

    expect(
      await screen.findByTestId("camera-view")
    ).toBeTruthy();
  });

  test("연속된 중복 QR 스캔은 한 번만 처리한다", async () => {
    let resolveAttendance;

    const pendingAttendance =
      new Promise((resolve) => {
        resolveAttendance = resolve;
      });

    markAttendance.mockReturnValue(
      pendingAttendance
    );

    await render(<QrAttendanceScreen />);

    const handleScan = getScanHandler();

    await act(async () => {
      const firstScan = handleScan({
        data:
          "memberapp://attendance-check?sessionId=503",
      });

      const duplicateScan = handleScan({
        data:
          "memberapp://attendance-check?sessionId=503",
      });

      resolveAttendance({
        status: "present",
      });

      await Promise.all([
        firstScan,
        duplicateScan,
      ]);
    });

    expect(markAttendance).toHaveBeenCalledTimes(1);
  });

  test("출석 실패 메시지를 표시하고 홈으로 이동한다", async () => {
    markAttendance.mockRejectedValue(
      new Error("이미 출석한 수업입니다.")
    );

    await render(<QrAttendanceScreen />);

    const handleScan = getScanHandler();

    await act(async () => {
      await handleScan({
        data:
          "memberapp://attendance-check?sessionId=504",
      });
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "출석 실패",
      "이미 출석한 수업입니다.",
      expect.any(Array)
    );

    const confirmButton =
      Alert.alert.mock.calls[0][2][0];

    await act(async () => {
      confirmButton.onPress();
    });

    expect(router.replace).toHaveBeenCalledWith(
      "/(tabs)/home"
    );
  });
});