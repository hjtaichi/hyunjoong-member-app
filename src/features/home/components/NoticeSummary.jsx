import React from "react";
import { Pressable, Text, View } from "react-native";

import { styles } from "../homeStyles";

export default function NoticeSummary({
  noticeList,
  onMorePress,
  onNoticePress,
}) {
  return (
    <View style={styles.noticeSummaryCard}>
      <View style={styles.noticeSummaryHeader}>
        <Text style={styles.noticeSummaryTitle}>도장 소식</Text>

        <Pressable onPress={onMorePress}>
          <Text style={styles.noticeSummaryMore}>더보기</Text>
        </Pressable>
      </View>

      {noticeList.slice(0, 2).length === 0 ? (
        <Text style={styles.noticeSummaryEmpty}>
          등록된 소식이 없습니다.
        </Text>
      ) : (
        noticeList.slice(0, 2).map((notice) => (
          <Pressable
            key={notice.id}
            style={styles.noticeSummaryItem}
            onPress={() => onNoticePress(notice)}
          >
            <Text style={styles.noticeSummaryBullet}>•</Text>

            <Text
              style={styles.noticeSummaryText}
              numberOfLines={1}
            >
              {notice.title}
            </Text>

            <Text style={styles.noticeSummaryDate}>
              {String(notice.publishedAt || notice.createdAt || "")
                .slice(5, 10)
                .replace("-", ".")}
            </Text>
          </Pressable>
        ))
      )}
    </View>
  );
}