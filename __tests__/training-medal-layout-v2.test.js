const fs = require("fs");
const path = require("path");

const gallery = fs.readFileSync(
  path.join(process.cwd(), "app/training-medals.jsx"),
  "utf8"
);

describe("training medal final gallery layout", () => {
  test("renders one cabinet per page", () => {
    expect(gallery).toContain(
      "<Cabinet items={currentCabinetItems} />"
    );
    expect(gallery).toContain(
      "const [pageIndex, setPageIndex]"
    );
  });

  test("keeps current cabinet and medal sizing", () => {
    expect(gallery).toContain(
      "aspectRatio: 1150 / 2000"
    );
    expect(gallery).toContain("width: 48");
    expect(gallery).toContain("height: 69");
    expect(gallery).toContain("width: 78");
    expect(gallery).toContain("height: 78");
  });

  test("keeps page navigation controls", () => {
    expect(gallery).toContain("이전");
    expect(gallery).toContain("다음");
    expect(gallery).toContain("pageDots");
  });
});