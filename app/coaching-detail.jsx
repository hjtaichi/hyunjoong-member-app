import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { VideoView, useVideoPlayer } from "expo-video";

export default function CoachingDetailScreen() {
  const params = useLocalSearchParams();
  const { token } = useAuth();
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const videoUrl = params.videoUrl
  ? `${API_BASE_URL}${params.videoUrl}`
  : "";

const player = useVideoPlayer(videoUrl, (player) => {
  player.loop = false;
});

const uploadedDate = params.createdAt
  ? new Date(String(params.createdAt)).toLocaleDateString("ko-KR")
  : "-";
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState([]);
  const loadComments = useCallback(async () => {
  if (!token || !params.id) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/me/coaching-videos/${params.id}/comments?t=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const result = await res.json();

    if (res.ok) {
      setComments(result.data || []);
    }
  } catch (error) {
    console.log("댓글 불러오기 실패:", error);
  }
}, [token, params.id]);
async function handleSendComment() {
  const text = message.trim();

  console.log("댓글 전송 시도:", {
    text,
    videoId: params.id,
    tokenExists: !!token,
    url: `${API_BASE_URL}/api/me/coaching-videos/${params.id}/comments`,
  });

  if (!text) return;

  if (!params.id) {
    alert("영상 ID가 없습니다.");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/me/coaching-videos/${params.id}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ text }),
      }
    );

    const result = await res.json();

    console.log("댓글 등록 응답:", res.status, result);

    if (!res.ok) {
      alert(result?.message || "댓글 등록 실패");
      return;
    }

    setMessage("");
    await loadComments();
  } catch (error) {
    console.log("댓글 등록 fetch 실패:", error);
    alert("댓글 등록 중 오류가 발생했습니다.");
  }
}

useEffect(() => {
loadComments();
}, [loadComments]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.videoBox}>
  {videoUrl ? (
    <VideoView
      style={styles.video}
      player={player}
      nativeControls
      allowsFullscreen
      allowsPictureInPicture
    />
  ) : (
    <>
      <Text style={styles.videoFileName}>
        {params.originalName || "training-video.mp4"}
      </Text>
      <Image
        source={require("../assets/images/taichi-silhouette.png")}
        style={styles.videoImage}
        resizeMode="contain"
      />
      <Text style={styles.playIcon}>▶</Text>
    </>
  )}
</View>

        <Text style={styles.title}>
  {(params.curriculum || "수련")}{" "}
  {params.movement ? `- ${params.movement}` : ""}
</Text>
        <Text style={styles.date}>{uploadedDate}</Text>

        <View style={styles.statusPill}>
          <Text style={styles.statusText}>코칭 진행 중</Text>
        </View>

        <View style={styles.questionBox}>
          <Text style={styles.sectionTitle}>질문/요청 사항</Text>
          <Text style={styles.questionText}>
  {params.question || "등록된 질문이 없습니다."}
</Text>
        </View>

        <Text style={styles.sectionTitle}>코칭 댓글 ({comments.length})</Text>

        {comments.length === 0 ? (
  <View style={styles.emptyCommentBox}>
    <Text style={styles.emptyCommentText}>
      아직 등록된 코칭 댓글이 없습니다.
    </Text>
  </View>
) : (
  comments.map((comment) => (
    <Comment
      key={comment.id}
      role={comment.role}
      badge={comment.badge}
      time={
  comment.createdAt
    ? new Date(comment.createdAt).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""
}
      text={comment.text}
    />
  ))
)}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor="#B3A79E"
        />
        <Pressable
  style={styles.sendButton}
  onPress={handleSendComment}
>
          <Text style={styles.sendText}>⌲</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Comment({ role, badge, time, text }) {
  const isMaster = role === "관장님";

  return (
    <View style={styles.commentRow}>
      <View style={[styles.avatar, isMaster && styles.masterAvatar]}>
        <Text style={styles.avatarText}>{isMaster ? "관" : "회"}</Text>
      </View>

      <View style={styles.commentBody}>
        <View style={styles.commentTop}>
          <Text style={styles.commentName}>{role}</Text>

          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}

          <Text style={styles.commentTime}>{time}</Text>
        </View>

        <Text style={styles.commentText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFCFA",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 100,
  },

  backButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
  },

  backText: {
    fontSize: 34,
    color: "#2B221D",
  },

  videoBox: {
    height: 210,
    borderRadius: 18,
    backgroundColor: "#EDE3D7",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 30,
  },

  videoImage: {
    width: "72%",
    height: "72%",
    opacity: 0.35,
  },

  playIcon: {
    position: "absolute",
    fontSize: 44,
    color: "#FFFFFF",
  },

  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#3A2C27",
    marginBottom: 8,
  },

  date: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8A7A72",
    marginBottom: 12,
  },

  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F4E4C8",
    marginBottom: 22,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#8A5A21",
  },

  questionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFE5DE",
    padding: 16,
    marginBottom: 35,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#3A2C27",
    marginBottom: 10,
  },

  questionText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
    color: "#6B4F46",
  },

  commentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8DDD0",
    alignItems: "center",
    justifyContent: "center",
  },

  masterAvatar: {
    backgroundColor: "#F1DDC2",
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#6B4F46",
  },

  commentBody: {
    flex: 1,
  },

  commentTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  commentName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#3A2C27",
  },

  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#C89E6A",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  commentTime: {
    marginLeft: "auto",
    fontSize: 11,
    color: "#A99F98",
  },

  commentText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
    color: "#4A3A33",
  },

  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#FFFCFA",
    borderTopWidth: 1,
    borderTopColor: "#EFE5DE",
    flexDirection: "row",
    gap: 8,
  },

  input: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EADFD5",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#3A2C27",
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F4EDE6",
    alignItems: "center",
    justifyContent: "center",
  },

  sendText: {
    fontSize: 22,
    color: "#6B4F46",
  },
  videoFileName: {
  position: "absolute",
  bottom: 14,
  left: 16,
  right: 16,
  fontSize: 12,
  fontWeight: "700",
  color: "#6B4F46",
  textAlign: "center",
},
emptyCommentBox: {
  paddingVertical: 22,
  paddingHorizontal: 16,
  borderRadius: 16,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#EFE5DE",
  marginBottom: 18,
},

emptyCommentText: {
  fontSize: 14,
  fontWeight: "700",
  color: "#9B8D84",
  textAlign: "center",
},
video: {
  width: "100%",
  height: "100%",
  backgroundColor: "#000000",
},
});