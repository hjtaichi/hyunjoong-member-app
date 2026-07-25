const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const forbiddenHeader = [
  "ngrok",
  "skip",
  "browser",
  "warning",
].join("-");

const scanRoots = [
  "app",
  "src",
  "components",
  "contexts",
  "hooks",
  "services",
  "utils",
  "public",
];

const allowedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);

const excludedDirectories = new Set([
  "node_modules",
  ".git",
  ".expo",
  "dist",
  "build",
  "coverage",
  "review-results",
  "analysis-results",
  "member-app-legacy-backup",
  "legacy-backup",
  "backup",
  "backups",
]);

function collectFiles(directory, output) {
  if (!fs.existsSync(directory)) return;

  for (const entry of fs.readdirSync(
    directory,
    { withFileTypes: true }
  )) {
    if (
      entry.isDirectory() &&
      excludedDirectories.has(entry.name)
    ) {
      continue;
    }

    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      collectFiles(fullPath, output);
      continue;
    }

    if (
      entry.isFile() &&
      allowedExtensions.has(
        path.extname(entry.name).toLowerCase()
      )
    ) {
      output.push(fullPath);
    }
  }
}

describe("legacy ngrok request header removal", () => {
  test("runtime source does not send the legacy header", () => {
    const files = [];

    for (const relativeRoot of scanRoots) {
      collectFiles(
        path.join(projectRoot, relativeRoot),
        files
      );
    }

    const offenders = files
      .filter((filePath) =>
        fs
          .readFileSync(filePath, "utf8")
          .includes(forbiddenHeader)
      )
      .map((filePath) =>
        path.relative(projectRoot, filePath)
      );

    expect(offenders).toEqual([]);
  });
});