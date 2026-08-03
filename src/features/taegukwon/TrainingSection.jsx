import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

export default function TrainingSection({
  styles,
  personalProgress,
  personalProgressPercent,
  isYudanjaMember,
  hasPrivateLessonMenu,
  privateLessonMenuTitle,
  privateLessonMenuDesc,
}) {
  return (
    <View style={styles.trainingSection}>
      <Text style={styles.sectionLabel}>현재 수련</Text>

      <View style={styles.coachingInlineBox}>
        <Image
          source={require("../../../assets/images/training-tip-title.png")}
          style={styles.coachingTipTitleImage}
          resizeMode="contain"
        />

        <Text style={styles.coachingInlineText} numberOfLines={2}>
          {personalProgress?.recentAdminMemos?.[0]?.content ||
            "아직 등록된 수련 Tip이 없습니다."}
        </Text>
      </View>

      <View style={[styles.card, styles.trainingCard]}>
        <View style={styles.cardTopActionRow}>
          <TouchableOpacity
            style={styles.detailButton}
            activeOpacity={0.85}
            onPress={() => {
              if (!personalProgress?.curriculumId) {
                Alert.alert("안내", "아직 등록된 개인 진도 정보가 없습니다.");
                return;
              }

              router.push({
                pathname: "/taegukwon/[curriculumId]",
                params: {
                  curriculumId: personalProgress.curriculumId,
                  name: personalProgress.curriculumName || "수련 과정",
                  currentStep: String(personalProgress.currentStep || 0),
                  totalSteps: String(personalProgress.totalSteps || 0),
                  source: "personal",
                },
              });
            }}
          >
            <Text style={styles.detailTextButton}>자세히 보기 </Text>
          </TouchableOpacity>
        </View>

        {personalProgress ? (
          <View style={styles.trainingHeroRow}>
            <View style={styles.trainingHeroLeft}>
              <Text style={styles.personalName}>
                {personalProgress.curriculumName || "등록된 투로 없음"}
              </Text>

              <Text style={styles.bigProgressText}>
                {personalProgress.currentStep || 0} /{" "}
                {personalProgress.totalSteps || 0}식
              </Text>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>진행률</Text>

                <View style={styles.progressBarRow}>
                  <View style={styles.progressTrackInline}>
                    <View
                      style={[
                        styles.progressFillPersonal,
                        { width: `${personalProgressPercent}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.progressPercentInline}>
                    {personalProgressPercent}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.trainingSilhouetteWrap}>
              <Image
                source={require("../../../assets/images/taichi-silhouette2.png")}
                style={styles.trainingSilhouette}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.cardText}>
              아직 등록된 개인 진도 정보가 없습니다.
            </Text>
            <Text style={styles.cardText}>
              개인 진도가 입력되면 여기에 표시됩니다.
            </Text>
          </>
        )}
      </View>

      <View style={[styles.card, styles.menuCard]}>
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.85}
          onPress={() => router.push("/training-journey")}
        >
          <Image
            source={require("../../../assets/images/menu-curriculum.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>수련 과정</Text>
            <Text style={styles.menuDesc}>커리큘럼 보기</Text>
          </View>

          <Text style={styles.menuArrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.85}
          onPress={() => router.push("/coaching-videos")}
        >
          <Image
            source={require("../../../assets/images/menu-video.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>내 수련 영상 올리기</Text>
            <Text style={styles.menuDesc}>실전 코칭</Text>
          </View>

          <Text style={styles.menuArrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.85}
          onPress={() => router.push("/movement-dictionary")}
        >
          <Image
            source={require("../../../assets/images/menu-dictionary.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>투로명이 궁금해요</Text>
            <Text style={styles.menuDesc}>동작 설명 및 포인트</Text>
          </View>

          <Text style={styles.menuArrow}>〉</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuRow, !isYudanjaMember && styles.menuRowLocked]}
          activeOpacity={0.85}
          onPress={() => {
            if (!isYudanjaMember) {
              Alert.alert("안내", "유단자 전용 콘텐츠입니다.");
              return;
            }

            router.push("/yudanja");
          }}
        >
          <Image
            source={require("../../../assets/images/menu-yudanja.png")}
            style={[styles.menuIcon, styles.menuYudanjaIcon]}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>유단자 전용</Text>
            <Text style={styles.menuDesc}>유단자 전용 콘텐츠</Text>
          </View>

          {isYudanjaMember ? (
            <Text style={styles.menuArrow}>〉</Text>
          ) : (
            <Image
              source={require("../../../assets/images/menu-lock.png")}
              style={styles.menuLockIcon}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuRow,
            styles.menuRowLast,
            !hasPrivateLessonMenu && styles.menuRowLocked,
          ]}
          activeOpacity={0.85}
          onPress={() => {
            if (!hasPrivateLessonMenu) return;
            router.push("/private-lessons");
          }}
        >
          <Image
            source={require("../../../assets/images/menu-private-training.png")}
            style={styles.menuIcon}
            resizeMode="contain"
          />

          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>{privateLessonMenuTitle}</Text>
            <Text style={styles.menuDesc}>
              {hasPrivateLessonMenu
                ? privateLessonMenuDesc
                : "개인지도 이용 회원 전용"}
            </Text>
          </View>

          {hasPrivateLessonMenu ? (
            <Text style={styles.menuArrow}>〉</Text>
          ) : (
            <Image
              source={require("../../../assets/images/menu-lock.png")}
              style={styles.menuLockIcon}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.privateGuideBanner}
        activeOpacity={0.88}
        onPress={() => router.push("/private-training-guide")}
      >
        <View>
          <Text style={styles.privateGuideBannerTitle}>개인지도 안내</Text>
          <Text style={styles.privateGuideBannerDesc}>
            1:1 자세교정과 심화 수련이 필요하다면 확인해보세요.
          </Text>
        </View>

        <Text style={styles.privateGuideBannerArrow}>〉</Text>
      </TouchableOpacity>
    </View>
  );
}