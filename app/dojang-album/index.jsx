import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { getDojangAlbums } from "../../src/api/dojangAlbum";
import { colors, radius, shadow } from "../../src/theme";

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

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}.${m}.${d}`;
}

export default function DojangAlbumScreen() {
  const { token } = useAuth();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const featuredAlbum = albums[0];

  const loadAlbums = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);

        const result = await getDojangAlbums(token, "general");
        setAlbums(Array.isArray(result) ? result : []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlbums({ silent: true });
  }, [loadAlbums]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>도장 앨범을 불러오는 중입니다.</Text>
      </View>
    );
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
        <Text style={styles.title}>도장 앨범</Text>
        <Text style={styles.subtitle}>함께 수련한 시간들을 기록합니다.</Text>

        <Pressable
          style={styles.heroCard}
          disabled={!featuredAlbum}
          onPress={() => {
            if (!featuredAlbum) return;
            router.push(`/dojang-album/${featuredAlbum.id}`);
          }}
        >
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroLabel}>최근 도장 이야기</Text>
            <Text style={styles.heroTitle}>
              {featuredAlbum?.title || "아직 등록된 앨범이 없습니다"}
            </Text>
            <Text style={styles.heroMeta}>
              {featuredAlbum
                ? `사진 ${featuredAlbum.photoCount || 0}장 · ${formatDate(
                    featuredAlbum.eventDate
                  )}`
                : "관리자가 사진을 올리면 이곳에 표시됩니다."}
            </Text>

            {featuredAlbum ? (
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>사진 보기 ›</Text>
              </View>
            ) : null}
          </View>

          <Image
            source={require("../../assets/images/notice-bg.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>앨범 목록</Text>
          <Text style={styles.sectionCount}>앨범 {albums.length}개</Text>
        </View>

        {albums.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>아직 공개된 앨범이 없습니다.</Text>
            <Text style={styles.emptyText}>
              도장의 추억이 올라오면 이곳에서 확인할 수 있어요.
            </Text>
          </View>
        ) : (
          <View style={styles.albumList}>
            {albums.map((album) => (
              <Pressable
                key={album.id}
                style={styles.albumCard}
                onPress={() => router.push(`/dojang-album/${album.id}`)}
              >
                <View style={styles.albumThumb}>
                  {album.coverThumbnailUrl || album.coverImageUrl ? (
                    <Image
                      source={{
                        uri: album.coverThumbnailUrl || album.coverImageUrl,
                      }}
                      style={styles.albumThumbImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={require("../../assets/images/notice-bg.png")}
                      style={styles.albumPlaceholder}
                      resizeMode="contain"
                    />
                  )}
                </View>

                <View style={styles.albumTextBlock}>
                  <Text style={styles.albumTitle} numberOfLines={1}>
                    {album.title}
                  </Text>
                  <Text style={styles.albumMeta}>
                    {formatDate(album.eventDate)} · 사진 {album.photoCount || 0}장
                  </Text>
                </View>

                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 42,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    fontFamily: fonts.title,
    fontSize: 30,
    color: "#3A2C27",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#7A6C63",
  },
  heroCard: {
    marginTop: 28,
    minHeight: 190,
    borderRadius: 26,
    backgroundColor: "#FFF9EF",
    borderWidth: 1,
    borderColor: "#E8D6B8",
    overflow: "hidden",
    padding: 22,
    ...shadow.card,
  },
  heroTextBlock: {
    zIndex: 2,
    width: "68%",
  },
  heroLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#8A6A4D",
  },
  heroTitle: {
    marginTop: 16,
    fontFamily: fonts.titleSemi,
    fontSize: 25,
    lineHeight: 34,
    color: "#2F241F",
  },
  heroMeta: {
    marginTop: 10,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: "#7A6C63",
    lineHeight: 20,
  },
  heroButton: {
    marginTop: 18,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#3A2C27",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  heroButtonText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#F7E5C3",
  },
  heroImage: {
    position: "absolute",
    right: -18,
    bottom: -8,
    width: 210,
    height: 145,
    opacity: 0.55,
  },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 12,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.titleSemi,
    fontSize: 23,
    color: "#3A2C27",
  },
  sectionCount: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: "#8A6A4D",
  },
  emptyCard: {
    borderRadius: 24,
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
    lineHeight: 20,
    color: "#7A6C63",
  },
  albumList: {
    gap: 12,
  },
  albumCard: {
    minHeight: 96,
    borderRadius: 22,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#EFE3D8",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    ...shadow.card,
  },
  albumThumb: {
    width: 96,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#F5EEE5",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  albumThumbImage: {
    width: "100%",
    height: "100%",
  },
  albumPlaceholder: {
    width: 96,
    height: 72,
    opacity: 0.55,
  },
  albumTextBlock: {
    flex: 1,
    marginLeft: 14,
  },
  albumTitle: {
    fontFamily: fonts.titleSemi,
    fontSize: 18,
    color: "#2F241F",
  },
  albumMeta: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#7A6C63",
  },
  chevron: {
    fontSize: 28,
    color: "#B8A79A",
    marginLeft: 8,
  },
});