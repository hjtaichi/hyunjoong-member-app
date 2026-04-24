import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../../src/contexts/AuthContext";
import {
  getMemberInquiryDetail,
  sendMemberInquiryMessage,
} from "../../../src/api/memberInquiryDetail";
import { Stack, useLocalSearchParams } from "expo-router";


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
  const roomStatusLabel = getRoomStatusLabel(room?.status);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
  const showEvent =
    Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
  const hideEvent =
    Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

  const showSub = Keyboard.addListener(showEvent, (e) => {
    setKeyboardHeight(e.endCoordinates?.height || 0);
  });

  const hideSub = Keyboard.addListener(hideEvent, () => {
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
  <>
    <Stack.Screen
      options={{
        title: "1:1 문의",
        headerRight: () => (
          <View style={styles.headerStatusBadge}>
            <Text style={styles.headerStatusBadgeText}>
              {roomStatusLabel}
            </Text>
          </View>
        ),
      }}
    />

    <View style={styles.keyboard}>
  <View style={styles.container}>
        <View style={styles.headerBlock}>
          <View style={styles.infoCard}>
            <Text style={styles.headerSubtitle}>
              운영시간 외 문의는 관리자가 확인 후 순차적으로 답변드려요.
            </Text>

            <Text style={styles.headerMeta}>
              운영시간: 평일 오전 9시 ~ 오후 6시
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.messageArea}
          contentContainerStyle={styles.messageContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {sortedMessages.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                아직 등록된 메시지가 없습니다.
              </Text>
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
                      mine
                        ? styles.messageBubbleMine
                        : styles.messageBubbleOther,
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
      bottom: keyboardHeight > 0 ? keyboardHeight + 45: 0
    },
  ]}
>
          <TextInput
            style={styles.input}
            placeholder="문의 내용을 입력하세요"
            placeholderTextColor="#8a7f72"
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
      </View>
    </View>
  </>
);
}

const styles = StyleSheet.create({
  keyboard: {
  flex: 1,
  backgroundColor: "#f6f3ee",
},
container: {
  flex: 1,
  backgroundColor: "#f6f3ee",
},
center: {
  flex: 1,
  backgroundColor: "#f6f3ee",
  alignItems: "center",
  justifyContent: "center",
},
loadingText: {
  marginTop: 10,
  fontSize: 14,
  color: "#6b6257",
},
infoCard: {
  backgroundColor: "#fffdf9",
  borderRadius: 16,
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: "#ece4d8",
},
  headerBlock: {
  paddingHorizontal: 20,
  paddingTop: 18,
  paddingBottom: 8,
},
headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
},
headerTitle: {
  fontSize: 30,
  fontWeight: "900",
  color: "#2f2a24",
},
headerSubtitle: {
  fontSize: 14,
  lineHeight: 21,
  color: "#6b6257",
  marginBottom: 6,
},
headerMeta: {
  fontSize: 13,
  color: "#8a7f72",
},
statusBadge: {
  alignSelf: "flex-start",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  backgroundColor: "#f3ecdf",
},
statusBadgeText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#8c6330",
},
messageArea: {
    flex: 1,
  },
 messageContent: {
  paddingHorizontal: 20,
  paddingTop: 14,
  paddingBottom: 120,
  gap: 12,
},
  emptyText: {
  textAlign: "center",
  fontSize: 14,
  color: "#6b6257",
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
  backgroundColor: "#9a6d35",
  borderBottomRightRadius: 6,
},
messageBubbleOther: {
  backgroundColor: "#fffdf9",
  borderBottomLeftRadius: 6,
  borderWidth: 1,
  borderColor: "#ece4d8",
},
  senderText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#6b6257",
  marginBottom: 6,
},
messageText: {
  fontSize: 15,
  lineHeight: 22,
  color: "#2f2a24",
},
  messageTextMine: {
  color: "#fffdf9",
},
messageTimeMine: {
  color: "#f3ecdf",
},
messageTime: {
  marginTop: 6,
  fontSize: 11,
  color: "#8a7f72",
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
  backgroundColor: "#f6f3ee",
  borderTopWidth: 1,
  borderTopColor: "#ece4d8",
  gap: 10,
},
input: {
  flex: 1,
  minHeight: 48,
  maxHeight: 120,
  backgroundColor: "#fffdf9",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#ece4d8",
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: "#2f2a24",
},
sendButton: {
  height: 48,
  minWidth: 76,
  paddingHorizontal: 18,
  borderRadius: 16,
  backgroundColor: "#8c6330",
  alignItems: "center",
  justifyContent: "center",
},
sendButtonText: {
  color: "#fffdf9",
  fontSize: 14,
  fontWeight: "800",
},
  sendButtonDisabled: {
    opacity: 0.6,
  },
  emptyWrap: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 40,
},
headerStatusBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: "#f3ecdf",
},
headerStatusBadgeText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#8c6330",
},
});