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
import { useAuth } from "../../../src/contexts/AuthContext";
import {
  getDojangAlbumDetail,
  createDojangAlbumComment,
  deleteDojangAlbumComment,
} from "../../../src/api/dojangAlbum";
import { colors, shadow } from "../../../src/theme";
import ScreenHeader from "../../../src/components/ScreenHeader";

const photoIcon = require("../../../assets/images/dojang-album/icon-photo.png");
const dateIcon = require("../../../assets/images/dojang-album/icon-date.png");
const locationIcon = require("../../../assets/images/dojang-album/icon-location.png");
const commentIcon = require("../../../assets/images/dojang-album/icon-comment.png");

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  hanja: "ZhaoKai",
};

const PAPER = "#FFFCF6";
const CARD = "#FFFDF8";
const INK = "#2F241F";
const SUB = "#7A6C63";
const GOLD = "#B9894A";
const LINE = "#EFE3D8";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}. ${m}. ${d}.`;
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

export default function YudanjaAlbumDetailScreen() {
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>앨범을 불러오는 중입니다.</Text>
      </View>
    );
  }

  const photos = Array.isArray(album?.photos) ? album.photos : [];
  const comments = Array.isArray(album?.comments) ? album.comments : [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
<ScreenHeader title="앨범 상세" />

        <View style={styles.hero}>
  <Image
    source={require("../../../assets/images/yudanja/card-mountain.png")}
    style={styles.heroMountain}
    resizeMode="contain"
  />

  <View style={styles.heroTextBlock}>
  <Text style={styles.title}>{album?.title || "유단자회 앨범"}</Text>

  <Text style={styles.meta}>
    {formatDate(album?.eventDate)} · 사진 {album?.photoCount || 0}장
  </Text>

  <View style={styles.detailBrand}>
    <Image
      source={require("../../../assets/images/yudanja/yudanja-album-emblem.png")}
      style={styles.detailBrandEmblem}
      resizeMode="contain"
    />

    <View>
      <Text style={styles.detailBrandTitle}>현중태극권 유단자회</Text>
      <Text style={styles.detailBrandSub}>HYUNJOONG TAICHI · YUDANJA GROUP</Text>
    </View>
  </View>
</View>
</View>

        <View style={styles.infoCard}>
  <View style={styles.infoItem}>
    <Image
  source={photoIcon}
  style={styles.infoImageIcon}
  resizeMode="contain"
/>
    <Text style={styles.infoLabel}>사진 수</Text>
    <Text style={styles.infoValue}>{album?.photoCount || 0}장</Text>
  </View>

  <View style={styles.infoDivider} />

  <View style={styles.infoItem}>
    <Image
  source={dateIcon}
  style={styles.infoImageIcon}
  resizeMode="contain"
/>
    <Text style={styles.infoLabel}>작성일</Text>
    <Text style={styles.infoValue}>{formatDate(album?.eventDate)}</Text>
  </View>

  <View style={styles.infoDivider} />

  <View style={styles.infoItem}>
    <Image
  source={locationIcon}
  style={styles.infoImageIcon}
  resizeMode="contain"
/>
    <Text style={styles.infoLabel}>장소</Text>
    <Text style={styles.infoValue} numberOfLines={1}>
      {album?.location || "미입력"}
    </Text>
  </View>

  <View style={styles.infoDivider} />

  <View style={styles.infoItem}>
    <Image
  source={commentIcon}
  style={styles.infoImageIcon}
  resizeMode="contain"
/>
    <Text style={styles.infoLabel}>댓글</Text>
    <Text style={styles.infoValue}>{comments.length}개</Text>
  </View>
</View>

        {album?.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descText}>{album.description}</Text>
          </View>
        ) : null}

        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
            {photos.map((photo) => (
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

        {comments.length > 0 ? (
          <View style={styles.commentSection}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>댓글</Text>
              <Text style={styles.commentCount}>{comments.length}개</Text>
            </View>

            <View style={styles.commentList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentItemHeader}>
                    <View style={styles.commentMetaLeft}>
                      <Text style={styles.commentAuthor}>
                        {comment.memberName}
                      </Text>
                      <Text style={styles.commentDate}>
                        {formatCommentDateTime(comment.createdAt)}
                      </Text>
                    </View>

                    {comment.isMine ? (
                      <Pressable
                        onPress={() => handleDeleteComment(comment.id)}
                      >
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
    backgroundColor: colors.background || PAPER,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background || PAPER,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: fonts.medium,
    color: SUB,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    minHeight: "100%",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 190,
    backgroundColor: PAPER,
  },

hero: {
  minHeight: 240,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  paddingHorizontal: 22,
  paddingTop: 10,
  paddingBottom: 18,
},

heroMountain: {
  position: "absolute",
  right: -40,
  bottom: 22,
  width: 250,
  height: 150,
  opacity: 0.16,
},
heroTextBlock: {
  alignItems: "center",
  transform: [{ translateY: -15 }],
},
detailBrand: {
  marginTop: 22,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
},

detailBrandEmblem: {
  width: 34,
  height: 34,
  opacity: 0.9,
  marginTop: -7,
},

detailBrandTitle: {
  marginTop: -5,
  fontFamily: fonts.titleSemi,
  fontSize: 15,
  color: GOLD,
  letterSpacing: 0.5,
},

detailBrandSub: {
  marginTop: 2,
  fontFamily: fonts.medium,
  fontSize: 9,
  color: "#C3A27A",
  letterSpacing: 0.8,
},

heroPhrase: {
  marginTop: 14,
  textAlign: "center",
  fontFamily: fonts.titleSemi,
  fontSize: 15,
  lineHeight: 24,
  color: INK,
},
title: {
  textAlign: "center",
  fontFamily: fonts.title,
  fontSize: 30,
  lineHeight: 40,
  color: INK,
},

meta: {
  marginTop: 10,
  textAlign: "center",
  fontFamily: fonts.medium,
  fontSize: 15,
  color: SUB,
},
infoCard: {
  marginTop: -45,
  minHeight: 104,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: LINE,
  backgroundColor: CARD,
  paddingVertical: 16,
  paddingHorizontal: 8,
  flexDirection: "row",
  alignItems: "center",
  ...shadow.card,
},
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  
infoLabel: {
  marginTop: 6,
  fontFamily: fonts.medium,
  fontSize: 11,
  color: SUB,
},

infoValue: {
  marginTop: 7,
  fontFamily: fonts.bold,
  fontSize: 12,
  color: INK,
  textAlign: "center",
},
  infoDivider: {
    width: 1,
    height: 52,
    backgroundColor: LINE,
  },

  descCard: {
  marginTop: 18,
  borderRadius: 22,
  backgroundColor: CARD,
  borderWidth: 1,
  borderColor: LINE,
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
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoItem: {
    width: "48.8%",
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F1E8DC",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },

  emptyCard: {
    marginTop: 24,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    padding: 22,
    ...shadow.card,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: INK,
  },
  emptyText: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: SUB,
  },

  commentSection: {
    marginTop: 48,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
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
    color: INK,
  },
  commentCount: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: GOLD,
  },
  commentList: {
    marginTop: 16,
    gap: 12,
  },
  commentItem: {
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 12,
  },
  commentItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentMetaLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 10,
  },
  commentAuthor: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: INK,
  },
  commentDate: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: "#9A8A7E",
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

  fixedCommentBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
    backgroundColor: PAPER,
    borderTopWidth: 1,
    borderTopColor: LINE,
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
    borderColor: LINE,
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
    color: INK,
    padding: 0,
    textAlignVertical: "top",
  },
  fixedCommentSubmitButton: {
    borderRadius: 999,
    backgroundColor: INK,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  commentSubmitButtonDisabled: {
    opacity: 0.45,
  },
  commentSubmitText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#F7E5C3",
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
  infoImageIcon: {
  width: 24,
  height: 24,
  tintColor: GOLD,
},
});