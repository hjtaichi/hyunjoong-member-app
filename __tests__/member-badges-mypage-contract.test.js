const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

describe("my page member badge contract", () => {
  test("my page passes the same home API badge list into the hero card", () => {
    const source = read("app/(tabs)/mypage.jsx");

    expect(source).toContain(
      "memberBadges={homeData?.member?.badges || []}"
    );
    expect(source).not.toContain("memberBadges={user");
  });

  test("hero replaces the yudanja text chip with tiny interactive icons", () => {
    const source = read(
      "src/features/mypage/components/MyPageHeroCard.jsx"
    );

    expect(source).toContain(
      'import BadgeInfoModal from "../../home/components/BadgeInfoModal";'
    );
    expect(source).toContain(
      'import { getMemberBadgeImageSource } from "../../home/memberBadges";'
    );
    expect(source).toContain("Array.isArray(memberBadges)");
    expect(source).toContain("visibleBadges.map((badge)");
    expect(source).toContain("width: 24");
    expect(source).toContain("height: 24");
    expect(source).toContain("<BadgeInfoModal");
    expect(source).not.toContain(
      "<Text style={styles.heroYudanjaBadgeText}>유단자회</Text>"
    );
  });
});
