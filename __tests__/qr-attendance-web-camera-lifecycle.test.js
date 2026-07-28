const fs = require("fs");
const path = require("path");

describe("WebQrScanner camera lifecycle source guard", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "app", "qr-attendance.js"),
    "utf8"
  );

  test("keeps onScan updates outside the camera start effect", () => {
    expect(source).toContain("const onScanRef = useRef(onScan);");
    expect(source).toContain("onScanRef.current = onScan;");
    expect(source).toContain("onScanRef.current?.({ data: text });");
  });

  test("does not restart the camera when onScan identity changes", () => {
    expect(source).toContain("}, [disabled]);");
    expect(source).not.toContain("}, [disabled, onScan]);");
  });

  test("still releases camera tracks during cleanup", () => {
    expect(source).toContain("disposed = true;");
    expect(source).toContain("releaseCamera();");
  });
});