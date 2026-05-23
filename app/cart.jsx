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
import { colors } from "../src/theme/colors";

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
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>장바구니</Text>

        <View style={styles.headerRight} />
      </View>

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
  container: { flex: 1, backgroundColor: colors.background || "#FFFCFA" },
  content: { paddingHorizontal: 18, paddingTop: 42, paddingBottom: 120 },
  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { width: 42, height: 42, justifyContent: "center" },
  backText: { fontSize: 38, color: "#2F2119", marginTop: -5 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#2F2119" },
  headerRight: { width: 42 },

  emptyCard: {
    marginTop: 26,
    borderRadius: 26,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#E9DCD1",
    padding: 28,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#3A281F" },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#7A6A61",
    textAlign: "center",
  },
  shopButton: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: "#3A281F",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shopButtonText: { color: "#fff", fontWeight: "800" },

  list: { marginTop: 18, gap: 12 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#E9DCD1",
    padding: 13,
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
  noImageText: { fontSize: 26, fontWeight: "900", color: "#B89A7A" },
  itemInfo: { flex: 1, marginLeft: 13 },
  itemName: { fontSize: 16, fontWeight: "800", color: "#241811" },
  itemPrice: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "800",
    color: "#2F2119",
  },
  quantityRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3E8DE",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 15, fontWeight: "900", color: "#3A281F" },
  qtyNumber: { minWidth: 20, textAlign: "center", fontWeight: "800" },
  removeButton: { paddingHorizontal: 8, paddingVertical: 8 },
  removeText: { fontSize: 12, color: "#9B5A4B", fontWeight: "700" },

  summaryCard: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: "#E9DCD1",
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 14, color: "#6F5C50" },
  summaryValue: { fontSize: 15, fontWeight: "800", color: "#2F2119" },
  summaryPrice: { fontSize: 18, fontWeight: "800", color: "#2F2119" },
  submitButton: {
    marginTop: 10,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#3A281F",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: { opacity: 0.75 },
  submitButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});