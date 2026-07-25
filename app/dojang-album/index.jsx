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
import { API_BASE_URL } from "../../src/config/env";
import { colors, shadow } from "../../src/theme";
import ScreenHeader from "../../src/components/ScreenHeader";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  hanja: "ZhaoKai",
};

const albumHeroWide = require("../../assets/images/album-hero-wide.png");
const cardMountain = require("../../assets/images/yudanja/card-mountain.png");
const iconPhoto = require("../../assets/images/dojang-album/icon-photo.png");
const iconDate = require("../../assets/images/dojang-album/icon-date.png");

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

  return `${y}.${m}.${d}`;
}

function getImageUri(value) {
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const cleanPath = value.startsWith("/") ? value : `/${value}`;
  return `${API_BASE_URL}${cleanPath}`;
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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
<ScreenHeader title="앨범" />

        <View style={styles.hero}>
  <Image
    source={albumHeroWide}
    style={styles.heroWideBg}
    resizeMode="cover"
  />

  <Text style={styles.heroPhrase}>
    함께한 순간들을{"\n"}사진으로 남겨보세요.
  </Text>
</View>

        {featuredAlbum ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>최근 앨범</Text>

            </View>

            <Pressable
              style={styles.featuredCard}
              onPress={() => router.push(`/dojang-album/${featuredAlbum.id}`)}
            >
              <Image
                source={cardMountain}
                style={styles.featuredBg}
                resizeMode="stretch"
              />

              <View style={styles.featuredThumb}>
                {featuredAlbum.coverThumbnailUrl ||
                featuredAlbum.coverImageUrl ? (
                  <Image
                    source={{
                      uri: getImageUri(
                        featuredAlbum.coverThumbnailUrl ||
                          featuredAlbum.coverImageUrl
                      ),
                    }}
                    style={styles.featuredThumbImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={cardMountain}
                    style={styles.featuredPlaceholder}
                    resizeMode="contain"
                  />
                )}
              </View>

              <View style={styles.featuredText}>
                <View style={styles.featuredTitleRow}>
                  <Text style={styles.featuredTitle} numberOfLines={1}>
                    {featuredAlbum.title}
                  </Text>

                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>최신</Text>
                  </View>
                </View>

                <View style={styles.albumMetaRow}>
  <Image source={iconDate} style={styles.albumMetaIcon} resizeMode="contain" />
  <Text style={styles.albumMetaText}>행사일 {formatDate(featuredAlbum.eventDate)}</Text>

  <Image source={iconPhoto} style={styles.albumMetaIcon} resizeMode="contain" />
  <Text style={styles.albumMetaText}>사진 {featuredAlbum.photoCount || 0}장</Text>
</View>

                <View style={styles.albumButton}>
                  <Text style={styles.albumButtonText}>앨범 보기 ›</Text>
                </View>
              </View>
            </Pressable>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>아직 공개된 앨범이 없습니다.</Text>
            <Text style={styles.emptyText}>
              도장 사진이 올라오면 이곳에서 확인할 수 있습니다.
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>앨범 목록</Text>
          <Text style={styles.sectionCount}>전체 {albums.length}개</Text>
        </View>

        <View style={styles.albumListCard}>
          {albums.map((album, index) => (
            <Pressable
              key={album.id}
              style={[
                styles.albumRow,
                index === albums.length - 1 && styles.albumRowLast,
              ]}
              onPress={() => router.push(`/dojang-album/${album.id}`)}
            >
              <View style={styles.albumThumb}>
                {album.coverThumbnailUrl || album.coverImageUrl ? (
                  <Image
                    source={{
                      uri: getImageUri(
                        album.coverThumbnailUrl || album.coverImageUrl
                      ),
                    }}
                    style={styles.albumThumbImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={cardMountain}
                    style={styles.albumPlaceholder}
                    resizeMode="contain"
                  />
                )}
              </View>

              <View style={styles.albumText}>
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {album.title}
                </Text>
                <View style={styles.albumMetaRow}>
  <Image source={iconDate} style={styles.albumMetaIcon} resizeMode="contain" />
  <Text style={styles.albumMetaText}>행사일 {formatDate(album.eventDate)}</Text>

  <Image source={iconPhoto} style={styles.albumMetaIcon} resizeMode="contain" />
  <Text style={styles.albumMetaText}>사진 {album.photoCount || 0}장</Text>
</View>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: 18,
    paddingBottom: 52,
    backgroundColor: PAPER,
  },

heroWideBg: {
  position: "absolute",
  left: 0,
  top: 45,
  width: "100%",
  height: 145,
  opacity: 0.3,
},

hero: {
  minHeight: 150,
  marginHorizontal: -18,
  paddingHorizontal: 18,
  paddingTop: 18,
  paddingBottom: 10,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
},
heroPhrase: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 60,
  textAlign: "center",
  fontFamily: fonts.titleSemi,
  fontSize: 18,
  lineHeight: 27,
  color: INK,
},
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: fonts.titleSemi,
    fontSize: 18,
    color: INK,
  },
  sectionCount: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: SUB,
  },
  viewAllText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: GOLD,
  },

  featuredCard: {
    minHeight: 166,
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    ...shadow.card,
  },
  featuredBg: {
    position: "absolute",
    right: -42,
    bottom: -28,
    width: 230,
    height: 126,
    opacity: 0.28,
  },
  featuredThumb: {
    width: 116,
    height: 116,
    borderRadius: 18,
    backgroundColor: "#F1E8DC",
    overflow: "hidden",
    zIndex: 2,
  },
  featuredThumbImage: {
    width: "100%",
    height: "100%",
  },
  featuredPlaceholder: {
    width: "100%",
    height: "100%",
    opacity: 0.45,
  },
  featuredText: {
    flex: 1,
    marginLeft: 16,
    zIndex: 2,
  },
  featuredTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredTitle: {
    flex: 1,
    fontFamily: fonts.titleSemi,
    fontSize: 20,
    color: INK,
  },
  newBadge: {
    borderRadius: 999,
    backgroundColor: "#F5E5CC",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  newBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: GOLD,
  },
  
  albumButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CDA873",
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  albumButtonText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: GOLD,
  },

  albumListCard: {
    borderRadius: 24,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 14,
    paddingVertical: 4,
    ...shadow.card,
  },
  albumRow: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 12,
  },
  albumRowLast: {
    borderBottomWidth: 0,
  },
  albumThumb: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: "#F1E8DC",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  albumThumbImage: {
    width: "100%",
    height: "100%",
  },
  albumPlaceholder: {
    width: 74,
    height: 74,
    opacity: 0.45,
  },
  albumText: {
    flex: 1,
    marginLeft: 16,
  },
  albumTitle: {
    fontFamily: fonts.titleSemi,
    fontSize: 18,
    color: INK,
  },
  
  chevron: {
    marginLeft: 8,
    fontSize: 28,
    color: GOLD,
  },

  emptyCard: {
    marginTop: 22,
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
  albumMetaRow: {
  marginTop: 8,
  flexDirection: "row",
  alignItems: "center",
  gap: 5,
  flexWrap: "wrap",
},

albumMetaIcon: {
  width: 14,
  height: 14,
  tintColor: GOLD,
},

albumMetaText: {
  fontFamily: fonts.medium,
  fontSize: 13,
  color: SUB,
},
});