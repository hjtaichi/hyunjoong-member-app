const fs = require("fs");
const path = require("path");

describe("Firefox Android PWA install icon contract", () => {
  const root = process.cwd();

  test("manifest provides install icons for both any and maskable contexts", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(root, "public", "manifest.json"),
        "utf8",
      ),
    );

    const icon192 = manifest.icons.find(
      (icon) =>
        icon.src === "/icon-maskable-192-v112.png" &&
        icon.sizes === "192x192",
    );

    const icon512 = manifest.icons.find(
      (icon) =>
        icon.src === "/icon-maskable-512-v112.png" &&
        icon.sizes === "512x512",
    );

    expect(icon192).toBeTruthy();
    expect(icon512).toBeTruthy();

    expect(icon192.purpose.split(/\s+/)).toEqual(
      expect.arrayContaining(["any", "maskable"]),
    );

    expect(icon512.purpose.split(/\s+/)).toEqual(
      expect.arrayContaining(["any", "maskable"]),
    );
  });

  test("custom HTML cache-busts the corrected manifest", () => {
    const html = fs.readFileSync(
      path.join(root, "app", "+html.jsx"),
      "utf8",
    );

    expect(html).toContain("/manifest.json?v=114");
    expect(html).not.toContain("/manifest.json?v=112");
  });

  test("PWA identity remains unchanged", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(root, "public", "manifest.json"),
        "utf8",
      ),
    );

    expect(manifest.name).toBe("현중태극권");
    expect(manifest.short_name).toBe("현중태극권");
    expect(manifest.start_url).toBe("/login");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
  });
});