import {
  arrayBufferToUrlBase64,
  ensureWebPushSubscription,
  subscriptionUsesPublicKey,
  urlBase64ToUint8Array,
} from "../src/features/push/webPushSubscription";

const PUBLIC_KEY =
  "BEl62iUYgUivxIkv69yViEuiBIa40HI4BI3pQ7M1QvUP9qBDDWAIxTHCtzYm3UXed0V7EaFPGzFWpAtvmRDiF1A";

function makeSubscription(key = PUBLIC_KEY) {
  return {
    options: {
      applicationServerKey:
        urlBase64ToUint8Array(key),
    },
    unsubscribe: jest.fn().mockResolvedValue(true),
    toJSON: jest.fn(() => ({
      endpoint: "https://push.example/subscription",
      keys: {
        p256dh: "p256dh",
        auth: "auth",
      },
    })),
  };
}

describe("webPushSubscription", () => {
  test("Base64 URL 공개키를 Uint8Array로 왕복한다", () => {
    const bytes =
      urlBase64ToUint8Array(PUBLIC_KEY);

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(arrayBufferToUrlBase64(bytes)).toBe(
      PUBLIC_KEY
    );
  });

  test("기존 구독이 같은 공개키인지 확인한다", () => {
    const subscription =
      makeSubscription(PUBLIC_KEY);

    expect(
      subscriptionUsesPublicKey(
        subscription,
        PUBLIC_KEY
      )
    ).toBe(true);
  });

  test("같은 키의 기존 구독은 그대로 사용한다", async () => {
    const subscription =
      makeSubscription(PUBLIC_KEY);

    const registration = {
      pushManager: {
        getSubscription: jest
          .fn()
          .mockResolvedValue(subscription),
        subscribe: jest.fn(),
      },
    };

    const result =
      await ensureWebPushSubscription(
        registration,
        PUBLIC_KEY
      );

    expect(result).toBe(subscription);
    expect(
      subscription.unsubscribe
    ).not.toHaveBeenCalled();
    expect(
      registration.pushManager.subscribe
    ).not.toHaveBeenCalled();
  });

  test("공개키가 바뀌면 기존 구독을 해제하고 다시 구독한다", async () => {
    const oldKey =
      "BLpKPsTKmO0sQjN4bNFDgD7jkYCX08Hj6YWuR1zDKcN9Oq7k46ZvPYnoN8V77brEsTSzOjDj4o0QblcIfG8d79I";
    const oldSubscription =
      makeSubscription(oldKey);
    const renewedSubscription =
      makeSubscription(PUBLIC_KEY);

    const registration = {
      pushManager: {
        getSubscription: jest
          .fn()
          .mockResolvedValue(oldSubscription),
        subscribe: jest
          .fn()
          .mockResolvedValue(
            renewedSubscription
          ),
      },
    };

    const result =
      await ensureWebPushSubscription(
        registration,
        PUBLIC_KEY
      );

    expect(
      oldSubscription.unsubscribe
    ).toHaveBeenCalledTimes(1);
    expect(
      registration.pushManager.subscribe
    ).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey:
        expect.any(Uint8Array),
    });
    expect(result).toBe(
      renewedSubscription
    );
  });

  test("저장된 키가 달라 강제 갱신할 때도 재구독한다", async () => {
    const oldSubscription =
      makeSubscription(PUBLIC_KEY);
    const renewedSubscription =
      makeSubscription(PUBLIC_KEY);

    const registration = {
      pushManager: {
        getSubscription: jest
          .fn()
          .mockResolvedValue(oldSubscription),
        subscribe: jest
          .fn()
          .mockResolvedValue(
            renewedSubscription
          ),
      },
    };

    await ensureWebPushSubscription(
      registration,
      PUBLIC_KEY,
      {
        forceRenew: true,
      }
    );

    expect(
      oldSubscription.unsubscribe
    ).toHaveBeenCalledTimes(1);
    expect(
      registration.pushManager.subscribe
    ).toHaveBeenCalledTimes(1);
  });
});
