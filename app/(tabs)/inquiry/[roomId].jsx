import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../src/contexts/AuthContext";
import {
  getMemberInquiryDetail,
  sendMemberInquiryMessage,
} from "../../../src/api/memberInquiryDetail";
import { colors, radius, shadow } from "../../../src/theme";
import ScreenHeader from "../../../src/components/ScreenHeader";

const fonts = {
  medium: "PretendardMedium",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  titleSemi: "MaruBuriSemiBold",
};

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "오전" : "오후";
  hours = hours % 12 === 0 ? 12 : hours % 12;

  return `${y}.${m}.${d} ${period} ${hours}:${minutes}`;
}

function isMine(message, currentUser) {
  if (message?.isMine === true) return true;

  const currentUserId = currentUser?.userId || currentUser?.id;

  return (
    message?.senderUserId === currentUserId ||
    message?.senderId === currentUserId ||
    message?.userId === currentUserId ||
    message?.sender?.userId === currentUserId ||
    message?.sender?.id === currentUserId
  );
}

function getRoomStatusLabel(status) {
  if (status === "answered") return "답변완료";
  if (status === "open") return "진행중";
  if (status === "urgent") return "긴급";
  if (status === "closed") return "종료";
  return "확인중";
}

export default function InquiryDetailScreen() {
  const { roomId } = useLocalSearchParams();
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollRef = useRef(null);
  const roomStatusLabel = getRoomStatusLabel(room?.status);

  const loadDetail = useCallback(
    async ({ silent = false } = {}) => {
      if (!token || !roomId) return;

      try {
        if (!silent) setLoading(true);

        const result = await getMemberInquiryDetail(token, roomId);
        setRoom(result?.room || null);
        setMessages(Array.isArray(result?.messages) ? result.messages : []);
      } catch (error) {
        Alert.alert("오류", error.message || "문의 상세를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, roomId]
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDetail({ silent: true });
  }, [loadDetail]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const at = new Date(a.createdAt || 0).getTime();
      const bt = new Date(b.createdAt || 0).getTime();
      return at - bt;
    });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();

    if (!trimmed) {
      Alert.alert("안내", "문의 내용을 입력해주세요.");
      return;
    }

    try {
      setSending(true);

      await sendMemberInquiryMessage(token, roomId, trimmed);
      setInput("");
      await loadDetail({ silent: true });

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert("오류", error.message || "메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  }, [input, token, roomId, loadDetail]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>문의 내용을 불러오는 중입니다.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.content}>
        <ScreenHeader title="1:1 문의" />

        <View style={styles.infoCard}>
          <View style={styles.infoTopRow}>
            <Text style={styles.infoTitle}>문의 안내</Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{roomStatusLabel}</Text>
            </View>
          </View>

          <Text style={styles.headerSubtitle}>
            운영시간 외 문의는 관리자가 확인 후 순차적으로 답변드려요.
          </Text>

          <Text style={styles.headerMeta}>
            운영시간: 평일 오전 9시 ~ 오후 6시
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messageArea}
        contentContainerStyle={styles.messageContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {sortedMessages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>아직 등록된 메시지가 없습니다.</Text>
          </View>
        ) : (
          sortedMessages.map((message, index) => {
            const mine = isMine(message, user);

            return (
              <View
                key={message.id || index}
                style={[
                  styles.messageRow,
                  mine ? styles.messageRowMine : styles.messageRowOther,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    mine ? styles.messageBubbleMine : styles.messageBubbleOther,
                  ]}
                >
                  {!mine ? (
                    <Text style={styles.senderText}>
                      {message.senderName || "상대방"}
                    </Text>
                  ) : null}

                  <Text
                    style={[
                      styles.messageText,
                      mine && styles.messageTextMine,
                    ]}
                  >
                    {message.message || ""}
                  </Text>

                  <Text
                    style={[
                      styles.messageTime,
                      mine && styles.messageTimeMine,
                    ]}
                  >
                    {formatDateTime(message.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View
        style={[
          styles.inputBar,
          {
            bottom: keyboardHeight > 0 ? Math.max(keyboardHeight - 220, 0) : 0,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="문의 내용을 입력하세요"
          placeholderTextColor={colors.textSub}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          textAlignVertical="top"
        />

        <Pressable
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? "전송중" : "전송"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },

  infoTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  infoTitle: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: fonts.titleSemi,
    color: colors.textMain,
  },

  headerSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: colors.textMain,
    marginBottom: 6,
  },

  headerMeta: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F8F1EA",
    borderWidth: 1,
    borderColor: colors.border,
  },

  statusBadgeText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.warmBrown,
  },

  messageArea: {
    flex: 1,
  },

  messageContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 170,
    gap: 12,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  messageRow: {
    flexDirection: "row",
  },

  messageRowMine: {
    justifyContent: "flex-end",
  },

  messageRowOther: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  messageBubbleMine: {
    backgroundColor: colors.warmBrown,
    borderBottomRightRadius: 6,
  },

  messageBubbleOther: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },

  senderText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.textSub,
    marginBottom: 6,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.medium,
    color: colors.textMain,
  },

  messageTextMine: {
    color: colors.white,
  },

  messageTime: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textSub,
  },

  messageTimeMine: {
    color: "#F3ECE4",
  },

  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },

  input: {
    flex: 1,
    minHeight: 52,
    maxHeight: 120,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fonts.medium,
    color: colors.textMain,
  },

  sendButton: {
    height: 52,
    minWidth: 72,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.warmBrown,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.bold,
  },

  sendButtonDisabled: {
    opacity: 0.6,
  },
});