const fs = require("fs");
const path = require("path");

function read(relativePath) {
  return fs.readFileSync(
    path.join(process.cwd(), relativePath),
    "utf8",
  );
}

describe("회원앱 도장앨범 행사일 표시 회귀 보호", () => {
  test("대표 및 일반 앨범 목록에 행사일을 표시한다", () => {
    const source = read("app/dojang-album/index.jsx");

    expect(source).toContain(
      "행사일 {formatDate(featuredAlbum.eventDate)}",
    );
    expect(source).toContain(
      "행사일 {formatDate(album.eventDate)}",
    );
  });

  test("앨범 상세 상단과 정보 카드에 행사일을 표시한다", () => {
    const source = read("app/dojang-album/[albumId].jsx");

    expect(source).toContain(
      "행사일 {formatDate(album?.eventDate)} · 사진",
    );
    expect(source).toContain(
      "<Text style={styles.infoValue}>{formatDate(album?.eventDate)}</Text>",
    );
  });
});
