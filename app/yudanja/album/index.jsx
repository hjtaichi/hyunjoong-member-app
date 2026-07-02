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
import { useAuth } from "../../../src/contexts/AuthContext";
import { getDojangAlbums } from "../../../src/api/dojangAlbum";
import { colors, shadow } from "../../../src/theme";
import ScreenHeader from "../../../src/components/ScreenHeader";

const iconPhoto = require("../../../assets/images/dojang-album/icon-photo.png");
const iconDate = require("../../../assets/images/dojang-album/icon-date.png");

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  hanja: "ZhaoKai",
};
const albumBrushLandscape = require("../../../assets/images/yudanja/album-brush-landscape.png");
const yudanjaAlbumEmblem = require("../../../assets/images/yudanja/yudanja-album-emblem.png");
function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}.${m}.${d}`;
}

export default function YudanjaAlbumScreen() {
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

        const result = await getDojangAlbums(token, "yudanja");
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
        <Text style={styles.loadingText}>
          유단자회 앨범을 불러오는 중입니다.
        </Text>
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
        <ScreenHeader title="유단자회 앨범" />

        <View style={styles.hero}>
  <View style={styles.heroBrushWrap} pointerEvents="none">
    <Image
      source={albumBrushLandscape}
      style={styles.heroBrush}
      resizeMode="stretch"
    />
  </View>

  <Image
    source={yudanjaAlbumEmblem}
    style={styles.heroEmblem}
    resizeMode="contain"
  />

  <Text style={styles.heroDesc}>
    함께한 순간을 사진으로 남깁니다.
  </Text>
</View>

        {featuredAlbum ? (
          <>
           <View style={[styles.sectionHeader, styles.recentSectionHeader]}>
  <Text style={styles.sectionTitle}>최근 앨범</Text>

</View>

            <Pressable
              style={styles.featuredCard}
              onPress={() => router.push(`/yudanja/album/${featuredAlbum.id}`)}
            >
              <View style={styles.featuredThumb}>
                {featuredAlbum.coverThumbnailUrl || featuredAlbum.coverImageUrl ? (
                  <Image
                    source={{
                      uri:
                        featuredAlbum.coverThumbnailUrl ||
                        featuredAlbum.coverImageUrl,
                    }}
                    style={styles.featuredThumbImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Image
                    source={require("../../../assets/images/yudanja/card-mountain.png")}
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
  <Text style={styles.albumMetaText}>{formatDate(featuredAlbum.eventDate)}</Text>

  <Image source={iconPhoto} style={styles.albumMetaIcon} resizeMode="contain" />
  <Text style={styles.albumMetaText}>사진 {featuredAlbum.photoCount || 0}장</Text>
</View>

                <View style={styles.albumButton}>
                  <Text style={styles.albumButtonText}>앨범 보기 ›</Text>
                </View>
              </View>

              <View style={styles.featuredMountainWrap} pointerEvents="none">
  <Image
    source={require("../../../assets/images/yudanja/card-mountain.png")}
    style={styles.featuredMountain}
    resizeMode="stretch"
  />
</View>
            </Pressable>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>아직 공개된 앨범이 없습니다.</Text>
            <Text style={styles.emptyText}>
              유단자회 수련 사진이 올라오면 이곳에서 확인할 수 있습니다.
            </Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>앨범 목록</Text>
          <Text style={styles.sectionCount}>총 {albums.length}개</Text>
        </View>

        <View style={styles.albumList}>
          {albums.map((album) => (
            <Pressable
              key={album.id}
              style={styles.albumCard}
              onPress={() => router.push(`/yudanja/album/${album.id}`)}
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
                    source={require("../../../assets/images/yudanja/card-mountain.png")}
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
  <Text style={styles.albumMetaText}>{formatDate(album.eventDate)}</Text>

  <Image source={iconPhoto} style={styles.albumMetaIcon} resizeMode="contain" />
  <Text style={styles.albumMetaText}>사진 {album.photoCount || 0}장</Text>
</View>
              </View>

              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
<View style={styles.footerSpacer} />
        <View style={styles.footer}>
  <View style={styles.footerInner}>
    <Image
      source={yudanjaAlbumEmblem}
      style={styles.footerEmblem}
      resizeMode="contain"
    />

    <View>
      <Text style={styles.footerTitle}>현중태극권 유단자회</Text>
      <Text style={styles.footerSubText}>HYUNJOONG TAICHI · YUDANJA GROUP</Text>
    </View>
  </View>
</View>
      </ScrollView>
    </View>
  );
}

const PAPER = "#FFFCF6";
const CARD = "#FFFDF8";
const INK = "#2F241F";
const SUB = "#7A6C63";
const GOLD = "#B9894A";
const LINE = "#EFE3D8";

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
    color: SUB,
  },
content: {
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
  flexGrow: 1,
  minHeight: "100%",
  paddingHorizontal: 18,
  paddingTop: 10,
  paddingBottom: 28,
  backgroundColor: PAPER,
},


  hero: {
  minHeight: 245,
  marginTop: -23,
  marginHorizontal: -18,
  paddingHorizontal: 18,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},
heroBrushWrap: {
  position: "absolute",
  left: -24,
  right: -24,
  bottom: 35,
  height: 135,
  opacity: 0.52,
},

heroBrush: {
  width: "100%",
  height: "100%",
},
heroEmblem: {
  width: 150,
  height: 150,
},

heroDesc: {
  marginTop: 4,
  fontFamily: fonts.titleSemi,
  fontSize: 16.5,
  lineHeight: 28,
  color: INK,
},

  heroMountain: {
    position: "absolute",
    right: -44,
    bottom: 8,
    width: 250,
    height: 155,
    opacity: 0.24,
  },
  
  sectionHeader: {
    marginTop: 20,
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
    fontSize: 14,
    color: SUB,
  },
  viewAllText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: GOLD,
  },

  featuredCard: {
    minHeight: 150,
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
featuredThumb: {
  width: 112,
  height: 112,
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
    opacity: 0.5,
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
    fontSize: 18,
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
  featuredMountainWrap: {
  position: "absolute",
  left: 200,
  right: -80,
  bottom: -40,
  height: 125,
  opacity: 0.35,
},

featuredMountain: {
  width: "70%",
  height: "70%",
},

  albumList: {
    gap: 12,
  },
  albumCard: {
    minHeight: 92,
    borderRadius: 22,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    ...shadow.card,
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
    width: "90%",
    height: "90%",
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
    fontSize: 30,
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

footer: {
  marginTop: 0,
  paddingTop: 15,
  paddingBottom: -10,
  borderTopWidth: 1,
  borderTopColor: LINE,
  alignItems: "center",
},

footerInner: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
},

footerEmblem: {
  width: 38,
  height: 38,
  opacity: 0.9,
},

footerTitle: {
  fontFamily: fonts.titleSemi,
  fontSize: 14,
  color: GOLD,
  letterSpacing: 1,
},

footerSubText: {
  marginTop: 2,
  fontFamily: fonts.medium,
  fontSize: 9,
  color: "#C3A27A",
  letterSpacing: 1.2,
},
footerSpacer: {
  flexGrow: 1,
  minHeight: 36,
},
recentSectionHeader: {
  marginTop: -4,
},
});