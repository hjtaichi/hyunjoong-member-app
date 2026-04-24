// src/config/env.js

import { Platform } from "react-native";

const DEV_PC_IP = "172.30.1.16"; // ← 네 PC 실제 IP로 바꿔
const PORT = 5000;

// 안드로이드 에뮬레이터: 10.0.2.2
// iOS 시뮬레이터: localhost 가능
// 실제 폰(Expo Go): 같은 와이파이의 PC IP 사용
export const API_BASE_URL =
  Platform.OS === "android"
    ? `http://${DEV_PC_IP}:${PORT}/api`
    : `http://${DEV_PC_IP}:${PORT}/api`;