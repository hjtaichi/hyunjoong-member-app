const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(__dirname, "..", relativePath),
    "utf8"
  );
}

describe("admin-device push isolation and separated launcher/splash icons", () => {
  test("member Web Push is removed from every app-origin service worker on an admin-managed browser", () => {
    const source = read("app/_layout.jsx");

    expect(source).toContain(
      "function isAdminManagedBrowser()"
    );
    expect(source).toContain(
      "hjtaichi_admin_device=1"
    );
    expect(source).toContain(
      "navigator.serviceWorker.getRegistrations()"
    );
    expect(source).toContain(
      "await subscription.unsubscribe()"
    );
    expect(source).toContain(
      "await removeMemberWebPushFromAdminBrowser()"
    );
    expect(source).toContain(
      "hjtaichi_member_web_push_cleanup_status"
    );
    expect(source).toContain(
      '"/sw.js?v=20260724-v4"'
    );
  });

  test("admin web can clean the member-app subscription through the app-origin cleanup route", () => {
    const source = read(
      "app/admin-device-cleanup.jsx"
    );

    expect(source).toContain(
      '"https://admin.hjtaichi.com"'
    );
    expect(source).toContain(
      "navigator.serviceWorker.getRegistrations()"
    );
    expect(source).toContain(
      "await subscription.unsubscribe()"
    );
    expect(source).toContain(
      "memberPushCleanup"
    );
    expect(source).toContain(
      "window.location.replace("
    );
  });

  test("member service worker rejects admin-audience push and uses the compact notification icon", () => {
    const source = read("public/sw.js");

    expect(source).toContain(
      'data.audience === "admin"'
    );
    expect(source).toContain(
      'data.receiverRole === "admin"'
    );
    expect(source).toContain(
      "/icon-192.png?v=104"
    );
  });

  test("native splash keeps the large transparent logo at width 300", () => {
    const config = JSON.parse(
      read("app.json")
    );

    const plugin = config.expo.plugins.find(
      (item) =>
        Array.isArray(item) &&
        item[0] === "expo-splash-screen"
    );

    expect(plugin).toBeTruthy();
    expect(plugin[1]).toMatchObject({
      image:
        "./assets/images/splash-icon.png",
      resizeMode: "contain",
      imageWidth: 300,
    });

    expect(plugin[1].dark).toMatchObject({
      image:
        "./assets/images/splash-icon.png",
      imageWidth: 300,
    });

    expect(plugin[1].backgroundColor).toBe(
      "#071A39"
    );
  });

  test("web manifest uses color-matched maskable icons for Android PWA launch and home screen", () => {
  const manifest = JSON.parse(
    read("public/manifest.json")
  );

  expect(manifest.background_color).toBe(
    "#071A39"
  );
  expect(manifest.theme_color).toBe(
    "#071A39"
  );
  expect(manifest.icons).toEqual(
    [
      {
        src: "/icon-maskable-192-v112.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512-v112.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ]
  );
});

test("HTML forces the v112 manifest to be fetched instead of a cached manifest", () => {
    const source = read("app/+html.jsx");

    expect(source).toContain(
      '<link rel="manifest" href="/manifest.json?v=112" />'
    );
    expect(source).toContain(
      '<meta name="theme-color" content="#071A39" />'
    );
  });
});
