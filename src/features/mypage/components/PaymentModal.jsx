import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
} from "react-native";

import { mypageImages } from "../mypageImages";

export default function PaymentModal({
  visible,
  onClose,
  styles,

  accountCopied,

  PAYMENT_ACCOUNT_DISPLAY_TEXT,

  handleCopyAccount,
  handleOpenSeoulPay,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
>
  <View style={styles.modalOverlay}>
    <View style={styles.paymentModalCard}>
      <Pressable
        style={styles.paymentModalCloseIcon}
        onPress={onClose}
        hitSlop={10}
      >
        <Text style={styles.paymentModalCloseIconText}>×</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.paymentModalContent}
      >
        <Text style={styles.paymentModalTitle}>회비 결제</Text>

        <Text style={styles.paymentModalDesc}>
          결제 후 관리자가 확인하면{"\n"}
          회비 상태가 납부 완료로 변경됩니다.
        </Text>

        <View style={styles.paymentMethodBox}>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentIconCircle}>
              <Image
  source={mypageImages.paymentBankIcon}
  style={styles.paymentIconImage}
  resizeMode="contain"
/>
            </View>

            <View style={styles.paymentMethodBody}>
  <View style={styles.paymentMethodTextWrap}>
    <Text style={styles.paymentMethodTitle}>계좌이체</Text>
    <Text style={styles.paymentMethodText}>
      {PAYMENT_ACCOUNT_DISPLAY_TEXT}
    </Text>
  </View>

  <Pressable
    style={styles.paymentMethodButton}
    onPress={handleCopyAccount}
  >
    <Text style={styles.paymentMethodButtonText}>
      계좌 정보 복사
    </Text>
  </Pressable>

  {accountCopied ? (
  <Text style={styles.copyCompleteText}>
    계좌 정보가 복사되었습니다.
  </Text>
) : null}
</View>
          </View>
        </View>

        <View style={styles.paymentMethodBox}>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentIconCircle}>
              <Image
  source={mypageImages.paymentSeoulPayIcon}
  style={styles.paymentIconImage}
  resizeMode="contain"
/>
            </View>

            <View style={styles.paymentMethodBody}>
  <View style={styles.paymentMethodTextWrap}>
    <Text style={styles.paymentMethodTitle}>
      서울Pay+ 비대면 결제
    </Text>
    <Text style={styles.paymentMethodText}>
      서울Pay+ 앱에서 비대면 결제 {"\n"} → 현중태극권 검색 → {"\n"}
      금액 입력 후 결제해주세요.
    </Text>
  </View>

  <Pressable
    style={styles.paymentMethodButton}
    onPress={handleOpenSeoulPay}
  >
    <Text style={styles.paymentMethodButtonText}>
      서울Pay+ 앱 열기
    </Text>
  </Pressable>
</View>
          </View>
        </View>

        <View style={styles.paymentMethodBox}>
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentIconCircle}>
              <Image
  source={mypageImages.paymentCardIcon}
  style={styles.paymentIconImage}
  resizeMode="contain"
/>
            </View>

            <View style={styles.paymentMethodBody}>
  <View style={styles.paymentMethodTextWrap}>
    <Text style={styles.paymentMethodTitle}>카드결제</Text>
    <Text style={styles.paymentMethodText}>
      신용카드 결제는 도장에서 직접 결제해주세요.
    </Text>
  </View>
</View>
          </View>
        </View>

        <Pressable
          style={styles.paymentCloseButton}
          onPress={onClose}
        >
          <Text style={styles.paymentCloseButtonText}>닫기</Text>
        </Pressable>
      </ScrollView>
    </View>
      </View>
    </Modal>
  );
}