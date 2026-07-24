const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(__dirname, "..", relativePath),
    "utf8"
  );
}

describe("member coaching playback screen", () => {
  test("loads an owned playback response instead of concatenating stored Stream URLs", () => {
    const source = read("app/coaching-detail.jsx");

    expect(source).toContain(
      "/api/me/coaching-videos/${videoId}/playback"
    );
    expect(source).toContain(
      "setPlayback(result?.data || null)"
    );
    expect(source).not.toContain(
      "`${API_BASE_URL}${params.videoUrl}`"
    );
    expect(source).not.toContain(
      'startsWith("cloudflare-stream://") ? value'
    );
  });

  test("uses Cloudflare iframe on web and HLS/DASH with expo-video elsewhere", () => {
    const source = read("app/coaching-detail.jsx");

    expect(source).toContain(
      'Platform.OS === "web"'
    );
    expect(source).toContain(
      "playback?.iframeUrl"
    );
    expect(source).toContain("<iframe");
    expect(source).toContain(
      "playback?.hlsUrl"
    );
    expect(source).toContain(
      "playback?.dashUrl"
    );
    expect(source).toContain(
      "player.replace(playerSource)"
    );
  });

  test("builds API-origin URLs without duplicating /api", () => {
    const source = read("app/coaching-detail.jsx");

    expect(source).toMatch(
      /API_ORIGIN\s*=\s*API_BASE_URL\.replace\([\s\S]*\/api/
    );
    expect(source).toContain(
      "function buildApiUrl(pathname)"
    );
    expect(source).toContain(
      "function getMediaUrl(url)"
    );
  });
});
