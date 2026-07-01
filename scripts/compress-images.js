import fs from "fs/promises";
import path from "path";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminWebp from "imagemin-webp";

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, "assets", "images");
const BACKUP_DIR = path.join(ROOT, "assets", "images_original_backup");

const KEEP_PNG_DIR_KEYWORDS = ["icon", "icons", "logo", "logos"];
const WEBP_EXTS = [".png", ".jpg", ".jpeg"];
const MIN_WEBP_SIZE = 150 * 1024; // 150KB 이상만 WebP 생성

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (fullPath.includes("images_original_backup")) continue;
      files.push(...(await walk(fullPath)));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (WEBP_EXTS.includes(ext)) files.push(fullPath);
    }
  }

  return files;
}

async function backupFile(filePath) {
  const relativePath = path.relative(IMAGE_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);

  if (await exists(backupPath)) return;

  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
}

function shouldKeepPng(filePath, size) {
  const lowerPath = filePath.toLowerCase();

  if (path.extname(filePath).toLowerCase() !== ".png") return false;

  const isIconOrLogo = KEEP_PNG_DIR_KEYWORDS.some((keyword) =>
    lowerPath.includes(keyword)
  );

  return isIconOrLogo || size < MIN_WEBP_SIZE;
}

async function compressOriginal(filePath) {
  const originalBuffer = await fs.readFile(filePath);

  const compressedBuffer = await imagemin.buffer(originalBuffer, {
    plugins: [
      imageminPngquant({
        quality: [0.75, 0.9],
        speed: 3,
      }),
      imageminMozjpeg({
        quality: 82,
        progressive: true,
      }),
    ],
  });

  if (!compressedBuffer || compressedBuffer.length >= originalBuffer.length) {
    return {
      changed: false,
      originalSize: originalBuffer.length,
      newSize: originalBuffer.length,
    };
  }

  await backupFile(filePath);
  await fs.writeFile(filePath, compressedBuffer);

  return {
    changed: true,
    originalSize: originalBuffer.length,
    newSize: compressedBuffer.length,
  };
}

async function createWebp(filePath) {
  const originalBuffer = await fs.readFile(filePath);
  const webpPath = filePath.replace(/\.(png|jpg|jpeg)$/i, ".webp");

  const webpBuffer = await imagemin.buffer(originalBuffer, {
    plugins: [
      imageminWebp({
        quality: 78,
      }),
    ],
  });

  if (!webpBuffer || webpBuffer.length >= originalBuffer.length) {
    return {
      created: false,
      webpPath,
      originalSize: originalBuffer.length,
      webpSize: originalBuffer.length,
    };
  }

  await backupFile(filePath);
  await fs.writeFile(webpPath, webpBuffer);

  return {
    created: true,
    webpPath,
    originalSize: originalBuffer.length,
    webpSize: webpBuffer.length,
  };
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function main() {
  if (!(await exists(IMAGE_DIR))) {
    console.error("assets/images 폴더를 찾을 수 없습니다.");
    process.exit(1);
  }

  const files = await walk(IMAGE_DIR);

  console.log(`이미지 ${files.length}개 최적화를 시작합니다.`);

  let pngJpgChanged = 0;
  let webpCreated = 0;
  let savedTotal = 0;

  for (const filePath of files) {
    const buffer = await fs.readFile(filePath);
    const relativePath = path.relative(ROOT, filePath);

    if (shouldKeepPng(filePath, buffer.length)) {
      const result = await compressOriginal(filePath);

      if (result.changed) {
        pngJpgChanged += 1;
        savedTotal += result.originalSize - result.newSize;
        console.log(
          `PNG/JPG 압축: ${relativePath} / ${kb(result.originalSize)} → ${kb(
            result.newSize
          )}`
        );
      }

      continue;
    }

    const result = await createWebp(filePath);

    if (result.created) {
      webpCreated += 1;
      savedTotal += result.originalSize - result.webpSize;

      console.log(
        `WebP 생성: ${relativePath} / ${kb(result.originalSize)} → ${kb(
          result.webpSize
        )}`
      );
    } else {
      const compressed = await compressOriginal(filePath);

      if (compressed.changed) {
        pngJpgChanged += 1;
        savedTotal += compressed.originalSize - compressed.newSize;

        console.log(
          `PNG/JPG 압축: ${relativePath} / ${kb(
            compressed.originalSize
          )} → ${kb(compressed.newSize)}`
        );
      }
    }
  }

  console.log("");
  console.log("완료");
  console.log(`PNG/JPG 압축: ${pngJpgChanged}개`);
  console.log(`WebP 생성: ${webpCreated}개`);
  console.log(`절약 예상 용량: ${kb(savedTotal)}`);
  console.log(`원본 백업 위치: assets/images_original_backup`);
}

main().catch((error) => {
  console.error("이미지 최적화 중 오류가 발생했습니다.");
  console.error(error);
  process.exit(1);
});