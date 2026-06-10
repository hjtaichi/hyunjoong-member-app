import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { useCart } from "../src/contexts/CartContext";
import { createProductOrder } from "../src/api/memberShop";
import { colors, radius, shadow } from "../src/theme";
import ScreenHeader from "../src/components/ScreenHeader";
const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};


const API_ORIGIN = "http://172.30.1.16:5000";

function formatPrice(value) {
  return `₩${Number(value || 0).toLocaleString("ko-KR")}`;
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_ORIGIN}${imageUrl}`;
}

export default function CartScreen() {
  const { token } = useAuth();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    totalPrice,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmitOrder() {
    if (items.length === 0 || submitting) return;

    try {
      setSubmitting(true);

      await createProductOrder(token, {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          memo: `${item.product.name} 주문 요청`,
        })),
        memo:
          items.length > 1
            ? `${items[0].product.name} 외 ${items.length - 1}개 주문 요청`
            : `${items[0].product.name} 주문 요청`,
      });

      clearCart();

      Alert.alert(
        "주문 요청 완료",
        "장바구니 상품의 주문 요청이 접수되었습니다.",
        [{ text: "확인", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("오류", error.message || "주문 요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="장바구니" />

      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>장바구니가 비어 있습니다.</Text>
          <Text style={styles.emptyText}>
            현중 Shop에서 필요한 물품을 담아주세요.
          </Text>

          <Pressable style={styles.shopButton} onPress={() => router.push("/shop")}>
            <Text style={styles.shopButtonText}>Shop으로 가기</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {items.map((item) => {
              const product = item.product;
              const imageSource = getImageUrl(product.imageUrl);

              return (
                <View key={product.id} style={styles.itemCard}>
                  <View style={styles.imageBox}>
                    {imageSource ? (
                      <Image source={{ uri: imageSource }} style={styles.image} />
                    ) : (
                      <Text style={styles.noImageText}>玄</Text>
                    )}
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {formatPrice(product.price)}
                    </Text>

                    <View style={styles.quantityRow}>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() =>
                          updateQuantity(product.id, item.quantity - 1)
                        }
                      >
                        <Text style={styles.qtyText}>−</Text>
                      </Pressable>

                      <Text style={styles.qtyNumber}>{item.quantity}</Text>

                      <Pressable
                        style={styles.qtyButton}
                        onPress={() =>
                          updateQuantity(product.id, item.quantity + 1)
                        }
                      >
                        <Text style={styles.qtyText}>＋</Text>
                      </Pressable>
                    </View>
                  </View>

                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeFromCart(product.id)}
                  >
                    <Text style={styles.removeText}>삭제</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>총 수량</Text>
              <Text style={styles.summaryValue}>{totalCount}개</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>예상 금액</Text>
              <Text style={styles.summaryPrice}>{formatPrice(totalPrice)}</Text>
            </View>

            <Pressable
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitOrder}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? "요청 중..." : "주문 요청하기"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: colors.background,
},

content: {
  paddingHorizontal: 16,
  paddingTop: 24,
  paddingBottom: 110,
  width: "100%",
  maxWidth: 430,
  alignSelf: "center",
},
  emptyCard: {
  marginTop: 18,
  borderRadius: radius.lg,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 22,
  paddingVertical: 28,
  alignItems: "center",
  ...shadow.card,
},

emptyTitle: {
  fontSize: 17,
  lineHeight: 25,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

emptyText: {
  marginTop: 8,
  fontSize: 14,
  lineHeight: 22,
  fontFamily: fonts.medium,
  color: colors.textSub,
  textAlign: "center",
},

shopButton: {
  marginTop: 18,
  minHeight: 48,
  borderRadius: radius.md,
  backgroundColor: colors.warmBrown,
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
},

shopButtonText: {
  color: colors.white,
  fontSize: 14,
  fontFamily: fonts.bold,
},

  list: {
  marginTop: 18,
  gap: 12,
},

itemCard: {
  flexDirection: "row",
  alignItems: "center",
  borderRadius: radius.lg,
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 13,
  ...shadow.card,
},

imageBox: {
  width: 82,
  height: 82,
  borderRadius: 16,
  backgroundColor: "#F1E4D9",
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
},
  image: { width: "100%", height: "100%" },
  noImageText: {
  fontSize: 26,
  fontFamily: fonts.bold,
  color: "#B89A7A",
},
  itemInfo: { flex: 1, marginLeft: 13 },
 itemName: {
  fontSize: 16,
  lineHeight: 23,
  fontFamily: fonts.bold,
  color: colors.textMain,
},
  itemPrice: {
  marginTop: 4,
  fontSize: 15,
  lineHeight: 22,
  fontFamily: fonts.bold,
  color: colors.textMain,
},
  quantityRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyButton: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: "#F8F1EA",
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
},

qtyText: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.warmBrown,
},

qtyNumber: {
  minWidth: 22,
  textAlign: "center",
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.textMain,
},
  removeButton: { paddingHorizontal: 8, paddingVertical: 8 },
removeText: {
  fontSize: 12,
  fontFamily: fonts.semiBold,
  color: colors.danger,
},

  summaryCard: {
  marginTop: 18,
  borderRadius: radius.lg,
  backgroundColor: "#F8F1EA",
  borderWidth: 1,
  borderColor: colors.border,
  padding: 18,
  ...shadow.card,
},
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
  fontSize: 14,
  fontFamily: fonts.medium,
  color: colors.textSub,
},

summaryValue: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

summaryPrice: {
  fontSize: 18,
  fontFamily: fonts.bold,
  color: colors.textMain,
},

submitButton: {
  marginTop: 10,
  height: 54,
  borderRadius: radius.md,
  backgroundColor: colors.warmBrown,
  alignItems: "center",
  justifyContent: "center",
},
  submitButtonDisabled: { opacity: 0.75 },
submitButtonText: {
  color: colors.white,
  fontSize: 15,
  fontFamily: fonts.bold,
},
});