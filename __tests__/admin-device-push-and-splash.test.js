const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(__dirname, "..", relativePath),
    "utf8"
  );
}

describe("admin-device push isolation and navy splash", () => {
  test("member Web Push is removed from a browser marked as an admin device", () => {
    const source = read("app/_layout.jsx");

    expect(source).toContain(
      "function isAdminManagedBrowser()"
    );
    expect(source).toContain(
      "hjtaichi_admin_device=1"
    );
    expect(source).toContain(
      "await subscription.unsubscribe()"
    );
    expect(source).toContain(
      "await removeMemberWebPushFromAdminBrowser()"
    );
    expect(source).not.toContain("console.warn(");
    expect(source).not.toContain("console.error(");
    expect(source).toContain(
      "hjtaichi_member_web_push_cleanup_status"
    );
  });

  test("splash uses the gold foreground logo at 1.5 times the default width", () => {
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
        "./assets/images/android-icon-foreground.png",
      resizeMode: "contain",
      imageWidth: 150,
    });

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

  test("web manifest uses the same navy launch background when present", () => {
    const manifestPath = path.join(
      __dirname,
      "..",
      "public",
      "manifest.json"
    );

    if (!fs.existsSync(manifestPath)) {
      return;
    }

    const config = JSON.parse(read("app.json"));
    const manifest = JSON.parse(
      fs.readFileSync(manifestPath, "utf8")
    );

    expect(manifest.background_color).toBe(
      config.expo.web.backgroundColor
    );
    expect(manifest.theme_color).toBe(
      config.expo.web.themeColor
    );
  });
});
