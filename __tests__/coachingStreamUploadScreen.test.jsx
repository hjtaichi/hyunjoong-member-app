const fs = require("fs");
const path = require("path");

describe("coaching upload screen Stream integration", () => {
  test("uses Stream upload instead of legacy multipart", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "app",
        "coaching-upload.jsx"
      ),
      "utf8"
    );

    expect(source).toContain(
      "uploadCoachingVideoToStream"
    );
    expect(source).toContain(
      "setUploadProgress"
    );
    expect(source).toContain(
      "onStageChange: setUploadStage"
    );
    expect(source).not.toContain(
      'formData.append("video"'
    );
    expect(source).not.toContain(
      "captureVideoThumbnail"
    );
  });

  test("keeps client size and duration guards", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "app",
        "coaching-upload.jsx"
      ),
      "utf8"
    );

    expect(source).toContain(
      "250 * 1024 * 1024"
    );
    expect(source).toContain(
      "duration > 180"
    );
  });
});