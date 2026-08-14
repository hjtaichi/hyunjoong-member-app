const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8",
  );
}

describe("home notification red dot contract", () => {
  test("bell red dot follows unread member notifications only", () => {
    const home = read("app/(tabs)/home.jsx");
    const header = read(
      "src/features/home/components/HomeHeader.jsx",
    );

    expect(header).not.toMatch(
      /hasUnreadNotice\s*\|\|\s*hasUnreadMemberNotification/,
    );

    expect(header).not.toMatch(
      /hasUnreadMemberNotification\s*\|\|\s*hasUnreadNotice/,
    );

    expect(header).toContain(
      "hasUnreadMemberNotification && (",
    );

    expect(header).not.toMatch(
      /\bhasUnreadNotice\b/,
    );

    expect(home).not.toContain(
      "hasUnreadNotice={hasUnreadNotice}",
    );

    expect(home).toContain(
      "hasUnreadMemberNotification={hasUnreadMemberNotification}",
    );
  });
});
