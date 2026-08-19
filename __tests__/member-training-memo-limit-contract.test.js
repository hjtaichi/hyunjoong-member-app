const fs = require("fs");
const path = require("path");

describe("member training memo 100-char limit contract", () => {
  test("member memo UI limit is 100 characters", () => {
    const source = fs.readFileSync(
      path.join(
        __dirname,
        "../src/features/taegukwon/useTaegukwonScreen.js"
      ),
      "utf8"
    );

    expect(source).toContain(
      "const MEMBER_MEMO_MAX_LENGTH = 100;"
    );

    expect(source).not.toContain(
      "const MEMBER_MEMO_MAX_LENGTH = 60;"
    );
  });

  test("memo modal receives the shared maxLength value", () => {
    const source = fs.readFileSync(
      path.join(
        __dirname,
        "../app/(tabs)/taegukwon.jsx"
      ),
      "utf8"
    );

    expect(source).toContain(
      "maxLength={MEMBER_MEMO_MAX_LENGTH}"
    );
  });
});