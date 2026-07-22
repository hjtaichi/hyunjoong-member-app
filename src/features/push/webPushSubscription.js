export function urlBase64ToUint8Array(base64String) {
  const value = String(base64String || "").trim();

  if (!value) {
    throw new Error("Web Push 공개키가 필요합니다.");
  }

  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const binary =
    typeof window !== "undefined" && window.atob
      ? window.atob(base64)
      : globalThis.atob(base64);

  const output = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    output[index] = binary.charCodeAt(index);
  }

  return output;
}

export function arrayBufferToUrlBase64(value) {
  if (!value) return "";

  const bytes =
    value instanceof Uint8Array
      ? value
      : new Uint8Array(value);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 =
    typeof window !== "undefined" && window.btoa
      ? window.btoa(binary)
      : globalThis.btoa(binary);

  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function subscriptionUsesPublicKey(
  subscription,
  publicKey
) {
  const applicationServerKey =
    subscription?.options?.applicationServerKey;

  if (!applicationServerKey) {
    return null;
  }

  return (
    arrayBufferToUrlBase64(applicationServerKey) ===
    String(publicKey || "").trim()
  );
}

export async function ensureWebPushSubscription(
  registration,
  publicKey,
  options = {}
) {
  if (!registration?.pushManager) {
    throw new Error("PushManager를 사용할 수 없습니다.");
  }

  const forceRenew = options.forceRenew === true;
  let subscription =
    await registration.pushManager.getSubscription();

  const keyMatches = subscription
    ? subscriptionUsesPublicKey(subscription, publicKey)
    : null;

  if (
    subscription &&
    (forceRenew || keyMatches === false)
  ) {
    const unsubscribed =
      await subscription.unsubscribe();

    if (!unsubscribed) {
      throw new Error(
        "기존 Web Push 구독을 해제하지 못했습니다."
      );
    }

    subscription = null;
  }

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(publicKey),
      });
  }

  return subscription;
}
