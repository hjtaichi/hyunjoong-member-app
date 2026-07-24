import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { getMemberProducts, createProductOrder } from "../src/api/memberShop";
import { normalizeShopCategory } from "../src/features/shop/shopCategory";
import { colors, radius, shadow } from "../src/theme";
import ScreenHeader from "../src/components/ScreenHeader";
import { useCart } from "../src/contexts/CartContext";
import { API_BASE_URL } from "../src/config/env";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function formatProductPrice(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value)
    .trim()
    .replace(/,/g, "");

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return `${amount.toLocaleString("ko-KR")}원`;
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_ORIGIN}${imageUrl}`;
}

function getStockInfo(product) {
  if (product?.stockStatus === "available") {
    return { label: "재고 있음", tone: "available" };
  }

  if (product?.stockStatus === "unavailable") {
    return { label: "재고 없음", tone: "order" };
  }

  return { label: "문의 필요", tone: "order" };
}

function AutoRatioImage({ imageUrl, style }) {
  const source = getImageUrl(imageUrl);
  const [aspectRatio, setAspectRatio] = useState(1.25);

  useEffect(() => {
    if (!source) return undefined;

    let active = true;

    Image.getSize(
      source,
      (width, height) => {
        if (active && width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {}
    );

    return () => {
      active = false;
    };
  }, [source]);

  if (!source) return null;

  return (
    <Image
      source={{ uri: source }}
      style={[style, { aspectRatio }]}
      resizeMode="contain"
      onLoad={(event) => {
        const width = Number(event?.nativeEvent?.source?.width || 0);
        const height = Number(event?.nativeEvent?.source?.height || 0);

        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      }}
    />
  );
}

function DetailImageSection({ title, imageUrl, large = false }) {
  const source = getImageUrl(imageUrl);
  if (!source) return null;

  return (
    <View style={styles.detailSection}>
      {title ? <Text style={styles.detailSectionTitle}>{title}</Text> : null}

      <AutoRatioImage
        imageUrl={source}
        style={[
          styles.detailImage,
          large && styles.detailImageLarge,
        ]}
      />
    </View>
  );
}

export default function ShopDetailScreen() {
  const { productId } = useLocalSearchParams();
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const result = await getMemberProducts(token);
      setProducts(Array.isArray(result) ? result : []);
    } catch (error) {
      console.log("상품 상세 조회 실패:", error?.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const product = useMemo(
    () => products.find((item) => String(item.id) === String(productId)),
    [products, productId]
  );

  const mainImage = getImageUrl(product?.imageUrl);
  const stock = getStockInfo(product);
  const priceLabel =
    formatProductPrice(product?.price);
  const displayCategory =
    normalizeShopCategory(product?.category);

const usedImages = [
  product?.imageUrl,
  product?.bannerImageUrl,
  product?.lifestyleImageUrl,
].filter(Boolean);

const detailImages = [
  product?.detailImage1,
  product?.detailImage2,
  product?.detailImage3,
]
  .filter(Boolean)
  .filter((imageUrl) => !usedImages.includes(imageUrl));

  function handleAddToCartAndOpenCart() {
    if (!product) return;

    addToCart(product, 1);

    // Let CartContext commit the item before changing the route.
    setTimeout(() => {
      router.push("/cart");
    }, 0);
  }

  async function handleOrder() {
    if (ordering) return;

    try {
      setOrdering(true);

      await createProductOrder(token, {
        items: [
          {
            productId: product.id,
            quantity: 1,
            memo: `${product.name} 주문 요청`,
          },
        ],
        memo: `${product.name} 주문 요청`,
      });

      setSuccessModalVisible(true);
    } catch (error) {
      Alert.alert("오류", error.message || "주문 요청에 실패했습니다.");
    } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>상품 정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>상품을 찾을 수 없습니다.</Text>
        <Pressable style={styles.backHomeButton} onPress={() => router.back()}>
          <Text style={styles.backHomeText}>돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.shopHeader}>
          <ScreenHeader title="상품 상세" />

          <Link href="/cart" asChild>
            <Pressable
              style={styles.cartButton}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="장바구니로 이동"
            >
            <Image
              source={require("../assets/images/icon-shop-cart.png")}
              style={styles.cartImage}
              resizeMode="contain"
            />
          </Pressable>
          </Link>
        </View>

        <View style={styles.heroCard}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={styles.noImageText}>玄</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{displayCategory}</Text>

            <View
              style={[
                styles.stockPill,
                stock.tone === "available" && styles.stockPillAvailable,
                stock.tone === "order" && styles.stockPillOrder,
              ]}
            >
              <Text
                style={[
                  styles.stockPillText,
                  stock.tone === "available" && styles.stockPillTextAvailable,
                  stock.tone === "order" && styles.stockPillTextOrder,
                ]}
              >
                {stock.label}
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {product.optionName ? (
            <Text style={styles.optionText}>{product.optionName}</Text>
          ) : null}

          {priceLabel ? (
            <Text style={styles.productPrice}>{priceLabel}</Text>
          ) : null}

          <View style={styles.goldLine} />

          <Text style={styles.description}>
            {product.memo ||
              "도장 수련과 생활에 어울리는 현중태극권 Shop 상품입니다. 자세한 구매 방법은 도장에서 문의해주세요."}
          </Text>
        </View>

<DetailImageSection
  title="상품 설명"
  imageUrl={product.bannerImageUrl}
  large
/>
<DetailImageSection
  imageUrl={product.lifestyleImageUrl}
  large
/>

        {detailImages.length > 0 ? (
          <View style={styles.detailGroup}>
            <Text style={styles.detailSectionTitle}>상세 안내</Text>

            {detailImages.map((imageUrl, index) => (
              <View key={`${imageUrl}-${index}`} style={styles.detailImageWrap}>
                <AutoRatioImage
                  imageUrl={imageUrl}
                  style={styles.detailImage}
                />
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.specCard}>
          <Text style={styles.specTitle}>상품 정보</Text>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>분류</Text>
            <Text style={styles.specValue}>{displayCategory}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>옵션</Text>
            <Text style={styles.specValue}>{product.optionName || "도장 문의"}</Text>
          </View>

          {priceLabel ? (
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>가격</Text>
              <Text style={styles.specValue}>{priceLabel}</Text>
            </View>
          ) : null}

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>재고</Text>
            <Text style={styles.specValue}>{stock.label}</Text>
          </View>
        </View>

        <Text style={styles.footerNotice}>
          ※ 모든 상품은 도장에 문의 후 구매 또는 주문 가능합니다.
        </Text>

        <Modal
          visible={successModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalCard}>
              <View style={styles.successIconCircle}>
                <Text style={styles.successIconText}>✓</Text>
              </View>

              <Text style={styles.successTitle}>주문 요청 완료</Text>

              <Text style={styles.successMessage}>
                주문 요청이 접수되었습니다.{"\n"}
                관리자가 확인 후 안내드릴 예정입니다.
              </Text>

              <Pressable
                style={styles.successButton}
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.successButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.outlineButton}
          onPress={handleAddToCartAndOpenCart}
        >
          <Text style={styles.outlineButtonText}>장바구니</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryButton, ordering && styles.primaryButtonDisabled]}
          onPress={handleOrder}
        >
          <Text style={styles.primaryButtonText}>
            {ordering ? "요청 중..." : "구매 문의하기"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 140,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  shopHeader: {
    position: "relative",
  },
  cartButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
    elevation: 30,
  },
  cartImage: {
    width: 24,
    height: 24,
    opacity: 0.82,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#7A6A61",
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textMain,
  },
  backHomeButton: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: "#3A281F",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backHomeText: {
    color: "#fff",
    fontFamily: fonts.bold,
  },
  heroCard: {
    marginTop: 16,
    height: 300,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#F3E8DE",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  noImageBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    fontSize: 48,
    fontFamily: fonts.bold,
    color: "#B89A7A",
  },
  summaryCard: {
    marginTop: 16,
    borderRadius: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    ...shadow.card,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fonts.semiBold,
    color: colors.warmBrown || "#9A6A36",
  },
  stockPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stockPillAvailable: {
    backgroundColor: "#EAF4E6",
  },
  stockPillOrder: {
    backgroundColor: "#F3D38C",
  },
  stockPillText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  stockPillTextAvailable: {
    color: "#3F6B3A",
  },
  stockPillTextOrder: {
    color: "#684013",
  },
  productName: {
    marginTop: 12,
    fontSize: 25,
    lineHeight: 34,
    fontFamily: fonts.titleSemi,
    color: colors.textMain,
  },
  optionText: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },
  productPrice: {
    marginTop: 8,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.bold,
    color: colors.warmBrown || "#8A5E49",
  },
  goldLine: {
    width: 42,
    height: 2,
    borderRadius: 99,
    backgroundColor: colors.warmBrown || "#C89E6A",
    marginTop: 18,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 26,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },
  detailSection: {
    marginTop: 20,
  },
  detailGroup: {
    marginTop: 20,
    gap: 12,
  },
  detailSectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fonts.titleSemi,
    color: colors.textMain,
  },
  detailImageWrap: {
  overflow: "hidden",
  backgroundColor: "transparent",
},
  detailImageLarge: {
    marginTop: 0,
  },

  detailImage: {
    width: "100%",
  },
  specCard: {
    marginTop: 24,
    borderRadius: 26,
    backgroundColor: "#FFF9F0",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  specTitle: {
    marginBottom: 12,
    fontSize: 17,
    lineHeight: 24,
    fontFamily: fonts.titleSemi,
    color: colors.textMain,
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#EADDCF",
  },
  specLabel: {
    width: 72,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: "#7A6254",
  },
  specValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textMain,
  },
  footerNotice: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.medium,
    color: "#7F6E63",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "rgba(255, 252, 250, 0.96)",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    gap: 10,
  },
  outlineButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warmBrown,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  outlineButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.warmBrown,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.warmBrown,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  primaryButtonDisabled: {
    opacity: 0.78,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 22, 17, 0.38)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  successModalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 26,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#E7D6C9",
    padding: 24,
    alignItems: "center",
    shadowColor: "#3A281F",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  successIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F3D38C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successIconText: {
    fontSize: 30,
    fontFamily: fonts.bold,
    color: "#5A3910",
  },
  successTitle: {
    fontSize: 21,
    fontFamily: fonts.bold,
    color: colors.textMain,
  },
  successMessage: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: "#6F5C50",
    textAlign: "center",
  },
  successButton: {
    marginTop: 20,
    width: "100%",
    height: 48,
    borderRadius: 15,
    backgroundColor: "#3A281F",
    alignItems: "center",
    justifyContent: "center",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});