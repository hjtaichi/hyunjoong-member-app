import React, { useState } from "react";
import {
  Alert,
  Modal,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
export default function CoachingUploadScreen() {
  const [trainingType, setTrainingType] = useState("투로");
  const [curriculum, setCurriculum] = useState("");
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [pickerType, setPickerType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { token } = useAuth();
  const [videoDuration, setVideoDuration] = useState(null);
  const TRAINING_OPTIONS = {
  공법: [
    "일심양의",
    "요부전사",
    "두요",
    "오행전사",
    "기타",
  ],

  투로: [
    "현중태극권 29식",
    "현중태극선 29식",
    "현중태극검 52식",
    "현중태극권 대가1로 79식",
    "현중태극단도",
    "현중용형편간",
    "기타",
  ],
};

  function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "00:00";

  const total = Math.floor(seconds);
  const min = String(Math.floor(total / 60)).padStart(2, "0");
  const sec = String(total % 60).padStart(2, "0");

  return `${min}:${sec}`;
}

function readVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.floor(video.duration || 0));
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.src = url;
  });
}

function captureVideoThumbnail(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration || 1);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.82
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.src = url;
  });
}

function handlePickFile() {
  if (Platform.OS !== "web") {
    Alert.alert("안내", "현재는 웹앱에서 먼저 테스트 중입니다.");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/mp4,video/quicktime,video/*";

  input.onchange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const maxSize = 300 * 1024 * 1024;

    if (file.size > maxSize) {
      Alert.alert("안내", "영상은 300MB 이하만 업로드할 수 있습니다.");
      return;
    }

    setSelectedFile(file);
    readVideoDuration(file).then((duration) => {
  setVideoDuration(duration);
  console.log("영상 길이:", duration);
});
    console.log("선택 파일:", file);
  };

  input.click();
}

  async function handleUpload() {
  try {
    console.log("🔥 업로드 버튼 클릭", {
      selectedFile,
      trainingType,
      curriculum,
      title,
      question,
      token: !!token,
    });

    if (!selectedFile) {
      Alert.alert("안내", "업로드할 영상을 먼저 선택해주세요.");
      return;
    }
if (!curriculum) {
  Alert.alert("안내", "수련 항목을 선택해주세요.");
  return;
}
    const formData = new FormData();

    formData.append("video", selectedFile);
    const thumbnailBlob = await captureVideoThumbnail(selectedFile);

if (thumbnailBlob) {
  formData.append(
    "thumbnail",
    thumbnailBlob,
    `thumbnail-${Date.now()}.jpg`
  );
}

    formData.append("trainingType", trainingType);
    formData.append("curriculum", curriculum);
    formData.append("title", title);
    formData.append("question", question);
    const durationForUpload =
  videoDuration || (await readVideoDuration(selectedFile)) || 0;

formData.append("durationSeconds", String(durationForUpload));

    const response = await fetch(
      `${API_BASE_URL}/api/me/coaching-videos`,
      {
        method: "POST",
        headers: {
  Authorization: `Bearer ${token}`,
  "ngrok-skip-browser-warning": "true",
},
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "업로드 실패");
    }

    console.log("업로드 성공:", result);

const uploadedVideo = result?.data || {};

const completeParams = {
  curriculum: String(curriculum || ""),
  movement: String(curriculum || ""),
  trainingType: String(trainingType || ""),
  title: String(title || ""),
  question: String(question || ""),
  originalName: String(uploadedVideo.originalName || selectedFile?.name || ""),
  videoUrl: String(uploadedVideo.videoUrl || ""),
  size: String(uploadedVideo.size || selectedFile?.size || ""),
  uploadedAt: String(uploadedVideo.createdAt || new Date().toISOString()),
  durationSeconds: String(uploadedVideo.durationSeconds || durationForUpload || 0),
  durationText: String(
    formatDuration(uploadedVideo.durationSeconds || durationForUpload || 0)
  ),
};

console.log("업로드 완료 이동 params:", completeParams);

setTimeout(() => {
  router.push({
    pathname: "/coaching-upload-complete",
    params: completeParams,
  });
}, 100);
  } catch (error) {
    console.error(error);

    Alert.alert(
      "업로드 실패",
      error?.message || "영상 업로드 중 오류가 발생했습니다."
    );
  }
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      <Text style={styles.pageTitle}>영상 업로드</Text>

      <Text style={styles.stepTitle}>1. 영상 선택</Text>

      <View style={styles.uploadBox}>
        <Text style={styles.uploadIcon}>☁︎</Text>
        <Text style={styles.uploadGuide}>영상을 선택하거나 드래그 해주세요.</Text>

        <Pressable
  style={styles.fileButton}
  onPress={handlePickFile}
>
  <Text style={styles.fileButtonText}>
    {selectedFile ? "선택 완료" : "파일 선택"}
  </Text>
</Pressable>

{selectedFile ? (
  <Text style={styles.selectedFileText}>{selectedFile.name}</Text>
) : null}

        <Text style={styles.uploadHint}>• 권장 형식 : MP4, MOV</Text>
        <Text style={styles.uploadHint}>• 최대 300MB 이하, 최대 5분 권장</Text>
      </View>

      <Text style={styles.stepTitle}>2. 영상 정보 입력</Text>

      <InputLabel label="수련 종류" />
      <Pressable
  style={styles.selectBox}
  onPress={() => setPickerType("trainingType")}
>
        <Text style={styles.selectText}>{trainingType}</Text>
        <Text style={styles.selectArrow}>⌄</Text>
      </Pressable>

      <InputLabel label="수련 항목" />
      <Pressable
  style={styles.selectBox}
  onPress={() => setPickerType("curriculum")}
>
        <Text style={[styles.selectText, !curriculum && styles.placeholder]}>
  {curriculum || "수련 항목을 선택해주세요"}
</Text>
        <Text style={styles.selectArrow}>⌄</Text>
      </Pressable>

      <InputLabel label="제목 (선택)" />
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="예) 금강도추 연습 영상"
        placeholderTextColor="#B3A79E"
      />

      <InputLabel label="질문 내용 / 코칭 받고 싶은 부분 (선택)" />
      <TextInput
        value={question}
        onChangeText={setQuestion}
        style={styles.textArea}
        placeholder={"관장님께 질문하고 싶은 내용을 적어주세요.\n예) 중심 이동이 잘 안됩니다."}
        placeholderTextColor="#B3A79E"
        multiline
        maxLength={200}
        textAlignVertical="top"
      />

      <Text style={styles.countText}>{question.length}/200</Text>

      <Pressable
  style={styles.submitButton}
  onPress={handleUpload}
>
  <Text style={styles.submitButtonText}>업로드</Text>
</Pressable>
      <Modal visible={!!pickerType} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>
        {pickerType === "trainingType"
  ? "수련 종류 선택"
  : "수련 항목 선택"}
      </Text>

      {(
  pickerType === "trainingType"
    ? ["공법", "투로"]
    : TRAINING_OPTIONS[trainingType] || []
).map((item) => (
  <Pressable
    key={item}
    style={styles.optionRow}
    onPress={() => {
      if (pickerType === "trainingType") {
        setTrainingType(item);
        setCurriculum("");
      } else {
        setCurriculum(item);
      }

      setPickerType(null);
    }}
  >
    <Text style={styles.optionText}>{item}</Text>
  </Pressable>
))}

      <Pressable
        style={styles.modalCloseButton}
        onPress={() => setPickerType(null)}
      >
        <Text style={styles.modalCloseText}>닫기</Text>
      </Pressable>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
}

function InputLabel({ label }) {
  return <Text style={styles.inputLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFCFA",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 34,
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    marginTop: -35,
    fontWeight: "500",
  },

  backText: {
    fontSize: 34,
    color: "#2B221D",
  },

  pageTitle: {
    textAlign: "center",
    marginTop: -28,
    marginBottom: 30,
    fontSize: 18,
    fontWeight: "900",
    color: "#3A2C27",
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#3A2C27",
    marginBottom: 12,
  },

  uploadBox: {
    minHeight: 220,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EADFD5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 26,
  },

  uploadIcon: {
    fontSize: 46,
    color: "#B9AAA1",
    marginBottom: 10,
  },

  uploadGuide: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5F514A",
    marginBottom: 16,
  },

  fileButton: {
    minWidth: 112,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8CCC3",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFCFA",
    marginBottom: 16,
  },

  fileButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#5C463D",
  },

  uploadHint: {
    alignSelf: "flex-start",
    marginLeft: 16,
    fontSize: 12,
    lineHeight: 20,
    color: "#9B8D84",
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4B3A33",
    marginBottom: 8,
    marginTop: 2,
  },

  selectBox: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#EADFD5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3A2C27",
  },

  placeholder: {
    color: "#B3A79E",
  },

  selectArrow: {
    fontSize: 18,
    color: "#9B8D84",
  },

  input: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#EADFD5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
    color: "#3A2C27",
    marginBottom: 14,
  },

  textArea: {
    minHeight: 112,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EADFD5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    color: "#3A2C27",
  },

  countText: {
    alignSelf: "flex-end",
    marginTop: 6,
    marginBottom: 20,
    fontSize: 12,
    color: "#9B8D84",
  },

  submitButton: {
  height: 56,
  borderRadius: 14,
  backgroundColor: "#4A2F1E",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
  marginBottom: 30,
  zIndex: 10,
},

  submitButtonText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  selectedFileText: {
  marginTop: -8,
  marginBottom: 12,
  fontSize: 12,
  fontWeight: "700",
  color: "#6B4F46",
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(43,34,29,0.35)",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
},

modalCard: {
  width: "100%",
  maxWidth: 360,
  backgroundColor: "#FFFCFA",
  borderRadius: 20,
  padding: 18,
},

modalTitle: {
  fontSize: 18,
  fontWeight: "900",
  color: "#3A2C27",
  marginBottom: 12,
},

optionRow: {
  minHeight: 48,
  justifyContent: "center",
  borderBottomWidth: 1,
  borderBottomColor: "#EFE5DE",
},

optionText: {
  fontSize: 15,
  fontWeight: "800",
  color: "#4A2F1E",
},

modalCloseButton: {
  height: 48,
  borderRadius: 12,
  backgroundColor: "#4A2F1E",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 16,
},

modalCloseText: {
  fontSize: 15,
  fontWeight: "900",
  color: "#FFFFFF",
},
});