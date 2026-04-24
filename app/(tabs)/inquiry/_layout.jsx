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
        name="[roomId]"
        options={{
          title: "1:1 문의",
          headerBackTitle: "뒤로",
        }}
      />
    </Stack>
  );
}