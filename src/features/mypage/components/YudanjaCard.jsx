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
import { getYudanjaCardTheme } from "../yudanjaCardPolicy";

function YudanjaCard({
  isYudanja,
  yudanjaMembership,
  isYudanjaBackVisible,
  handleFlipYudanjaCard,
  yudanjaFrontRotate,
  yudanjaBackRotate,
  styles,
}) {
  if (!isYudanja) return null;

  const fallbackYear = new Date().getFullYear();
  const membershipYear = Number(yudanjaMembership?.year) || fallbackYear;
  const theme = getYudanjaCardTheme(membershipYear);

  const frontSource =
    mypageImages.yudanjaCardFrontByTheme?.[theme] ||
    mypageImages.yudanjaCardBg;

  const backSource =
    mypageImages.yudanjaCardBackByTheme?.[theme] ||
    mypageImages.yudanjaCardBackImage;

  const periodText = `${membershipYear}.01.01 ~ ${membershipYear}.12.31`;
  const titleText = `${membershipYear}\uB144 \uC720\uB2E8\uC790\uD68C \uD68C\uC6D0`;
  const memberNoText = yudanjaMembership?.memberNo
    ? `No. ${yudanjaMembership.memberNo}`
    : "No. \uBC1C\uAE09 \uC815\uBCF4 \uD655\uC778 \uD544\uC694";
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
          source={frontSource}
          style={styles.yudanjaCard}
          imageStyle={styles.yudanjaCardBgImage}
          resizeMode="cover"
        >
          <View style={styles.yudanjaOverlay} />

          <View style={styles.yudanjaTextWrap}>
            <Text style={styles.yudanjaYear}>{periodText}</Text>
            <Text style={styles.yudanjaTitle}>{titleText}</Text>
            <Text style={styles.yudanjaMemberNo}>{memberNoText}</Text>
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
          source={backSource}
          style={styles.yudanjaBackImage}
          resizeMode="cover"
        />
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(YudanjaCard);