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

const SHOP_CATEGORIES = [
  {
    key: "도복·신발",
    icon: require("../assets/images/shop-category-dobok.png"),
    title: "도복·신발",
    desc: "도복, 태극권화",
    match: ["도복", "기성도복", "물실크", "여름마", "신소재", "비단", "태극권화", "신발"],
  },
  {
    key: "무기",
    icon: require("../assets/images/shop-category-weapon.png"),
    title: "무기",
    desc: "검, 부채, 단도",
    match: ["무기", "검", "부채", "단도", "도", "창두", "편간", "채찍", "팔각봉"],
  },
  {
    key: "수련용품",
    icon: require("../assets/images/shop-category-training.png"),
    title: "수련용품",
    desc: "수련 보조용품",
    match: ["수련용품", "폼롤러", "마사지볼", "탄력밴드", "명상방석"],
  },
  {
    key: "차",
    icon: require("../assets/images/shop-category-tea.png"),
    title: "차",
    desc: "보이차, 국화차",
    match: ["차", "보이생차", "보이숙차", "국화차", "고정차", "만리화차", "산사차"],
  },
  {
    key: "찻잔·도구",
    icon: require("../assets/images/shop-category-teaware.png"),
    title: "찻잔·도구",
    desc: "찻잔, 자사호",
    match: ["찻잔", "찻잔·도구", "차거름망", "자사호", "다기세트", "찻도구"],
  },
  {
    key: "기타",
    icon: require("../assets/images/shop-category-etc.png"),
    title: "기타",
    desc: "식품, 교재, 기념품",
    match: ["기타", "식품", "건강식품", "교재", "기념품", "굿즈", "티셔츠", "수건", "텀블러"],
  },
];

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

function getMainCategory(product) {
  const category = product?.category || "";

  const found = SHOP_CATEGORIES.find((item) =>
    item.match.some((word) => category.includes(word) || word.includes(category))
  );

  return found?.key || "기타";
}

function ProductCard({ product }) {
  const stock = getStockLabel(product);
  const imageSource = getImageUrl(product.imageUrl);

  return (
    <Pressable
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

        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

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
}

function SmallProductCard({ product, badge }) {
  const imageSource = getImageUrl(product.imageUrl);

  return (
    <Pressable
      style={styles.smallProductCard}
      onPress={() =>
        router.push({
          pathname: "/shop-detail",
          params: { productId: product.id },
        })
      }
    >
      <View style={styles.smallImageBox}>
        {imageSource ? (
          <Image
            source={{ uri: imageSource }}
            style={styles.smallImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.smallNoImage}>玄</Text>
        )}

        {badge ? (
          <View style={styles.smallBadge}>
            <Text style={styles.smallBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.smallName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.smallPrice}>{formatPrice(product.price)}</Text>
    </Pressable>
  );
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

  const bestProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0))
      .slice(0, 5);
  }, [products]);

  const newProducts = useMemo(() => {
    return [...products].slice(0, 5);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "전체") return products;
    return products.filter((item) => getMainCategory(item) === selectedCategory);
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

        <Pressable style={styles.cartIcon} onPress={() => router.push("/cart")}>
          <Image
            source={require("../assets/images/icon-shop-cart.png")}
            style={styles.cartImage}
            resizeMode="contain"
          />
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

      <View style={styles.noticeRow}>
        <Text style={styles.noticeIcon}>☆</Text>
        <Text style={styles.noticeText}>
          도장 회원만 구매 및 주문 문의가 가능합니다.
        </Text>
      </View>

      {bestProducts.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>BEST 상품</Text>
              <Text style={styles.sectionDesc}>많이 찾는 현중 수련용품</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {bestProducts.map((product, index) => (
              <SmallProductCard
                key={product.id}
                product={product}
                badge={`BEST ${index + 1}`}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <Text style={styles.sectionDesc}>필요한 물품을 쉽게 찾아보세요</Text>
          </View>

          {selectedCategory !== "전체" ? (
            <Pressable onPress={() => setSelectedCategory("전체")}>
              <Text style={styles.resetText}>전체보기</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.categoryGrid}>
          {SHOP_CATEGORIES.map((category) => {
            const selected = selectedCategory === category.key;

            return (
              <Pressable
  key={category.key}
  style={[
    styles.categoryCard,
    selected && styles.categoryCardActive,
  ]}
  onPress={() => setSelectedCategory(category.key)}
>
  <Image
    source={category.icon}
    style={styles.categoryImage}
    resizeMode="contain"
  />

  <View style={styles.categoryTextBox}>
    <Text
      style={[
        styles.categoryTitle,
        selected && styles.categoryTitleActive,
      ]}
    >
      {category.title}
    </Text>

    <Text
      style={[
        styles.categoryDesc,
        selected && styles.categoryDescActive,
      ]}
      numberOfLines={1}
    >
      {category.desc}
    </Text>
  </View>
</Pressable>
            );
          })}
        </View>
      </View>

      {newProducts.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>신상품</Text>
              <Text style={styles.sectionDesc}>새로 등록된 상품</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {newProducts.map((product) => (
              <SmallProductCard key={product.id} product={product} badge="NEW" />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {selectedCategory === "전체" ? "전체 상품" : selectedCategory}
            </Text>
            <Text style={styles.sectionDesc}>
              {filteredProducts.length}개의 상품이 있습니다
            </Text>
          </View>
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
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </View>
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
    paddingTop: 26,
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
    height: 10,
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
  cartIcon: {
    width: 42,
    height: 42,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  cartImage: {
    width: 26,
    height: 26,
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
    height: "80%",
    opacity: 0.7,
    marginTop: 40,
  },
  heroTextBox: {
    paddingHorizontal: 34,
    paddingTop: 12,
  },
  heroTitle: {
    fontSize: 33,
    fontWeight: "800",
    color: "#3A281F",
    letterSpacing: -0.5,
    marginTop: 20,
  },
  heroDesc: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    color: "#5F4A3D",
    fontWeight: "600",
  },

  noticeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 4,
    marginBottom: 18,
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

  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2F2119",
    letterSpacing: -0.3,
  },
  sectionDesc: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#7B6C63",
  },
  resetText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9A6A36",
  },

  horizontalList: {
    gap: 12,
    paddingHorizontal: 18,
  },
  smallProductCard: {
    width: 132,
    borderRadius: 22,
    padding: 10,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#E9DCD1",
  },
  smallImageBox: {
    height: 102,
    borderRadius: 17,
    backgroundColor: "#F1E4D9",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  smallImage: {
    width: "100%",
    height: "100%",
  },
  smallNoImage: {
    fontSize: 28,
    fontWeight: "900",
    color: "#B89A7A",
  },
  smallBadge: {
    position: "absolute",
    top: 7,
    left: 7,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#3A281F",
  },
  smallBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  smallName: {
    marginTop: 9,
    fontSize: 14,
    fontWeight: "800",
    color: "#2F2119",
  },
  smallPrice: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
    color: "#76564B",
  },

  categoryGrid: {
  paddingHorizontal: 18,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
},

categoryCard: {
  width: "48%",
  minHeight: 82,
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 12,
  backgroundColor: "#FFFDF9",
  borderWidth: 1,
  borderColor: "#E9DCD1",
  flexDirection: "row",
  alignItems: "center",
},

categoryCardActive: {
  backgroundColor: "#3A281F",
  borderColor: "#3A281F",
},

categoryImage: {
  width: 42,
  height: 42,
  marginRight: 10,
},

categoryTextBox: {
  flex: 1,
},

categoryTitle: {
  fontSize: 16,
  fontWeight: "900",
  color: "#2F2119",
},

categoryTitleActive: {
  color: "#FFFFFF",
},

categoryDesc: {
  marginTop: 4,
  fontSize: 11,
  lineHeight: 15,
  fontWeight: "600",
  color: "#7B6C63",
},

categoryDescActive: {
  color: "#EADFD6",
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
    fontWeight: "700",
    color: "#241811",
    letterSpacing: -0.2,
  },
  productPrice: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "700",
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
    fontSize: 13,
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