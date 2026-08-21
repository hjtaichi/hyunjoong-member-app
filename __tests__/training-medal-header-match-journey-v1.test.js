const fs = require("fs");
const path = require("path");

const journey = fs.readFileSync(
  path.join(process.cwd(), "app/training-journey.jsx"),
  "utf8"
);

const medals = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medals header matches training journey", () => {
  test("reference journey keeps ScreenHeader inside its ScrollView", () => {
    expect(journey).toContain(
      '<ScrollView style={styles.screen} contentContainerStyle={styles.content}>'
    );
    expect(journey).toContain(
      '<ScreenHeader title="수련 여정" />'
    );
  });

  test("medal screen also puts ScreenHeader inside the page ScrollView", () => {
    expect(medals).toContain(
      'style={styles.screen}'
    );
    expect(medals).toContain(
      'contentContainerStyle={styles.content}'
    );
    expect(medals).toContain(
      'title="수련의 결실"'
    );

    const scrollIndex = medals.indexOf("<ScrollView");
    const headerIndex = medals.indexOf("<ScreenHeader");
    expect(scrollIndex).toBeGreaterThanOrEqual(0);
    expect(headerIndex).toBeGreaterThan(scrollIndex);
  });

  test("temporary header spacer is gone", () => {
    expect(medals).not.toContain("headerSpacer");
  });
});