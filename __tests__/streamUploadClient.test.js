import {
  requestCoachingStreamUploadUrl,
  finalizeCoachingStreamUpload,
  uploadFileToCloudflareStream,
} from "../src/features/coaching/streamUploadClient";

describe("Stream coaching upload client", () => {
  test("requests a direct upload URL", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () =>
        JSON.stringify({
          data: {
            uploadURL:
              "https://upload.videodelivery.net/direct",
            uid: "stream-1",
          },
        }),
    });

    const result =
      await requestCoachingStreamUploadUrl({
        token: "member-token",
        title: "연습",
        fetchImpl,
      });

    expect(result.uid).toBe("stream-1");

    const [url, options] = fetchImpl.mock.calls[0];

    expect(url).toContain(
      "/api/me/coaching-videos/direct-upload-url"
    );
    expect(options.headers.Authorization).toBe(
      "Bearer member-token"
    );
  });

  test("uploads through tus and reports progress", async () => {
    const progress = [];

    class MockUpload {
      constructor(file, options) {
        this.options = options;
        this.url = "https://upload.example/resume";
      }

      findPreviousUploads() {
        return Promise.resolve([]);
      }

      start() {
        this.options.onProgress(50, 100);
        this.options.onSuccess();
      }
    }

    await uploadFileToCloudflareStream({
      file: {
        name: "practice.mp4",
        type: "video/mp4",
        size: 100,
      },
      uploadURL: "https://upload.example",
      onProgress: (value) => progress.push(value),
      tusImpl: {
        Upload: MockUpload,
      },
    });

    expect(progress).toEqual([50]);
  });

  test("retries finalize while Stream is processing", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () =>
          JSON.stringify({
            message:
              "영상 변환이 아직 완료되지 않았습니다.",
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () =>
          JSON.stringify({
            data: {
              id: "video-1",
              streamUid: "stream-1",
            },
          }),
      });

    const result =
      await finalizeCoachingStreamUpload({
        token: "token",
        payload: {
          streamUid: "stream-1",
        },
        attempts: 2,
        delayMs: 0,
        fetchImpl,
        sleepImpl: () => Promise.resolve(),
      });

    expect(result.data.id).toBe("video-1");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});