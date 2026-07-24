import { useEffect } from "react";
import { View } from "react-native";

function isAuthorizedAdminCleanup() {
  if (typeof document === "undefined") {
    return false;
  }

  const hasAdminCookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .includes("hjtaichi_admin_device=1");

  const cameFromAdminWeb =
    document.referrer.startsWith(
      "https://admin.hjtaichi.com/"
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

    if (
      subscription &&
      (await subscription.unsubscribe())
    ) {
      unsubscribedCount += 1;
    }
  }

  return unsubscribedCount;
}

export default function AdminDeviceCleanupPage() {
  useEffect(() => {
    if (!isAuthorizedAdminCleanup()) {
      return;
    }

    void removeAllMemberWebPushSubscriptions()
      .then((unsubscribedCount) => {
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

        window.parent?.postMessage(
          {
            type:
              "HJTAICHI_MEMBER_PUSH_CLEANUP_COMPLETE",
            unsubscribedCount,
          },
          "https://admin.hjtaichi.com"
        );
      })
      .catch((error) => {
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
      });
  }, []);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: 1,
        height: 1,
        opacity: 0,
      }}
    />
  );
}
