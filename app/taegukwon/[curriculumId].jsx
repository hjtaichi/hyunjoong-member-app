import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { movementForms } from "../../src/data/movementDictionary";

const fonts = {
  regular: "PretendardRegular",
  medium: "PretendardMedium",
  semi: "PretendardSemiBold",
  semiBold: "PretendardSemiBold",
  bold: "PretendardBold",
  title: "MaruBuriBold",
  titleSemi: "MaruBuriSemiBold",
  hanja: "ZhaoKai",
};

const CURRICULUM_STEP_MAP = {
  "현중태극권 29식": [
    { ko: "태극기세", hanja: "太極起勢" },
    { ko: "금강도추", hanja: "金剛搗碓" },
    { ko: "나찰의", hanja: "懶扎衣" },
    { ko: "육봉사폐", hanja: "六封四閉" },
    { ko: "단편", hanja: "單鞭" },
    { ko: "야마분종", hanja: "野馬分鬃" },
    { ko: "중단편", hanja: "重單鞭" },
    { ko: "엄수굉추", hanja: "掩手肱捶" },
    { ko: "배절고", hanja: "背折靠" },
    { ko: "청룡출수", hanja: "靑龍出水" },
    { ko: "쌍추수", hanja: "雙推手" },
    { ko: "도권굉", hanja: "倒捲肱" },
    { ko: "백학양시", hanja: "白鶴亮翅" },
    { ko: "사행단편", hanja: "斜行單鞭" },
    { ko: "백사토신", hanja: "白蛇吐信" },
    { ko: "섬통배", hanja: "閃通背" },
    { ko: "주저간추", hanja: "肘底看捶" },
    { ko: "상보운수", hanja: "上步雲手" },
    { ko: "소금타", hanja: "小禽打" },
    { ko: "별신추", hanja: "撇身捶" },
    { ko: "회두망월", hanja: "回頭望月" },
    { ko: "고탐마", hanja: "高探馬" },
    { ko: "작지룡", hanja: "雀地龍" },
    { ko: "상보칠성", hanja: "上步七星" },
    { ko: "하보과호", hanja: "下步跨虎" },
    { ko: "전신파련", hanja: "轉身擺蓮" },
    { ko: "당두포", hanja: "當頭砲" },
    { ko: "금강도추", hanja: "金剛搗碓" },
    { ko: "태극환원", hanja: "太極還原" },
  ],
  "현중태극선 29식": [
  { ko: "기세", hanja: "起勢" },
  { ko: "금강도대", hanja: "金剛搗碓" },
  { ko: "사비식", hanja: "斜飛式" },
  { ko: "황봉입동", hanja: "黃蜂入洞" },
  { ko: "백학량시", hanja: "白鶴亮翅" },
  { ko: "나타탐해", hanja: "哪吒探海" },
  { ko: "이랑담산", hanja: "二郞擔山" },
  { ko: "력벽화산", hanja: "力劈華山" },
  { ko: "령묘포서", hanja: "靈猫捕鼠" },
  { ko: "좌마관화", hanja: "走馬觀花" },
  { ko: "추연릉공", hanja: "雛燕凌空" },
  { ko: "청룡입해", hanja: "靑龍入海" },
  { ko: "요자번신", hanja: "鷂子翻身" },
  { ko: "휘편책마", hanja: "揮鞭策馬" },
  { ko: "나한항룡", hanja: "羅漢降龍" },
  { ko: "야마분종", hanja: "野馬分鬃" },
  { ko: "소진배검", hanja: "蘇秦背劍" },
  { ko: "영풍료의", hanja: "迎風撩衣" },
  { ko: "당랑포선", hanja: "螳螂捕蟬" },
  { ko: "거정추산", hanja: "擧鼎推山" },
  { ko: "사비식", hanja: "斜飛式" },
  { ko: "맹호박식", hanja: "猛虎撲食" },
  { ko: "패왕양선", hanja: "覇王揚扇" },
  { ko: "용호상교", hanja: "龍虎相交" },
  { ko: "천녀산화", hanja: "天女散花" },
  { ko: "행보과문", hanja: "行步過門" },
  { ko: "패왕장기", hanja: "覇王掌旗" },
  { ko: "신룡회수", hanja: "神龍回首" },
  { ko: "수세", hanja: "收勢" },
],

"현중태극검 52식": [
  { ko: "태극검기세", hanja: "太極劍起勢" },
  { ko: "조양검", hanja: "朝陽劍" },
  { ko: "선인지로", hanja: "仙人指路" },
  { ko: "청룡출수", hanja: "靑龍出水" },
  { ko: "호슬검", hanja: "護膝劍" },
  { ko: "폐문검", hanja: "閉門劍" },
  { ko: "청룡출수", hanja: "靑龍出水" },
  { ko: "번신하벽검", hanja: "翻身下劈劍" },
  { ko: "청룡전신", hanja: "靑龍轉身" },
  { ko: "사비식", hanja: "斜飛式" },
  { ko: "전시점두", hanja: "展翅點頭" },
  { ko: "발초심사", hanja: "撥草尋蛇" },
  { ko: "금계독립", hanja: "金鷄獨立" },
  { ko: "선인지로", hanja: "仙人指路" },
  { ko: "회두망월", hanja: "回頭望月" },
  { ko: "개란식", hanja: "蓋攔式" },
  { ko: "고수반근", hanja: "枯樹盤根" },
  { ko: "아호박식", hanja: "餓虎撲食" },
  { ko: "유성간월", hanja: "流星趕月" },
  { ko: "도권굉", hanja: "倒捲肱" },
  { ko: "백원헌과", hanja: "白猿獻果" },
  { ko: "야마도간", hanja: "野馬跳澗" },
  { ko: "백사토신", hanja: "白蛇吐信" },
  { ko: "오룡파미", hanja: "烏龍擺尾" },
  { ko: "종규장검", hanja: "鍾馗仗劍" },
  { ko: "흑웅번배", hanja: "黑熊翻背" },
  { ko: "나한항룡", hanja: "羅漢降龍" },
  { ko: "연자흡니", hanja: "燕子吸泥" },
  { ko: "백사토신", hanja: "白蛇吐信" },
  { ko: "사비식", hanja: "斜飛式" },
  { ko: "웅응투지", hanja: "雄鷹鬥智" },
  { ko: "연자흡니", hanja: "燕子吸泥" },
  { ko: "적성환투", hanja: "摘星換鬥" },
  { ko: "해저로월", hanja: "海底撈月" },
  { ko: "선인지로", hanja: "仙人指路" },
  { ko: "봉황점두", hanja: "鳳凰點頭" },
  { ko: "연자흡니", hanja: "燕子吸泥" },
  { ko: "백사토신", hanja: "白蛇吐信" },
  { ko: "사비식", hanja: "斜飛式" },
  { ko: "우탁천근", hanja: "右托千斤" },
  { ko: "좌탁천근", hanja: "左托千斤" },
  { ko: "사응식", hanja: "斜鷹式" },
  { ko: "발운망월", hanja: "撥雲望月" },
  { ko: "낙화식", hanja: "落花式" },
  { ko: "옥녀완사", hanja: "玉女穿梭" },
  { ko: "상하사자", hanja: "上下斜子" },
  { ko: "나타탐해", hanja: "哪吒探海" },
  { ko: "괴망번신", hanja: "怪蟒翻身" },
  { ko: "연자천림", hanja: "燕子穿林" },
  { ko: "위타헌저", hanja: "韋駝獻杵" },
  { ko: "마반검", hanja: "磨盤劍" },
  { ko: "태극검귀원", hanja: "太極劍歸元" },
],

"현중태극권 대가1로 79식": [
  { ko: "태극기세", hanja: "太極起勢" },
  { ko: "금강도추", hanja: "金剛搗碓" },
  { ko: "나찰의", hanja: "懶扎衣" },
  { ko: "육봉사폐", hanja: "六封四閉" },
  { ko: "단편", hanja: "單鞭" },
  { ko: "금강도추", hanja: "金剛搗碓" },
  { ko: "백학양시", hanja: "白鶴亮翅" },
  { ko: "사행단편", hanja: "斜行單鞭" },
  { ko: "루슬", hanja: "摟膝" },
  { ko: "상삼보", hanja: "上三步" },
  { ko: "사행단편", hanja: "斜行單鞭" },
  { ko: "루슬", hanja: "摟膝" },
  { ko: "상삼보", hanja: "上三步" },
  { ko: "엄수굉권", hanja: "掩手肱拳" },
  { ko: "금강도추", hanja: "金剛搗碓" },
  { ko: "별신추", hanja: "撇身捶" },
  { ko: "배절고", hanja: "背折靠" },
  { ko: "청룡출수", hanja: "靑龍出水" },
  { ko: "쌍추수", hanja: "雙推手" },
  { ko: "주저추", hanja: "肘底捶" },
  { ko: "도권굉", hanja: "倒捲肱" },
  { ko: "백학양시", hanja: "白鶴亮翅" },
  { ko: "사행단편", hanja: "斜行單鞭" },
  { ko: "섬통배", hanja: "閃通背" },
  { ko: "엄수굉권", hanja: "掩手肱拳" },
  { ko: "육봉사폐", hanja: "六封四閉" },
  { ko: "단편", hanja: "單鞭" },
  { ko: "운수", hanja: "運手" },
  { ko: "고탐마", hanja: "高探馬" },
  { ko: "우좌찰각", hanja: "右左擦脚" },
  { ko: "좌등일근", hanja: "左蹬一根" },
  { ko: "단편", hanja: "單鞭" },
  { ko: "금사두령", hanja: "金獅抖鈴" },
  { ko: "전당요보", hanja: "前趟拗步" },
  { ko: "격지추", hanja: "擊地錘" },
  { ko: "척이기", hanja: "踢二起" },
  { ko: "호심권", hanja: "護心拳" },
  { ko: "선풍각", hanja: "旋風脚" },
  { ko: "우등일근", hanja: "右蹬一根" },
  { ko: "벽가자", hanja: "劈架子" },
  { ko: "엄수굉권", hanja: "掩手肱拳" },
  { ko: "소금타", hanja: "小擒打" },
  { ko: "포두추산", hanja: "抱頭推山" },
  { ko: "육봉사폐", hanja: "六封四閉" },
  { ko: "단편", hanja: "單鞭" },
  { ko: "전초후초", hanja: "前招後招" },
  { ko: "야마분종", hanja: "野馬分鬃" },
  { ko: "육봉사폐", hanja: "六封四閉" },
  { ko: "단편", hanja: "單鞭" },
  { ko: "쌍진각", hanja: "雙震脚" },
  { ko: "옥녀천사", hanja: "玉女穿梭" },
  { ko: "나찰의", hanja: "懶扎衣" },
  { ko: "육봉사폐", hanja: "六封四閉" },
  { ko: "단편", hanja: "單鞭" },
  { ko: "운수", hanja: "運手" },
  { ko: "파련질차", hanja: "擺蓮跌岔" },
  { ko: "금계독립", hanja: "金鷄獨立" },
  { ko: "도권굉", hanja: "倒捲肱" },
  { ko: "백학양시", hanja: "白鶴亮翅" },
  { ko: "사행단편", hanja: "斜行單鞭" },
  { ko: "섬통배", hanja: "閃通背" },
  { ko: "엄수굉권", hanja: "掩手肱拳" },
  { ko: "육봉사폐", hanja: "六封四閉" },
  { ko: "단편", hanja: "單鞭" },
  { ko: "운수", hanja: "運手" },
  { ko: "고탐마", hanja: "高探馬" },
  { ko: "십자각", hanja: "十字脚" },
  { ko: "전포추", hanja: "全炮捶" },
  { ko: "지당추", hanja: "指襠捶" },
  { ko: "백원헌과", hanja: "白猿獻果" },
  { ko: "육봉사폐", hanja: "六封四閉" },
  { ko: "단편", hanja: "單鞭" },
  { ko: "작지룡", hanja: "雀地龍" },
  { ko: "상보칠성", hanja: "上步七星" },
  { ko: "하보과호", hanja: "下步跨虎" },
  { ko: "전신파련", hanja: "轉身擺蓮" },
  { ko: "당두포", hanja: "當頭砲" },
  { ko: "금강도추", hanja: "金剛搗碓" },
  { ko: "태극환원", hanja: "太極還原" },
],
};
const MOVEMENT_FORM_TITLE_MAP = {
  "현중태극권 29식": "현중태극권 29식",
  "현중태극선 29식": "현중태극선 29식",
  "현중태극검 52식": "현중태극검 52식",
  "현중태극권 대가1로 79식": "현중태극권 대가1로",
  "현중태극단도 24식": "현중태극단도",
  "현중태극권 대가2로 62식": "현중태극권 대가2로",
};

function getCurriculumSteps(name) {
  const mappedTitle = MOVEMENT_FORM_TITLE_MAP[name] || name;

  const movementForm = movementForms.find(
    (form) => form.title === mappedTitle
  );

  if (movementForm?.movements?.length) {
    return movementForm.movements.map((item) => ({
      ko: item.name,
      hanja: item.hanja,
    }));
  }

  return CURRICULUM_STEP_MAP[name] || [];
}
export default function TaegukwonCurriculumDetailScreen() {
  const params = useLocalSearchParams();

  const curriculumId = String(params.curriculumId || "");
  const name = String(params.name || "");
  const currentStep = Number(params.currentStep || 0);
  const totalSteps = Number(params.totalSteps || 0);
  const source = String(params.source || "personal");
  const startStep = Number(params.startStep || 0);
const endStep = Number(params.endStep || 0);
const isGroupSource = source === "group";

const steps = useMemo(() => {
  return getCurriculumSteps(name);
}, [name]);

  const effectiveTotalSteps = totalSteps || steps.length || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
  <Text style={styles.backButton} onPress={() => router.back()}>
    ‹
  </Text>

  <View style={styles.topTitleRow}>
    <Text style={styles.topTitle}>수련 상세</Text>

  </View>
</View>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>
          {source === "group" ? "도장 단체 진도" : "내 수련 투로"}
        </Text>
        <Text style={styles.title}>{name || "투로 상세"}</Text>
        <Text style={styles.subTitle}>
  
</Text>

        {isGroupSource && startStep > 0 && endStep > 0 ? (
  <View style={styles.currentStepBox}>
    <Text style={styles.currentStepLabel}>이번 주 수련</Text>
    <Text style={styles.currentStepName}>
      {startStep}식 ~ {endStep}식
    </Text>
  </View>
) : currentStep > 0 && steps[currentStep - 1] ? (
  <View style={styles.currentStepBox}>
    <Text style={styles.currentStepLabel}>현재 배우는 식</Text>
    <Text style={styles.currentStepName}>
      {currentStep}식 · {steps[currentStep - 1].ko}
      {!!steps[currentStep - 1].hanja ? (
        <Text style={styles.currentStepHanjaInline}>
          {" "}{steps[currentStep - 1].hanja}
        </Text>
      ) : null}
    </Text>
  </View>
) : null}
      </View>

      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>투로 순서</Text>

        {steps.length > 0 ? (
          steps.map((stepItem, index) => {
  const stepNo = index + 1;
const isCurrent = !isGroupSource && currentStep === stepNo;
const isDone = !isGroupSource && currentStep > stepNo;
const isUpcoming = !isGroupSource && currentStep < stepNo;
  const isGroupCurrent =
  isGroupSource &&
  startStep > 0 &&
  endStep > 0 &&
  stepNo >= startStep &&
  stepNo <= endStep;

  return (
    <View
      key={`${name}-${stepNo}`}
      style={[
        styles.stepRow,
        isCurrent && styles.stepRowCurrent,
        isDone && styles.stepRowDone,
        isGroupCurrent && styles.stepRowGroupCurrent,
      ]}
    >
      <View
        style={[
          styles.stepNoBadge,
          isCurrent && styles.stepNoBadgeCurrent,
          isDone && styles.stepNoBadgeDone,
          isUpcoming && styles.stepNoBadgeUpcoming,
          isGroupCurrent && styles.stepNoBadgeGroupCurrent,
        ]}
      >
        <Text
          style={[
            styles.stepNoText,
            isCurrent && styles.stepNoTextCurrent,
            isDone && styles.stepNoTextDone,
          ]}
        >
          {stepNo}
        </Text>
      </View>

      <View style={styles.stepTextWrap}>
        <Text
  style={[
    styles.stepName,
    isCurrent && styles.stepNameCurrent,
    isDone && styles.stepNameDone,
    isGroupCurrent && styles.stepNameGroupCurrent,
  ]}
>
  {stepItem.ko}
  {!!stepItem.hanja ? (
    <Text
      style={[
  styles.stepNameHanjaInline,
  isCurrent && styles.stepNameHanjaInlineCurrent,
  isDone && styles.stepNameHanjaInlineDone,
  isGroupCurrent && styles.stepNameHanjaInlineGroupCurrent,
]}
    >
      {" "}{stepItem.hanja}
    </Text>
  ) : null}
</Text>

{isGroupSource ? (
  isGroupCurrent ? (
    <Text style={styles.stepStateText}>이번 주 수련</Text>
  ) : null
) : (
  <Text style={styles.stepStateText}>
    {isCurrent
      ? "현재 배우는 식"
      : isDone
      ? "이미 배운 식"
      : "앞으로 배울 식"}
  </Text>
)}
      </View>
    </View>
  );
})
        ) : (
          <Text style={styles.emptyText}>
            아직 이 투로의 식 목록 데이터가 없습니다.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f3ee",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#fffdf9",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  eyebrow: {
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: "#7a6f61",
  marginBottom: 8,
},

title: {
  fontSize: 26,
  fontFamily: fonts.title,
  color: "#2f2a24",
  marginBottom: 8,
},

subTitle: {
  fontSize: 15,
  fontFamily: fonts.semiBold,
  color: "#7c4f21",
  marginBottom: 5,
},
  currentStepBox: {
    backgroundColor: "#f7efe2",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ead7b8",
  },
  currentStepLabel: {
  fontSize: 13,
  fontFamily: fonts.semiBold,
  color: "#8a5a21",
  marginBottom: 6,
},

currentStepName: {
  fontSize: 20,
  fontFamily: fonts.titleSemi,
  color: "#5e3b13",
},
  listCard: {
    backgroundColor: "#fffdf9",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ece4d8",
  },
  sectionTitle: {
  fontSize: 18,
  fontFamily: fonts.titleSemi,
  color: "#2f2a24",
  marginBottom: 12,
},

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0e9de",
  },
  stepRowCurrent: {
    backgroundColor: "#f8fbff",
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  stepRowDone: {
    opacity: 0.95,
  },
  stepNoBadge: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNoBadgeCurrent: {
    backgroundColor: "#314E67",
  },
  stepNoBadgeDone: {
    backgroundColor: "#dfead9",
  },
  stepNoBadgeUpcoming: {
    backgroundColor: "#ede6db",
  },
  stepNoText: {
  fontSize: 15,
  fontFamily: fonts.bold,
  color: "#6b6257",
},
  stepNoTextCurrent: {
    color: "#ffffff",
  },
  stepNoTextDone: {
    color: "#4f7144",
  },
  stepTextWrap: {
    flex: 1,
  },
  stepName: {
  fontSize: 17,
  fontFamily: fonts.semiBold,
  color: "#2f2a24",
  marginBottom: 4,
},
  stepNameCurrent: {
    color: "#314E67",
  },
  stepNameDone: {
    color: "#4f7144",
  },
  stepStateText: {
  fontSize: 12,
  fontFamily: fonts.medium,
  color: "#7b7266",
},
  emptyText: {
    fontSize: 14,
    color: "#7b7266",
    lineHeight: 20,
  },
stepHanja: {
  fontSize: 13,
  color: "#7b7266",
  marginBottom: 4,
},

stepHanjaCurrent: {
  color: "#314E67",
  fontWeight: "600",
},

stepHanjaDone: {
  color: "#4f7144",
},

stepNameHanjaInline: {
  fontSize: 17,
  fontFamily: fonts.hanja,
  color: "#7b7266",
},


stepNameHanjaInlineCurrent: {
  color: "#314E67",
},

stepNameHanjaInlineDone: {
  color: "#4f7144",
},
currentStepHanjaInline: {
  fontSize: 18,
  fontFamily: fonts.hanja,
  color: "#8a5a21",
},
topHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 4,
},

backButton: {
  width: 28,
  fontSize: 30,
  lineHeight: 32,
  color: "#6b4f46",
  marginRight: 8,
},

topTitleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

topTitle: {
  fontSize: 20,
  fontFamily: fonts.title,
  color: "#2f2a24",
},

topSubTitle: {
  fontSize: 13,
  fontWeight: "700",
  color: "#7a6f61",
  marginTop: 2,
},
stepRowGroupCurrent: {
  backgroundColor: "#FFF4DD",
  borderRadius: 14,
  paddingHorizontal: 10,
},

stepNoBadgeGroupCurrent: {
  backgroundColor: "#C89E6A",
},

stepNameGroupCurrent: {
  color: "#8A5A1F",
},
stepNameHanjaInlineGroupCurrent: {
  color: "#8A5A1F",
},
});