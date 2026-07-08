import React from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";

import { mypageImages } from "../mypageImages";

function YudanjaCard({
  isYudanja,
  isYudanjaBackVisible,
  handleFlipYudanjaCard,
  yudanjaFrontRotate,
  yudanjaBackRotate,
  styles,
}) {
  if (!isYudanja) return null;

  return (
    <Pressable
      onPress={handleFlipYudanjaCard}
      style={[
        styles.yudanjaFlipWrap,
        isYudanjaBackVisible
          ? styles.yudanjaFlipWrapBack
          : styles.yudanjaFlipWrapFront,
      ]}
    >
      <Animated.View
        style={[
          styles.yudanjaFlipFace,
          styles.yudanjaFrontFace,
          {
            transform: [{ rotateY: yudanjaFrontRotate }],
          },
        ]}
      >
        <ImageBackground
          source={mypageImages.yudanjaCardBg}
          style={styles.yudanjaCard}
          imageStyle={styles.yudanjaCardBgImage}
          resizeMode="cover"
        >
          <View style={styles.yudanjaOverlay} />

          <View style={styles.yudanjaTextWrap}>
            <Text style={styles.yudanjaYear}>2026.01.01 ~ 2026.12.31</Text>
            <Text style={styles.yudanjaTitle}>2026년 유단자회 회원</Text>
            <Text style={styles.yudanjaMemberNo}>No. YD-2026-001</Text>
          </View>

          <Image
            source={mypageImages.yudanjaIcon}
            style={styles.yudanjaIconImage}
            resizeMode="contain"
          />
        </ImageBackground>
      </Animated.View>

      <Animated.View
        style={[
          styles.yudanjaFlipFace,
          styles.yudanjaBackFace,
          {
            transform: [{ rotateY: yudanjaBackRotate }],
          },
        ]}
      >
        <Image
          source={mypageImages.yudanjaCardBackImage}
          style={styles.yudanjaBackImage}
          resizeMode="cover"
        />
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(YudanjaCard);