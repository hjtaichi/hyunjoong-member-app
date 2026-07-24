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
import { normalizeShopCategory } from "../src/features/shop/shopCategory";
import { colors, radius, shadow } from "../src/theme";
import ScreenHeader from "../src/components/ScreenHeader";
import { API_BASE_URL } from "../src/config/env";
const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

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
    desc: "식품, 굿즈 ",
    match: ["기타", "식품", "건강식품", "교재", "기념품", "굿즈", "티셔츠", "수건", "텀블러"],
  },
];

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

function getStockLabel(product) {
  if (product.stockStatus === "available") {
    return {
      label: "재고 있음",
      desc: "구매는 문의창 혹은 도장에서 관장님께 문의해주세요.",
      tone: "available",
    };
  }

  if (product.stockStatus === "unavailable") {
    return {
      label: "재고 없음",
      desc: "입고 여부는 관장님께 문의해주세요.",
      tone: "order",
    };
  }

  return {
    label: "문의 필요",
    desc: "자세한 상태는 관장님께 문의해주세요.",
    tone: "order",
  };
}

function getMainCategory(product) {
  return normalizeShopCategory(product?.category);
}

function ProductCard({ product }) {
  const stock = getStockLabel(product);
  const imageSource = getImageUrl(product.imageUrl);
  const category = getMainCategory(product);
  const priceLabel =
    formatProductPrice(product.price);

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
        <Text style={styles.productCategory}>{category}</Text>

        <View style={styles.nameRow}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>

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
        </View>

        {priceLabel ? (
          <Text style={styles.productPrice}>
            {priceLabel}
          </Text>
        ) : null}

        <Text style={styles.stockDesc}>{stock.desc}</Text>
      </View>
    </Pressable>
  );
}

function SmallProductCard({ product, badge }) {
  const imageSource = getImageUrl(product.imageUrl);
  const priceLabel =
    formatProductPrice(product.price);

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

      {priceLabel ? (
        <Text style={styles.smallPrice}>
          {priceLabel}
        </Text>
      ) : null}
      
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
  return [...products].slice(0, 5);
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
      <View style={styles.topContent}>
  <View style={styles.shopHeader}>
  <ScreenHeader title="현중 Shop" />
 <Pressable style={styles.cartButton} onPress={() => router.push("/cart")}>
    <Image
      source={require("../assets/images/icon-shop-cart.png")}
      style={styles.cartImage}
      resizeMode="contain"
    />
  </Pressable>
</View>

  <View style={styles.heroArea}>
  <Image
    source={require("../assets/images/shop-mountain-bg.png")}
    style={styles.heroBg}
    resizeMode="cover"
  />

  <Text style={styles.heroDesc}>
    수련에 필요한 도장 물품과 용품 안내
  </Text>

<Text style={styles.noticeText}>
  상품 구매는 문의창 혹은 도장에서 관장님께 문의해주세요.
</Text>
</View>
</View>

      {bestProducts.length > 0 ? (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>추천 상품</Text>
        <Text style={styles.sectionDesc}>도장에서 자주 찾는 수련용품</Text>
      </View>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
    >
      {bestProducts.map((product) => (
        <SmallProductCard
          key={product.id}
          product={product}
          badge="추천"
        />
      ))}
    </ScrollView>
  </View>
) : null}

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
        <SmallProductCard
          key={product.id}
          product={product}
          badge="NEW"
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
  paddingTop: 24,
  paddingBottom: 110,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},
topContent: {
  paddingHorizontal: 16,
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

heroArea: {
  marginTop: 6,
  minHeight: 128,
  paddingHorizontal: 16,
  paddingTop: 52,
  paddingBottom: 18,
  justifyContent: "flex-start",
  overflow: "hidden",
},

heroBg: {
  position: "absolute",
  right: -24,
  top: 4,
  width: "112%",
  height: 128,
  opacity: 0.42,
},

heroDesc: {
  fontSize: 16,
  lineHeight: 23,
  fontFamily: fonts.semiBold,
  color: colors.textMain,
},

noticeText: {
  marginTop: 3,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: fonts.medium,
  color: colors.textSub,
},
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
  paddingHorizontal: 16,
  marginBottom: 12,
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
},

sectionTitle: {
  fontSize: 18,
  lineHeight: 26,
  fontFamily: fonts.titleSemi,
  color: colors.textMain,
},

sectionDesc: {
  marginTop: 4,
  fontSize: 13,
  lineHeight: 20,
  fontFamily: fonts.medium,
  color: colors.textSub,
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
  borderRadius: radius.lg,
  padding: 10,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
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
  backgroundColor: colors.warmBrown,
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
  minHeight: 70,
  borderRadius: radius.lg,
  paddingHorizontal: 11,
  paddingVertical: 11,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: "row",
  alignItems: "center",
},

categoryCardActive: {
  backgroundColor: colors.warmBrown,
  borderColor: colors.warmBrown,
},

categoryImage: {
  width: 70,
  height: 70,
  marginRight: 10,
},

categoryTextBox: {
  flex: 1,
},

categoryTitle: {
  fontSize: 16,
  lineHeight: 21,
  fontFamily: fonts.bold,
  color: colors.textMain,
},
categoryTitleActive: {
  color: "#FFFFFF",
},

categoryDesc: {
  marginTop: 3,
  fontSize: 13,
  lineHeight: 16,
  fontFamily: fonts.medium,
  color: colors.textSub,
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
  borderRadius: radius.lg,
  padding: 13,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadow.card,
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
  productCategory: {
  fontSize: 12,
  lineHeight: 18,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

nameRow: {
  marginTop: 2,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
  productName: {
  flex: 1,
  fontSize: 18,
  lineHeight: 26,
  fontFamily: fonts.bold,
  color: colors.textMain,
},
  productPrice: {
  marginTop: 2,
fontSize: 18,
lineHeight: 26,
  fontFamily: fonts.bold,
  color: colors.textMain,
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
  marginTop: 8,
  fontSize: 13,
  lineHeight: 19,
  fontFamily: fonts.medium,
  color: colors.textSub,
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
},

cartImage: {
  width: 24,
  height: 24,
  opacity: 0.82,
},
productPriceMuted: {
  marginTop: 2,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: fonts.semiBold,
  color: colors.textSub,
},
});