import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_VERSION } from "../config/appVersion";

const APP_VERSION_KEY = "HJTAICHI_APP_VERSION";

const CACHE_KEYS_TO_CLEAR = [
  "homeCache",
  "calendarCache",
  "noticeCache",
  "memberCache",
  "taegukwonCache",
  "mypageCache",
];

export async function checkAppVersionAndClearCache() {
  try {
    const savedVersion = await AsyncStorage.getItem(APP_VERSION_KEY);

    if (savedVersion === APP_VERSION) {
      return {
        updated: false,
        version: APP_VERSION,
      };
    }

    await Promise.all(
      CACHE_KEYS_TO_CLEAR.map((key) => AsyncStorage.removeItem(key))
    );

    await AsyncStorage.setItem(APP_VERSION_KEY, APP_VERSION);

    return {
      updated: true,
      previousVersion: savedVersion,
      version: APP_VERSION,
    };
  } catch (error) {
    console.log("앱 버전 체크 실패:", error);

    return {
      updated: false,
      version: APP_VERSION,
      error,
    };
  }
}