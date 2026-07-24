import * as tus from "tus-js-client";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const DEFAULT_FINALIZE_ATTEMPTS = 30;
const DEFAULT_FINALIZE_DELAY_MS = 3000;

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseJsonSafe(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "서버 응답을 읽지 못했습니다.",
    };
  }
}

async function authenticatedJsonRequest(
  path,
  token,
  {
    method = "GET",
    body,
    fetchImpl = fetch,
  } = {}
) {
  const response = await fetchImpl(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const error = new Error(
      data?.message || "요청에 실패했습니다."
    );

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function requestCoachingStreamUploadUrl({
  token,
  title,
  file,
  fetchImpl,
}) {
  const result = await authenticatedJsonRequest(
    "/api/me/coaching-videos/direct-upload-url",
    token,
    {
      method: "POST",
      body: {
        title: String(title || ""),
        fileSize: Number(file?.size || 0),
        fileName: String(file?.name || ""),
        fileType: String(file?.type || ""),
      },
      fetchImpl,
    }
  );

  const data = result?.data || {};

  if (!data.uploadURL || !data.uid) {
    throw new Error(
      "영상 업로드 주소를 확인할 수 없습니다."
    );
  }

  return data;
}

export function uploadFileToCloudflareStream({
  file,
  uploadURL,
  onProgress,
  tusImpl = tus,
}) {
  return new Promise((resolve, reject) => {
    const upload = new tusImpl.Upload(file, {
      uploadUrl: uploadURL,
      uploadSize: file.size,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      removeFingerprintOnSuccess: true,
      metadata: {
        filename: file.name || "coaching-video",
        filetype: file.type || "video/mp4",
      },
      onError(error) {
        reject(
          error instanceof Error
            ? error
            : new Error("영상 전송에 실패했습니다.")
        );
      },
      onProgress(bytesUploaded, bytesTotal) {
        const percent =
          bytesTotal > 0
            ? Math.min(
                100,
                Math.round(
                  (bytesUploaded / bytesTotal) * 100
                )
              )
            : 0;

        onProgress?.(percent);
      },
      onSuccess() {
        resolve({
          uploadUrl: upload.url || uploadURL,
        });
      },
    });

    upload
      .findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length > 0) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        upload.start();
      })
      .catch(reject);
  });
}

export async function finalizeCoachingStreamUpload({
  token,
  payload,
  attempts = DEFAULT_FINALIZE_ATTEMPTS,
  delayMs = DEFAULT_FINALIZE_DELAY_MS,
  fetchImpl,
  sleepImpl = sleep,
  onWaiting,
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await authenticatedJsonRequest(
        "/api/me/coaching-videos/stream-finalize",
        token,
        {
          method: "POST",
          body: payload,
          fetchImpl,
        }
      );

      if (result?.data?.state === "processing") {
        const processingError = new Error(
          result?.message ||
            "영상 변환이 아직 완료되지 않았습니다."
        );
        processingError.status = 202;
        throw processingError;
      }

      return result;
    } catch (error) {
      lastError = error;

      if (
        ![202, 409].includes(error?.status) ||
        attempt === attempts
      ) {
        throw error;
      }

      onWaiting?.({
        attempt,
        attempts,
      });

      await sleepImpl(delayMs);
    }
  }

  throw (
    lastError ||
    new Error("영상 변환 완료를 확인하지 못했습니다.")
  );
}

export async function uploadCoachingVideoToStream({
  token,
  file,
  metadata,
  onProgress,
  onStageChange,
  fetchImpl,
  tusImpl,
  sleepImpl,
}) {
  onStageChange?.("requesting");

  const directUpload =
    await requestCoachingStreamUploadUrl({
      token,
      title: metadata?.title,
      file,
      fetchImpl,
    });

  onStageChange?.("uploading");

  await uploadFileToCloudflareStream({
    file,
    uploadURL: directUpload.uploadURL,
    onProgress,
    tusImpl,
  });

  onStageChange?.("processing");

  const finalized = await finalizeCoachingStreamUpload({
    token,
    payload: {
      streamUid: directUpload.uid,
      originalName: file.name || "",
      trainingType: metadata?.trainingType || "",
      curriculum: metadata?.curriculum || "",
      movement: metadata?.curriculum || "",
      title: metadata?.title || "",
      question: metadata?.question || "",
    },
    fetchImpl,
    sleepImpl,
    onWaiting() {
      onStageChange?.("processing");
    },
  });

  onStageChange?.("complete");

  return finalized;
}