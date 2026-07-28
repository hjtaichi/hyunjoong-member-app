import { stopWebCamera } from "../src/utils/stopWebCamera";

describe("stopWebCamera", () => {
  test("stops ZXing controls and every MediaStream track", () => {
    const controls = {
      stop: jest.fn(),
    };
    const firstTrack = {
      stop: jest.fn(),
    };
    const secondTrack = {
      stop: jest.fn(),
    };
    const video = {
      srcObject: {
        getTracks: jest.fn(() => [firstTrack, secondTrack]),
      },
      pause: jest.fn(),
      removeAttribute: jest.fn(),
      load: jest.fn(),
    };

    stopWebCamera(video, controls);

    expect(controls.stop).toHaveBeenCalledTimes(1);
    expect(firstTrack.stop).toHaveBeenCalledTimes(1);
    expect(secondTrack.stop).toHaveBeenCalledTimes(1);
    expect(video.srcObject).toBeNull();
    expect(video.pause).toHaveBeenCalledTimes(1);
    expect(video.removeAttribute).toHaveBeenCalledWith("src");
    expect(video.load).toHaveBeenCalledTimes(1);
  });

  test("does not throw when resources were already released", () => {
    const controls = {
      stop: jest.fn(() => {
        throw new Error("already stopped");
      }),
    };
    const video = {
      srcObject: null,
      pause: jest.fn(() => {
        throw new Error("already detached");
      }),
      removeAttribute: jest.fn(),
      load: jest.fn(),
    };

    expect(() => stopWebCamera(video, controls)).not.toThrow();
    expect(video.srcObject).toBeNull();
  });
});