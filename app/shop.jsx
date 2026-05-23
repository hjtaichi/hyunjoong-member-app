import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { getMemberProducts } from "../src/api/memberShop";
import { colors } from "../src/theme/colors";

const API_ORIGIN = "http://172.30.1.16:5000";

const CATEGORIES = ["전체", "도복", "무기", "수련용품", "굿즈"];

function formatPrice(value) {
  return `₩${Number(value || 0).toLocaleString("ko-KR")}`;
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_ORIGIN}${imageUrl}`;
}

function getStockLabel(product) {
  if (product.stockQuantity > 0) {
    return {
      label: "재고 있음",
      desc: "오늘 도장에서 구매 가능",
      tone: "available",
    };
  }

  return {
    label: "주문 요청",
    desc: "관리자 확인 후 안내",
    tone: "order",
  };
}

export default function ShopScreen() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const result = await getMemberProducts(token);
      setProducts(Array.isArray(result) ? result : []);
    } catch (error) {
      console.log("상품 조회 실패:", error?.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "전체") return products;

    if (selectedCategory === "무기") {
      return products.filter((item) =>
        ["검", "부채", "무기"].includes(item.category)
      );
    }

    return products.filter((item) => item.category === selectedCategory);
  }, [products, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>상품을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>현중 Shop</Text>

        <Pressable style={styles.cartIcon} onPress={() => router.push("/cart")}>
  <Text style={styles.cartText}>🛒</Text>
</Pressable>
      </View>

      <View style={styles.hero}>
        <Image
          source={require("../assets/images/shop-mountain-bg.png")}
          style={styles.heroBg}
          resizeMode="cover"
        />

        <View style={styles.heroTextBox}>
          <Text style={styles.heroTitle}>현중 Shop</Text>
          <Text style={styles.heroDesc}>
            수련에 필요한 도장 물품과 용품 안내
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((category) => {
          const selected = selectedCategory === category;

          return (
            <Pressable
              key={category}
              style={[styles.categoryButton, selected && styles.categoryActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selected && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.noticeRow}>
        <Text style={styles.noticeIcon}>☆</Text>
        <Text style={styles.noticeText}>
          도장 회원만 구매 및 주문 문의가 가능합니다.
        </Text>
      </View>

      <View style={styles.productList}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>등록된 상품이 없습니다.</Text>
            <Text style={styles.emptyText}>
              관리자가 Shop 노출로 설정한 상품이 여기에 표시됩니다.
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const stock = getStockLabel(product);
            const imageSource = getImageUrl(product.imageUrl);

            return (
              <Pressable
                key={product.id}
                style={styles.productCard}
                onPress={() =>
                  router.push({
                    pathname: "/shop-detail",
                    params: { productId: product.id },
                  })
                }
              >
                <View style={styles.productImageWrap}>
                  <View style={styles.productImageBox}>
                    {imageSource ? (
                      <Image
                        source={{ uri: imageSource }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.noImageText}>玄</Text>
                    )}
                  </View>
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>

                  <Text style={styles.productPrice}>
                    {formatPrice(product.price)}
                  </Text>

                  <Text style={styles.productMemo} numberOfLines={2}>
                    {product.memo || product.optionName || "도장 수련용 상품"}
                  </Text>

                  <View style={styles.stockRow}>
                    <View
  style={[
    styles.stockBadge,
    stock.tone === "available" && styles.stockBadgeAvailable,
    stock.tone === "order" && styles.stockBadgeOrder,
  ]}
>
                      <Text
  style={[
    styles.stockBadgeText,
    stock.tone === "available" && styles.stockBadgeTextAvailable,
    stock.tone === "order" && styles.stockBadgeTextOrder,
  ]}
>
  {stock.label}
</Text>
                    </View>
                    <Text style={styles.stockDesc}>{stock.desc}</Text>
                  </View>
                </View>

                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#FFFCFA",
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 42,
    paddingBottom: 110,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background || "#FFFCFA",
  },
  loadingText: {
    marginTop: 10,
    color: "#7A6A61",
  },

  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
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

  hero: {
    marginTop: 8,
    height: 154,
    overflow: "hidden",
    backgroundColor: "#FFFCFA",
    justifyContent: "center",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.96,
  },
  heroTextBox: {
    paddingHorizontal: 34,
    paddingTop: 12,
  },
  heroTitle: {
    fontSize: 31,
    fontWeight: "800",
    color: "#3A281F",
    letterSpacing: -0.5,
  },
  heroDesc: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 20,
    color: "#5F4A3D",
    fontWeight: "400",
  },

  categoryRow: {
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  categoryButton: {
    paddingHorizontal: 21,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4D4C7",
    backgroundColor: "#FFFDF9",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryActive: {
    backgroundColor: "#3A281F",
    borderColor: "#3A281F",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B382E",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },

  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 16,
    paddingHorizontal: 18,
  },
  noticeIcon: {
    color: "#B88737",
    fontSize: 16,
    fontWeight: "800",
  },
  noticeText: {
    fontSize: 12,
    color: "#5C4B42",
    fontWeight: "600",
  },

  productList: {
    gap: 12,
    paddingHorizontal: 18,
  },
  productCard: {
    minHeight: 132,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    padding: 13,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#E9DCD1",
    shadowColor: "#BFA79B",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  productImageWrap: {
    width: 108,
    height: 108,
    borderRadius: 18,
    backgroundColor: "#F6EDE4",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  productImageBox: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    backgroundColor: "#F1E4D9",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  noImageText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#B89A7A",
  },

  productInfo: {
    flex: 1,
    marginLeft: 15,
    paddingVertical: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#241811",
    letterSpacing: -0.2,
  },
  productPrice: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "800",
    color: "#2F2119",
    letterSpacing: -0.1,
  },
  productMemo: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 19,
    color: "#5E5048",
    fontWeight: "400",
  },
  stockRow: {
    marginTop: 10,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  stockBadge: {
  alignSelf: "flex-start",
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 5,
},
stockBadgeAvailable: {
  backgroundColor: "#EAF4E6",
},
stockBadgeOrder: {
  backgroundColor: "#F3D38C",
},

 stockBadgeText: {
  fontSize: 11,
  fontWeight: "800",
},
stockBadgeTextAvailable: {
  color: "#3F6B3A",
},
stockBadgeTextOrder: {
  color: "#684013",
},
  stockDesc: {
    marginTop: 6,
    fontSize: 11,
    color: "#7B6C63",
  },
  chevron: {
    fontSize: 26,
    color: "#3A281F",
    marginLeft: 8,
  },

  emptyCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#E9DCD1",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#3A281F",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: "#8A7A70",
    textAlign: "center",
    lineHeight: 20,
  },
});