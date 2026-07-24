const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(__dirname, "..", relativePath),
    "utf8"
  );
}

describe("admin-device push isolation and navy splash", () => {
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
      '"/sw.js?v=20260724-v3"'
    );
  });

  test("admin web can immediately clean the member-app subscription through the app-origin cleanup route", () => {
    const source = read(
      "app/admin-device-cleanup.jsx"
    );

    expect(source).toContain(
      "https://admin.hjtaichi.com/"
    );
    expect(source).toContain(
      "navigator.serviceWorker.getRegistrations()"
    );
    expect(source).toContain(
      "await subscription.unsubscribe()"
    );
    expect(source).toContain(
      "HJTAICHI_MEMBER_PUSH_CLEANUP_COMPLETE"
    );
  });

  test("member service worker rejects admin-audience push and uses v103 icons", () => {
    const source = read("public/sw.js");

    expect(source).toContain(
      'data.audience === "admin"'
    );
    expect(source).toContain(
      'data.receiverRole === "admin"'
    );
    expect(source).toContain(
      "/icon-192-v103.png"
    );
  });

  test("native splash uses the transparent gold logo at twice the previous width", () => {
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
    expect(plugin[1].backgroundColor).toBe(
      config.expo.web.backgroundColor
    );
    expect(plugin[1].backgroundColor).toBe(
      config.expo.web.themeColor
    );
    expect(plugin[1].backgroundColor).toBe(
      config.expo.android.adaptiveIcon
        .backgroundColor
    );
  });

  test("web manifest uses matching navy v103 regular and maskable icons", () => {
    const config = JSON.parse(read("app.json"));
    const manifest = JSON.parse(
      read("public/manifest.json")
    );

    expect(manifest.background_color).toBe(
      "#071A39"
    );
    expect(manifest.background_color).toBe(
      config.expo.web.backgroundColor
    );
    expect(manifest.theme_color).toBe(
      config.expo.web.themeColor
    );

    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icon-192-v103.png",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icon-512-v103.png",
          purpose: "any",
        }),
        expect.objectContaining({
          src: "/icon-maskable-192-v103.png",
          purpose: "maskable",
        }),
        expect.objectContaining({
          src: "/icon-maskable-512-v103.png",
          purpose: "maskable",
        }),
      ])
    );
  });

  test("HTML theme color is the same navy as the manifest", () => {
    const source = read("app/+html.jsx");

    expect(source).toContain(
      '<meta name="theme-color" content="#071A39" />'
    );
    expect(source).not.toContain("#2B221D");
  });
});
