import React, { useCallback, useEffect, useState } from "react";
import {
  Image, 
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { colors, radius, shadow } from "../src/theme";
import ScreenHeader from "../src/components/ScreenHeader";

export default function CoachingVideosScreen() {
  const { token } = useAuth();
const [videos, setVideos] = useState([]);
const [selectedVideo, setSelectedVideo] = useState(null);
const [menuVisible, setMenuVisible] = useState(false);

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "00:00";

  const total = Math.floor(Number(seconds) || 0);
  const min = String(Math.floor(total / 60)).padStart(2, "0");
  const sec = String(total % 60).padStart(2, "0");

  return `${min}:${sec}`;
}

const loadVideos = useCallback(async () => {
  try {
    if (!token) return;

    const res = await fetch(
      `${API_BASE_URL}/api/me/coaching-videos?t=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const result = await res.json();

    if (!res.ok) {
      console.log("영상 목록 불러오기 실패:", result);
      setVideos([]);
      return;
    }

    setVideos(Array.isArray(result.data) ? result.data : []);
  } catch (error) {
    console.log("영상 목록 fetch 실패:", error);
    setVideos([]);
  }
}, [token]);

async function handleDeleteVideo() {
  if (!selectedVideo?.id) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/me/coaching-videos/${selectedVideo.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result?.message || "삭제 실패");
    }

    setMenuVisible(false);
    setSelectedVideo(null);
    await loadVideos();
  } catch (error) {
    console.log("영상 삭제 실패:", error);
  }
}

useEffect(() => {
  loadVideos();
}, [loadVideos]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader title="수련 영상" />

      <View style={styles.hero}>
        <Image
          source={require("../assets/images/coaching-mountain-bg.png")}
          style={styles.heroBg}
          resizeMode="cover"
        />

        <Text style={styles.title}>내 수련영상 올리기</Text>
        <Text style={styles.subtitle}>실전 코칭</Text>
      </View>

      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          내 수련 영상을 올리면 관장님께서 코칭 댓글을 남겨주십니다.
        </Text>
      </View>

      <Pressable
        style={styles.uploadButton}
        onPress={() => router.push("/coaching-upload")}
      >
        <Text style={styles.uploadButtonText}>＋ 영상 업로드</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>내 영상 목록</Text>

      {videos.length === 0 ? (
  <Text style={styles.emptyText}>아직 업로드한 영상이 없습니다.</Text>
) : (
  videos.map((video) => (
    <VideoItem
  key={video.id}
  video={video}
  title={video.title || video.curriculum || "수련 영상"}
  move={
    video.curriculum
      ? `${video.trainingType || "수련"} · ${video.curriculum}`
      : "수련 항목 미선택"
  }
  date={new Date(video.createdAt).toLocaleDateString("ko-KR")}
  count={video.commentCount || 0}
  durationText={formatDuration(video.durationSeconds)}
  apiBaseUrl={API_BASE_URL}
  onOpenMenu={() => {
    setSelectedVideo(video);
    setMenuVisible(true);
  }}
/>
  ))
)}
<Modal visible={menuVisible} transparent animationType="fade">
  <View style={styles.menuOverlay}>
    <Pressable
      style={styles.menuBackdrop}
      onPress={() => setMenuVisible(false)}
    />

    <View style={styles.menuCard}>
      <Text style={styles.menuModalTitle}>영상 관리</Text>

      <Pressable style={styles.menuOption}>
        <Text style={styles.menuOptionText}>수정하기</Text>
      </Pressable>

      <Pressable style={styles.menuOption} onPress={handleDeleteVideo}>
        <Text style={styles.menuDeleteText}>삭제하기</Text>
      </Pressable>

      <Pressable
        style={styles.menuCancelButton}
        onPress={() => setMenuVisible(false)}
      >
        <Text style={styles.menuCancelText}>취소</Text>
      </Pressable>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
}

function VideoItem({
  video,
  title,
  move,
  date,
  count,
  durationText,
  apiBaseUrl,
  onOpenMenu,
}) {
  return (
    <Pressable
      style={styles.videoCard}
      onPress={() =>
        router.push({
          pathname: "/coaching-detail",
          params: {
            id: video.id,
            curriculum: video.curriculum || "",
            movement: video.movement || "",
            title: video.title || "",
            question: video.question || "",
            videoUrl: video.videoUrl || "",
            createdAt: video.createdAt || "",
            originalName: video.originalName || "",
          },
        })
      }
    >
      <Pressable
        style={styles.cardMenuButton}
        onPress={(event) => {
          event.stopPropagation?.();
          onOpenMenu();
        }}
      >
        <Text style={styles.cardMenuText}>⋯</Text>
      </Pressable>

      <View style={styles.thumbnail}>
  {video.thumbnailUrl ? (
    <Image
      source={{ uri: `${apiBaseUrl}${video.thumbnailUrl}` }}
      style={styles.thumbnailImage}
      resizeMode="cover"
    />
  ) : (
    <Image
      source={require("../assets/images/taichi-silhouette.png")}
      style={styles.thumbnailFallback}
      resizeMode="contain"
    />
  )}

  <Text style={styles.playIcon}>▶</Text>

  <View style={styles.durationBadge}>
    <Text style={styles.durationText}>{durationText || "00:00"}</Text>
  </View>
</View>

      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{title}</Text>
        <Text style={styles.videoMove}>{move}</Text>
        <Text style={styles.videoDate}>{date}</Text>
        <Text style={styles.commentText}>💬 코칭 {count}</Text>
      </View>

      <Text style={styles.arrow}>〉</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
  flex: 1,
  backgroundColor: colors.background,
},

content: {
  paddingHorizontal: 16,
  paddingTop: 24,
  paddingBottom: 110,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
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

  hero: {
  height: 124,
  borderRadius: radius.lg,
  overflow: "hidden",
  justifyContent: "center",
  paddingHorizontal: 18,
  marginBottom: 12,
},

  heroBg: {
    position: "absolute",
    left: -10,
    right: -40,
    bottom: -15,
    height: 180,
    opacity: 0.55,
    width: "100%",
    height: "100%",
  },

  title: {
  fontSize: 24,
  fontFamily: "MaruBuriBold",
  color: colors.textMain,
  marginBottom: 5,
  marginTop: -4,
},

  subtitle: {
  fontSize: 15,
  fontFamily: "PretendardSemiBold",
  color: colors.warmBrown,
},

  noticeBox: {
  backgroundColor: "#F8F1EA",
  borderRadius: 13,
  paddingHorizontal: 14,
  paddingVertical: 10,
  marginBottom: 10,
},

noticeText: {
  fontSize: 13,
  lineHeight: 19,
  fontFamily: "PretendardSemiBold",
  color: colors.warmBrown,
},

  uploadButton: {
  height: 46,
  borderRadius: 13,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 18,
},

uploadButtonText: {
  fontSize: 15,
  fontFamily: "PretendardBold",
  color: colors.white,
},

sectionTitle: {
  fontSize: 18,
  fontFamily: "MaruBuriSemiBold",
  color: colors.textMain,
  marginBottom: 9,
  marginLeft: 2,
},
  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFE5DE",
    padding: 10,
    marginBottom: 12,
  },

  thumbnail: {
    width: 112,
    height: 78,
    borderRadius: 12,
    backgroundColor: "#E8DDD0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
thumbnailImage: {
  width: "100%",
  height: "100%",
},

thumbnailFallback: {
  width: "74%",
  height: "74%",
  opacity: 0.35,
},
  playIcon: {
  position: "absolute",
  left: "52%",
  top: "40%",
  transform: [{ translateX: -13 }, { translateY: -13 }],
  fontSize: 26,
  color: "#FFFFFF",
  zIndex: 3,
},

  durationBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  durationText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  videoInfo: {
    flex: 1,
    marginLeft: 12,
  },

  videoTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#3A2C27",
    marginBottom: 3,
  },

  videoMove: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3A2C27",
    marginBottom: 6,
  },

  videoDate: {
    fontSize: 12,
    color: "#8A7A72",
    marginBottom: 4,
  },

  commentText: {
    fontSize: 12,
    color: "#6B4F46",
    fontWeight: "700",
  },

  arrow: {
    fontSize: 22,
    color: "#A78D83",
  },
  emptyText: {
  fontSize: 14,
  fontFamily: "PretendardMedium",
  color: colors.textSub,
  backgroundColor: colors.card,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 18,
  textAlign: "center",
},
cardMenuButton: {
  position: "absolute",
  top: 8,
  right: 8,
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
},

cardMenuText: {
  fontSize: 22,
  fontWeight: "900",
  color: "#9B8D84",
  marginTop: -8,
},

menuOverlay: {
  flex: 1,
  backgroundColor: "rgba(43,34,29,0.28)",
  justifyContent: "flex-end",
},

menuBackdrop: {
  flex: 1,
},

menuCard: {
  backgroundColor: "#FFFCFA",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 18,
  paddingBottom: 28,
},

menuModalTitle: {
  fontSize: 17,
  fontWeight: "900",
  color: "#3A2C27",
  marginBottom: 12,
},

menuOption: {
  height: 52,
  justifyContent: "center",
  borderBottomWidth: 1,
  borderBottomColor: "#EFE5DE",
},

menuOptionText: {
  fontSize: 16,
  fontWeight: "800",
  color: "#4A2F1E",
},

menuDeleteText: {
  fontSize: 16,
  fontWeight: "900",
  color: "#C45A4A",
},

menuCancelButton: {
  height: 50,
  borderRadius: 14,
  backgroundColor: "#F4EDE6",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 16,
},

menuCancelText: {
  fontSize: 15,
  fontWeight: "900",
  color: "#6B4F46",
},
});