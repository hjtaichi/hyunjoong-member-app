const CHINESE_TTS_LANGUAGE = "zh-CN";
const CHINESE_TTS_RATE = 0.86;
const CHINESE_SEQUENCE_RATE = 0.78;
const CHINESE_SEQUENCE_GAP_MS = 750;

let activeUtterance = null;
let sequenceToken = 0;
let activeSequenceOnStop = null;

function normalizeLang(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-");
}

function notify(message) {
  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(message);
  }
}

function findMandarinVoice(voices) {
  const list = Array.isArray(voices) ? voices : [];

  return (
    list.find((v) => normalizeLang(v?.lang) === "zh-cn") ||
    list.find((v) => normalizeLang(v?.lang) === "zh-hans-cn") ||
    list.find((v) => normalizeLang(v?.lang).startsWith("zh-cn-")) ||
    list.find((v) => {
      const lang = normalizeLang(v?.lang);
      const name = String(v?.name || "").toLowerCase();

      return (
        lang.startsWith("zh") &&
        (name.includes("mandarin") ||
          name.includes("putonghua") ||
          name.includes("普通话"))
      );
    }) ||
    list.find((v) => normalizeLang(v?.lang) === "zh-tw") ||
    list.find((v) => normalizeLang(v?.lang).startsWith("zh-tw-")) ||
    null
  );
}

function getSpeechContext() {
  if (
    typeof window === "undefined" ||
    !window.speechSynthesis ||
    typeof window.SpeechSynthesisUtterance !== "function"
  ) {
    notify("이 브라우저에서는 음성 듣기 기능을 지원하지 않아요.");
    return null;
  }

  const synth = window.speechSynthesis;
  const voices = synth.getVoices?.() || [];
  const voice = findMandarinVoice(voices);
  const hasChinese = voices.some((v) =>
    normalizeLang(v?.lang).startsWith("zh")
  );

  if (voices.length > 0 && !hasChinese) {
    console.warn("[Chinese TTS] No Chinese voice installed.", {
      totalVoices: voices.length,
    });

    notify(
      "현재 이 기기/브라우저에 중국어 음성이 설치되어 있지 않아요.\n휴대폰에서는 기본 제공되는 경우가 많고, PC에서는 중국어 음성팩 설치가 필요할 수 있어요."
    );
    return null;
  }

  return { synth, voice };
}

function createUtterance(text, voice, rate) {
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang || CHINESE_TTS_LANGUAGE;
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (voice) {
    utterance.voice = voice;
  }

  return utterance;
}

export function getChineseSpeechDiagnostics() {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return {
      supported: false,
      totalVoices: 0,
      chineseVoices: [],
      selectedVoice: null,
    };
  }

  const voices = window.speechSynthesis.getVoices?.() || [];
  const chineseVoices = voices
    .filter((v) => normalizeLang(v?.lang).startsWith("zh"))
    .map((v) => ({
      name: v?.name || "",
      lang: v?.lang || "",
      localService: Boolean(v?.localService),
    }));

  const selected = findMandarinVoice(voices);

  return {
    supported: true,
    totalVoices: voices.length,
    chineseVoices,
    selectedVoice: selected
      ? {
          name: selected.name || "",
          lang: selected.lang || "",
          localService: Boolean(selected.localService),
        }
      : null,
  };
}

export function stopChineseSpeech(options = {}) {
  const { invokeOnStop = true } = options;
  sequenceToken += 1;

  const onStop = activeSequenceOnStop;
  activeSequenceOnStop = null;

  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  activeUtterance = null;

  if (invokeOnStop && typeof onStop === "function") {
    onStop();
  }
}

export function speakChinese(text) {
  const phrase = String(text || "").trim();
  if (!phrase) return false;

  const context = getSpeechContext();
  if (!context) return false;

  const { synth, voice } = context;

  stopChineseSpeech();

  const utterance = createUtterance(
    phrase,
    voice,
    CHINESE_TTS_RATE
  );

  utterance.onstart = () => {
    console.log("[Chinese TTS] start", {
      text: phrase,
      voice: voice?.name || "browser-default",
      lang: utterance.lang,
    });
  };

  utterance.onend = () => {
    activeUtterance = null;
  };

  utterance.onerror = (event) => {
    const errorName = String(event?.error || "unknown");

    console.warn("[Chinese TTS] error", {
      text: phrase,
      error: errorName,
      voice: voice?.name || "browser-default",
      lang: utterance.lang,
    });

    activeUtterance = null;

    if (
      errorName !== "interrupted" &&
      errorName !== "canceled"
    ) {
      notify(
        `중국어 음성을 재생하지 못했어요. (${errorName})\n기기의 중국어 음성 설정을 확인해주세요.`
      );
    }
  };

  activeUtterance = utterance;

  if (synth.paused) {
    synth.resume();
  }

  synth.speak(utterance);

  setTimeout(() => {
    if (synth.paused) {
      synth.resume();
    }
  }, 80);

  return true;
}

export function speakChineseSequence(texts, options = {}) {
  const phrases = (Array.isArray(texts) ? texts : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (phrases.length === 0) {
    return false;
  }

  const context = getSpeechContext();
  if (!context) {
    return false;
  }

  const { synth, voice } = context;
  const rate = Number(options.rate) || CHINESE_SEQUENCE_RATE;
  const gapMs = Math.max(
    0,
    Number(options.gapMs) || CHINESE_SEQUENCE_GAP_MS
  );
  const onComplete =
    typeof options.onComplete === "function"
      ? options.onComplete
      : null;
  const onStop =
    typeof options.onStop === "function"
      ? options.onStop
      : null;

  stopChineseSpeech({ invokeOnStop: false });

  const token = ++sequenceToken;
  activeSequenceOnStop = onStop;

  const playAt = (index) => {
    if (token !== sequenceToken) {
      return;
    }

    if (index >= phrases.length) {
      activeUtterance = null;
      activeSequenceOnStop = null;

      if (onComplete) {
        onComplete();
      }
      return;
    }

    const phrase = phrases[index];
    const utterance = createUtterance(phrase, voice, rate);

    utterance.onstart = () => {
      console.log("[Chinese TTS] sequence", {
        index: index + 1,
        total: phrases.length,
        text: phrase,
        voice: voice?.name || "browser-default",
        lang: utterance.lang,
      });
    };

    utterance.onend = () => {
      activeUtterance = null;

      if (token !== sequenceToken) {
        return;
      }

      setTimeout(() => {
        playAt(index + 1);
      }, gapMs);
    };

    utterance.onerror = (event) => {
      const errorName = String(event?.error || "unknown");

      activeUtterance = null;

      if (
        errorName === "interrupted" ||
        errorName === "canceled"
      ) {
        return;
      }

      console.warn("[Chinese TTS] sequence error", {
        index: index + 1,
        text: phrase,
        error: errorName,
      });

      stopChineseSpeech();

      notify(
        `중국어 음성을 재생하지 못했어요. (${errorName})\n기기의 중국어 음성 설정을 확인해주세요.`
      );
    };

    activeUtterance = utterance;

    if (synth.paused) {
      synth.resume();
    }

    synth.speak(utterance);
  };

  playAt(0);
  return true;
}

export const chineseSpeechConfig = {
  language: CHINESE_TTS_LANGUAGE,
  rate: CHINESE_TTS_RATE,
  sequenceRate: CHINESE_SEQUENCE_RATE,
  sequenceGapMs: CHINESE_SEQUENCE_GAP_MS,
};
