export function stopWebCamera(videoElement, controls) {
  try {
    controls?.stop?.();
  } catch {}

  try {
    const stream = videoElement?.srcObject;
    const tracks = stream?.getTracks?.() || [];

    tracks.forEach((track) => {
      try {
        track?.stop?.();
      } catch {}
    });
  } catch {}

  try {
    videoElement?.pause?.();
  } catch {}

  try {
    if (videoElement) {
      videoElement.srcObject = null;
      videoElement.removeAttribute?.("src");
      videoElement.load?.();
    }
  } catch {}
}