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
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { getMemberProducts, createProductOrder } from "../src/api/memberShop";
import { colors } from "../src/theme/colors";
import { useCart } from "../src/contexts/CartContext";

const API_ORIGIN = "http://172.30.1.16:5000";

function formatPrice(value) {
  return `₩${Number(value || 0).toLocaleString("ko-KR")}`;
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_ORIGIN}${imageUrl}`;
}

function getStockInfo(product) {
  if (product?.stockQuantity > 0) {
    return {
      label: "재고 있음",
      desc: "도장에서 바로 구매 가능",
      detail: "오늘 방문 시 구매할 수 있어요.",
      tone: "available",
    };
  }

  return {
    label: "주문 요청",
    desc: "관리자 확인 후 안내",
    detail: "주문 요청 후 수령 일정을 안내드려요.",
    tone: "order",
  };
}


export default function ShopDetailScreen() {
  const { productId } = useLocalSearchParams();
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const { addToCart } = useCart();

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

  const imageSource = getImageUrl(product?.imageUrl);
  const stock = getStockInfo(product);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>상품 상세</Text>

        <Pressable style={styles.cartIcon} onPress={() => router.push("/cart")}>
  <Image
    source={require("../assets/images/icon-shop-cart.png")}
    style={styles.cartImage}
    resizeMode="contain"
  />
</Pressable>
      </View>

      <View style={styles.imageCard}>
        {imageSource ? (
          <Image
            source={{ uri: imageSource }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImageBox}>
            <Text style={styles.noImageText}>玄</Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>

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

        <Text style={styles.buyText}>{stock.desc}</Text>

        <View style={styles.line} />

        <Text style={styles.description}>
          {product.memo ||
            product.optionName ||
            "도장 수련에 필요한 물품입니다. 자세한 사이즈와 수령 방법은 도장에 문의해주세요."}
        </Text>

        <View style={styles.specBox}>
          <View style={styles.specRow}>
            <Text style={styles.specIcon}>▣</Text>
            <Text style={styles.specLabel}>분류</Text>
            <Text style={styles.specValue}>{product.category || "기타"}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specIcon}>◈</Text>
            <Text style={styles.specLabel}>옵션</Text>
            <Text style={styles.specValue}>
              {product.optionName || "도장 문의"}
            </Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specIcon}>☑</Text>
            <Text style={styles.specLabel}>재고</Text>
            <Text style={styles.specValue}>{product.stockQuantity || 0}개</Text>
          </View>
        </View>

        <View style={styles.recommendBox}>
          <Text style={styles.boxTitle}>이런 분께 추천해요</Text>

          <View style={styles.checkRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.checkText}>도장 물품이 필요한 회원</Text>
          </View>

          <View style={styles.checkRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.checkText}>수련 준비물을 갖추려는 회원</Text>
          </View>

          <View style={styles.checkRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.checkText}>관리자 안내 후 구매하고 싶은 회원</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.outlineButton}
            onPress={() => {
  addToCart(product, 1);
  router.push("/cart");
}}
          >
            <Text style={styles.outlineButtonText}>장바구니 담기</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, ordering && styles.primaryButtonDisabled]}
            onPress={async () => {
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
            }}
          >
            <Text style={styles.primaryButtonText}>
              {ordering ? "요청 중..." : "구매 문의하기"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.stockGuideCard}>
        <Text style={styles.stockGuideTitle}>재고 상태 안내</Text>

        <View style={styles.stockGuideItem}>
          <View style={[styles.statusDot, styles.goldDot]} />
          <View>
            <Text style={styles.statusTitle}>재고 있음</Text>
            <Text style={styles.statusDesc}>도장에서 바로 구매 가능</Text>
          </View>
        </View>

        <View style={styles.stockGuideItem}>
          <View style={[styles.statusDot, styles.darkDot]} />
          <View>
            <Text style={styles.statusTitle}>주문 요청</Text>
            <Text style={styles.statusDesc}>관리자 확인 후 수령 일정 안내</Text>
          </View>
        </View>

        <View style={styles.stockGuideItem}>
          <View style={[styles.statusDot, styles.grayDot]} />
          <View>
            <Text style={styles.statusTitle}>품절</Text>
            <Text style={styles.statusDesc}>입고 일정은 추후 안내</Text>
          </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 42,
    paddingBottom: 120,
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
    fontWeight: "800",
    color: "#3A281F",
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
    fontWeight: "800",
  },

  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backText: {
    fontSize: 38,
    color: "#2F2119",
    marginTop: -5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2F2119",
  },
  cartIcon: {
    width: 42,
    height: 42,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  cartText: {
    fontSize: 21,
  },

  imageCard: {
    marginTop: 18,
    height: 318,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#F3E8DE",
    borderWidth: 1,
    borderColor: "#E8D9CB",
  },
  mainImage: {
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
    fontWeight: "900",
    color: "#B89A7A",
  },

  infoCard: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#E9DCD1",
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#241811",
    letterSpacing: -0.3,
  },
  productPrice: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "#2F2119",
    letterSpacing: -0.2,
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
  fontWeight: "800",
},
stockPillTextAvailable: {
  color: "#3F6B3A",
},
stockPillTextOrder: {
  color: "#684013",
},
  buyText: {
    marginTop: 8,
    alignSelf: "flex-end",
    fontSize: 13,
    color: "#8A6E5C",
  },
  line: {
    height: 1,
    backgroundColor: "#E8D9CB",
    marginVertical: 18,
  },
  description: {
    fontSize: 15,
    lineHeight: 25,
    color: "#4F4038",
    fontWeight: "400",
  },

  specBox: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8D9CB",
    backgroundColor: "#FFF9F0",
    padding: 15,
    gap: 13,
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  specIcon: {
    width: 30,
    color: "#8C6B52",
    fontSize: 13,
  },
  specLabel: {
    width: 58,
    fontSize: 14,
    color: "#5C4A3F",
    fontWeight: "700",
  },
  specValue: {
    flex: 1,
    fontSize: 14,
    color: "#2F2119",
  },

  recommendBox: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8D9CB",
    backgroundColor: "#FFFDF9",
    padding: 15,
  },
  boxTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#3A281F",
    marginBottom: 12,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  checkIcon: {
    width: 22,
    color: "#B88737",
    fontWeight: "900",
  },
  checkText: {
    flex: 1,
    fontSize: 14,
    color: "#4F4038",
    lineHeight: 20,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  outlineButton: {
    flex: 1,
    height: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#4A3327",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF9",
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3A281F",
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 17,
    backgroundColor: "#3A281F",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.78,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  stockGuideCard: {
    marginTop: 14,
    borderRadius: 26,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: "#E9DCD1",
    padding: 20,
  },
  stockGuideTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#3A281F",
    marginBottom: 12,
  },
  stockGuideItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    gap: 12,
  },
  statusDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  goldDot: {
  backgroundColor: "#8DB77E",
},
darkDot: {
  backgroundColor: "#D8AD45",
},
grayDot: {
  backgroundColor: "#B9B3AE",
},
  statusTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4A3327",
  },
  statusDesc: {
    marginTop: 2,
    fontSize: 13,
    color: "#7A6A61",
  },
  footerNotice: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: "#7F6E63",
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
    fontWeight: "900",
    color: "#5A3910",
  },
  successTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#2F2119",
  },
  successMessage: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
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
    fontWeight: "800",
  },
  cartImage: {
  width: 26,
  height: 26,
},
});