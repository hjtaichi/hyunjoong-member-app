import { Stack } from "expo-router";

export default function InquiryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="guide"
        options={{
          title: "수련 가이드",
          headerBackTitle: "뒤로",
        }}
      />

      <Stack.Screen
        name="schedule"
        options={{
          title: "수련 시간표",
          headerBackTitle: "뒤로",
        }}
      />

      <Stack.Screen
        name="faq"
        options={{
          title: "FAQ",
          headerBackTitle: "뒤로",
        }}
      />

      <Stack.Screen
        name="[roomId]"
        options={{
          title: "1:1 문의",
          headerBackTitle: "뒤로",
        }}
      />
    </Stack>
  );
}