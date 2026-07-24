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

  test("web manifest separates the large PWA splash icons from the compact launcher maskable icons", () => {
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
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icon-splash-192-v104.png",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icon-splash-512-v104.png",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icon-maskable-192-v107.png",
          purpose: "maskable",
        }),
        expect.objectContaining({
          src: "/icon-maskable-512-v107.png",
          purpose: "maskable",
        }),
      ])
    );
  });

  test("HTML forces the v104 manifest to be fetched instead of a cached manifest", () => {
    const source = read("app/+html.jsx");

    expect(source).toContain(
      '<link rel="manifest" href="/manifest.json?v=107" />'
    );
    expect(source).toContain(
      '<meta name="theme-color" content="#071A39" />'
    );
  });
});
