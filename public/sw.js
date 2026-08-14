self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function parsePushPayload(event) {
  if (!event.data) {
    return {};
  }

  try {
    return event.data.json();
  } catch {
    return {
      title: "현중태극권",
      body: event.data.text(),
      data: {},
    };
  }
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  const data = payload.data || {};

  if (
    data.audience === "admin" ||
    data.receiverRole === "admin"
  ) {
    event.waitUntil(Promise.resolve());
    return;
  }

  const title =
    payload.title || "현중태극권";

  const options = {
    body: payload.body || "",
    icon: "/icon-192.png?v=104",
    badge: "/notification-badge.png?v=115",
    tag:
      data.notificationId ||
      `${data.type || "member"}-${Date.now()}`,
    data,
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetUrl =
      event.notification?.data?.targetUrl ||
      "/";

    const absoluteUrl = new URL(
      targetUrl,
      self.location.origin
    ).href;

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          const existingClient =
            clientList.find(
              (client) =>
                client.url.startsWith(
                  self.location.origin
                )
            );

          if (existingClient) {
            existingClient.navigate(absoluteUrl);
            return existingClient.focus();
          }

          return self.clients.openWindow(
            absoluteUrl
          );
        })
    );
  }
);
