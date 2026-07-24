import {
  requestCoachingStreamUploadUrl,
  finalizeCoachingStreamUpload,
  uploadFileToCloudflareStream,
} from "../src/features/coaching/streamUploadClient";

describe("Stream coaching TUS upload client", () => {
  test(
    "sends file metadata to the backend",
    async () => {
      const fetchImpl = jest
        .fn()
        .mockResolvedValue({
          ok: true,
          status: 201,
          text: async () =>
            JSON.stringify({
              data: {
                uploadURL:
                  "https://upload.videodelivery.net/tus/abc",
                uid: "stream-1",
              },
            }),
        });

      await requestCoachingStreamUploadUrl({
        token: "member-token",
        title: "연습",
        file: {
          size: 123,
          name: "practice.mp4",
          type: "video/mp4",
        },
        fetchImpl,
      });

      const [, options] =
        fetchImpl.mock.calls[0];

      expect(
        JSON.parse(options.body)
      ).toMatchObject({
        fileSize: 123,
        fileName: "practice.mp4",
        fileType: "video/mp4",
      });
    }
  );

  test(
    "uses the already-created TUS upload URL",
    async () => {
      let receivedOptions;

      class MockUpload {
        constructor(file, options) {
          receivedOptions = options;
          this.options = options;
          this.url = options.uploadUrl;
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
        uploadURL:
          "https://upload.example/tus/resource",
        tusImpl: {
          Upload: MockUpload,
        },
      });

      expect(receivedOptions.uploadUrl).toBe(
        "https://upload.example/tus/resource"
      );
      expect(
        receivedOptions.endpoint
      ).toBeUndefined();
    }
  );

  test(
    "retries finalize while processing",
    async () => {
      const fetchImpl = jest
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          text: async () =>
            JSON.stringify({
              message: "processing",
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          text: async () =>
            JSON.stringify({
              data: {
                id: "video-1",
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
          sleepImpl: () =>
            Promise.resolve(),
        });

      expect(result.data.id).toBe(
        "video-1"
      );
    }
  );
});