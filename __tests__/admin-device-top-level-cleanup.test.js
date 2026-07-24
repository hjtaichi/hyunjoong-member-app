const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      __dirname,
      "..",
      relativePath
    ),
    "utf8"
  );
}

describe("top-level admin-device member push cleanup", () => {
  test("the cleanup page removes app-origin Web Push and returns to the admin origin", () => {
    const source = read(
      "app/admin-device-cleanup.jsx"
    );

    expect(source).toContain(
      "navigator.serviceWorker"
    );
    expect(source).toContain(
      ".getRegistrations()"
    );
    expect(source).toContain(
      "await subscription.unsubscribe()"
    );
    expect(source).toContain(
      '"memberPushCleanup",'
    );
    expect(source).toContain(
      "window.location.replace("
    );
    expect(source).toContain(
      '"https://admin.hjtaichi.com"'
    );
  });

  test("the cleanup page records success before returning", () => {
    const source = read(
      "app/admin-device-cleanup.jsx"
    );

    expect(source).toContain(
      '"hjtaichi_member_web_push_cleanup_status"'
    );
    expect(source).toContain(
      '"complete"'
    );
    expect(source).toContain(
      '"hjtaichi_member_web_push_cleanup_count"'
    );
  });
});
