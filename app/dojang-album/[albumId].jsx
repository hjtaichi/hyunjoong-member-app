import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  getDojangAlbumDetail,
  createDojangAlbumComment,
  deleteDojangAlbumComment,
} from "../../src/api/dojangAlbum";
import { colors, shadow } from "../../src/theme";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
};

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("ko-KR");
}
function formatCommentDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${y}.${m}.${d} ${h}:${min}`;
}
export default function DojangAlbumDetailScreen() {
  const { token } = useAuth();
  const { albumId } = useLocalSearchParams();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);

  const loadAlbum = useCallback(
    async ({ silent = false } = {}) => {
      if (!token || !albumId) return;

      try {
        if (!silent) setLoading(true);

        const result = await getDojangAlbumDetail(token, String(albumId));
        setAlbum(result || null);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, albumId]
  );

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlbum({ silent: true });
  }, [loadAlbum]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>앨범을 불러오는 중입니다.</Text>
      </View>
    );
  }
async function handleCreateComment() {
  const content = commentText.trim();

  if (!content) return;

  try {
    setCommentSaving(true);

    await createDojangAlbumComment(token, String(albumId), content);
    setCommentText("");
    await loadAlbum({ silent: true });
  } catch (error) {
    Alert.alert("오류", error.message || "댓글을 등록하지 못했습니다.");
  } finally {
    setCommentSaving(false);
  }
}

async function deleteComment(commentId) {
  try {
    await deleteDojangAlbumComment(token, String(albumId), commentId);
    await loadAlbum({ silent: true });
  } catch (error) {
    Alert.alert("오류", error.message || "댓글을 삭제하지 못했습니다.");
  }
}

function handleDeleteComment(commentId) {
  if (Platform.OS === "web") {
    const ok = window.confirm("이 댓글을 삭제할까요?");
    if (!ok) return;

    deleteComment(commentId);
    return;
  }

  Alert.alert("댓글 삭제", "이 댓글을 삭제할까요?", [
    { text: "취소", style: "cancel" },
    {
      text: "삭제",
      style: "destructive",
      onPress: () => deleteComment(commentId),
    },
  ]);
}
  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{album?.title || "도장 앨범"}</Text>
        <Text style={styles.meta}>
          {formatDate(album?.eventDate)} · 사진 {album?.photoCount || 0}장
        </Text>

        {album?.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descText}>{album.description}</Text>
          </View>
        ) : null}

        {album?.photos?.length > 0 ? (
          <View style={styles.photoGrid}>
            {album.photos.map((photo) => (
              <Pressable
                key={photo.id}
                style={styles.photoItem}
                onPress={() => setSelectedPhoto(photo)}
              >
                <Image
                  source={{ uri: photo.thumbnailUrl || photo.imageUrl }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>아직 사진이 없습니다.</Text>
            <Text style={styles.emptyText}>
              관리자가 사진을 올리면 이곳에 표시됩니다.
            </Text>
          </View>
        )}
        
        {album?.comments?.length > 0 ? (
  <View style={styles.commentSection}>
    <View style={styles.commentHeader}>
      <Text style={styles.commentTitle}>댓글</Text>
      <Text style={styles.commentCount}>
        {album.comments.length}개
      </Text>
    </View>

    <View style={styles.commentList}>
      {album.comments.map((comment) => (
        <View key={comment.id} style={styles.commentItem}>
          <View style={styles.commentItemHeader}>
            <View style={styles.commentMetaLeft}>
              <Text style={styles.commentAuthor}>{comment.memberName}</Text>
              <Text style={styles.commentDate}>
                {formatCommentDateTime(comment.createdAt)}
              </Text>
            </View>

            {comment.isMine ? (
              <Pressable onPress={() => handleDeleteComment(comment.id)}>
                <Text style={styles.commentDelete}>삭제</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.commentContent}>{comment.content}</Text>
        </View>
      ))}
    </View>
  </View>
) : null}
   </ScrollView>
<View style={styles.fixedCommentBar}>
  <View style={styles.fixedCommentInputBox}>
    <TextInput
      value={commentText}
      onChangeText={setCommentText}
      placeholder="앨범에 대한 이야기를 남겨보세요."
      placeholderTextColor="#B5A69A"
      multiline
      style={styles.fixedCommentInput}
    />

    <Pressable
      style={[
        styles.fixedCommentSubmitButton,
        (!commentText.trim() || commentSaving) &&
          styles.commentSubmitButtonDisabled,
      ]}
      onPress={handleCreateComment}
      disabled={!commentText.trim() || commentSaving}
    >
      <Text style={styles.commentSubmitText}>
        {commentSaving ? "등록 중" : "등록"}
      </Text>
    </Pressable>
  </View>
</View>
      <Modal
        visible={Boolean(selectedPhoto)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalClose}
            onPress={() => setSelectedPhoto(null)}
          >
            <Text style={styles.modalCloseText}>×</Text>
          </Pressable>

          {selectedPhoto ? (
            <Image
              source={{ uri: selectedPhoto.imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
      
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
  },
  center: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: fonts.medium,
    color: "#7A6C63",
  },
  backButton: {
    position: "absolute",
    top: 22,
    left: 14,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 34,
    color: "#3A2C27",
  },
content: {
  paddingHorizontal: 18,
  paddingTop: 58,
  paddingBottom: 190,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},
  title: {
    textAlign: "center",
    fontFamily: fonts.title,
    fontSize: 28,
    lineHeight: 38,
    color: "#3A2C27",
  },
  meta: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#7A6C63",
  },
  descCard: {
    marginTop: 22,
    borderRadius: 22,
    backgroundColor: "#FFF9EF",
    borderWidth: 1,
    borderColor: "#EFE3D8",
    padding: 18,
    ...shadow.card,
  },
  descText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: "#5E5048",
  },
  photoGrid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoItem: {
    width: "31.8%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F5EEE5",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  emptyCard: {
    marginTop: 22,
    borderRadius: 22,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#EFE3D8",
    padding: 22,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#3A2C27",
  },
  emptyText: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#7A6C63",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalClose: {
    position: "absolute",
    top: 44,
    right: 24,
    zIndex: 2,
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 38,
  },
  modalImage: {
    width: "94%",
    height: "78%",
  },
  commentSection: {
  marginTop: 60,
  marginHorizontal: 18,
  borderRadius: 22,
  backgroundColor: "#FFFDF8",
  padding: 18,
  ...shadow.card,
},

commentHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

commentTitle: {
  fontFamily: fonts.titleSemi,
  fontSize: 21,
  color: "#3A2C27",
},

commentCount: {
  fontFamily: fonts.semiBold,
  fontSize: 13,
  color: "#8A6A4D",
},

commentInputBox: {
  marginTop: 14,
  borderRadius: 18,
  backgroundColor: "#F9F2EA",
  borderWidth: 1,
  borderColor: "#EFE3D8",
  padding: 12,
},

commentInput: {
  minHeight: 58,
  maxHeight: 110,
  fontFamily: fonts.medium,
  fontSize: 14,
  lineHeight: 21,
  color: "#3A2C27",
  padding: 0,
  textAlignVertical: "top",
},

commentSubmitButton: {
  marginTop: 10,
  alignSelf: "flex-end",
  borderRadius: 999,
  backgroundColor: "#3A2C27",
  paddingHorizontal: 16,
  paddingVertical: 8,
},

commentSubmitButtonDisabled: {
  opacity: 0.45,
},

commentSubmitText: {
  fontFamily: fonts.bold,
  fontSize: 13,
  color: "#F7E5C3",
},

commentList: {
  marginTop: 16,
  gap: 12,
},

commentItem: {
  borderTopWidth: 1,
  borderTopColor: "#EFE3D8",
  paddingTop: 12,
},

commentItemHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

commentAuthor: {
  fontFamily: fonts.bold,
  fontSize: 14,
  color: "#3A2C27",
},

commentDelete: {
  fontFamily: fonts.semiBold,
  fontSize: 12,
  color: "#B25A4A",
},

commentContent: {
  marginTop: 7,
  fontFamily: fonts.medium,
  fontSize: 14,
  lineHeight: 21,
  color: "#5E5048",
},

commentEmpty: {
  marginTop: 16,
  fontFamily: fonts.medium,
  fontSize: 13,
  lineHeight: 20,
  color: "#8A7A68",
},
commentMetaLeft: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingRight: 10,
},

commentDate: {
  fontFamily: fonts.medium,
  fontSize: 11,
  color: "#9A8A7E",
},
fixedCommentBar: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  paddingHorizontal: 18,
  paddingTop: 20,
  paddingBottom: 25,
  backgroundColor: "#FFFCFA",
  borderTopWidth: 1,
  borderTopColor: "#EFE3D8",
  shadowColor: "#3A2C27",
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 8,
},

fixedCommentInputBox: {
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
  minHeight: 62,
  borderRadius: 18,
  backgroundColor: "#F9F2EA",
  borderWidth: 1,
  borderColor: "#EFE3D8",
  paddingHorizontal: 14,
  paddingVertical: 10,
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 10,
},

fixedCommentInput: {
  flex: 1,
  maxHeight: 88,
  fontFamily: fonts.medium,
  fontSize: 14,
  lineHeight: 21,
  color: "#3A2C27",
  padding: 0,
  textAlignVertical: "top",
},

fixedCommentSubmitButton: {
  borderRadius: 999,
  backgroundColor: "#3A2C27",
  paddingHorizontal: 16,
  paddingVertical: 9,
},
});