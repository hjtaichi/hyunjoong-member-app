import { useEffect, useState } from "react";
import {
  Text,
  View,
} from "react-native";

const ADMIN_ORIGIN =
  "https://admin.hjtaichi.com";

function getSafeReturnUrl() {
  if (typeof window === "undefined") {
    return `${ADMIN_ORIGIN}/`;
  }

  const rawReturnTo =
    new URL(window.location.href)
      .searchParams.get("returnTo");

  if (!rawReturnTo) {
    return `${ADMIN_ORIGIN}/`;
  }

  try {
    const returnUrl =
      new URL(rawReturnTo);

    if (
      returnUrl.origin !==
      ADMIN_ORIGIN
    ) {
      return `${ADMIN_ORIGIN}/`;
    }

    return returnUrl.toString();
  } catch {
    return `${ADMIN_ORIGIN}/`;
  }
}

function withCleanupResult(
  returnTo,
  result
) {
  const returnUrl =
    new URL(returnTo);

  returnUrl.searchParams.set(
    "memberPushCleanup",
    result
  );

  return returnUrl.toString();
}

function isAuthorizedAdminCleanup() {
  if (typeof document === "undefined") {
    return false;
  }

  const hasAdminCookie =
    document.cookie
      .split(";")
      .map((item) => item.trim())
      .includes(
        "hjtaichi_admin_device=1"
      );

  const cameFromAdminWeb =
    document.referrer.startsWith(
      `${ADMIN_ORIGIN}/`
    );

  return (
    hasAdminCookie ||
    cameFromAdminWeb
  );
}

async function removeAllMemberWebPushSubscriptions() {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return 0;
  }

  const registrations =
    await navigator.serviceWorker.getRegistrations();

  let unsubscribedCount = 0;

  for (const registration of registrations) {
    const subscription =
      await registration.pushManager
        ?.getSubscription();

    if (!subscription) {
      continue;
    }

    const unsubscribed =
      await subscription.unsubscribe();

    if (unsubscribed) {
      unsubscribedCount += 1;
    }
  }

  return unsubscribedCount;
}

function recordCleanupSuccess(
  unsubscribedCount
) {
  window.localStorage.setItem(
    "hjtaichi_member_web_push_suppressed",
    "admin_device"
  );
  window.localStorage.setItem(
    "hjtaichi_member_web_push_cleanup_status",
    "complete"
  );
  window.localStorage.setItem(
    "hjtaichi_member_web_push_cleanup_count",
    String(unsubscribedCount)
  );
  window.localStorage.setItem(
    "hjtaichi_member_web_push_cleanup_completed_at",
    new Date().toISOString()
  );
}

function recordCleanupFailure(error) {
  window.localStorage.setItem(
    "hjtaichi_member_web_push_cleanup_status",
    "failed"
  );
  window.localStorage.setItem(
    "hjtaichi_member_web_push_cleanup_error_code",
    String(
      error?.name ||
        "MemberWebPushCleanupError"
    )
  );
}

export default function AdminDeviceCleanupPage() {
  const [status, setStatus] =
    useState("이 PC의 회원용 알림을 정리하고 있습니다.");

  useEffect(() => {
    const returnTo =
      getSafeReturnUrl();

    if (!isAuthorizedAdminCleanup()) {
      setStatus(
        "관리자웹에서 다시 접속해주세요."
      );

      const timer =
        window.setTimeout(() => {
          window.location.replace(
            withCleanupResult(
              returnTo,
              "failed"
            )
          );
        }, 1200);

      return () => {
        window.clearTimeout(timer);
      };
    }

    let cancelled = false;

    void removeAllMemberWebPushSubscriptions()
      .then((unsubscribedCount) => {
        if (cancelled) {
          return;
        }

        recordCleanupSuccess(
          unsubscribedCount
        );

        setStatus(
          "회원용 PC 알림 정리가 완료되었습니다. 관리자웹으로 돌아갑니다."
        );

        window.setTimeout(() => {
          window.location.replace(
            withCleanupResult(
              returnTo,
              "complete"
            )
          );
        }, 700);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        recordCleanupFailure(error);

        setStatus(
          "회원용 알림 정리에 실패했습니다. 관리자웹으로 돌아갑니다."
        );

        window.setTimeout(() => {
          window.location.replace(
            withCleanupResult(
              returnTo,
              "failed"
            )
          );
        }, 1200);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#071A39",
        padding: 24,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 24,
          backgroundColor: "#FFFFFF",
          padding: 28,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#071A39",
            textAlign: "center",
          }}
        >
          PC 알림 정리
        </Text>

        <Text
          style={{
            marginTop: 14,
            fontSize: 15,
            lineHeight: 23,
            color: "#4B5563",
            textAlign: "center",
          }}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}
