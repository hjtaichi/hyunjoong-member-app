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
    headerShown: false,
  }}
/>

      <Stack.Screen
  name="schedule"
  options={{ headerShown: false }}
/>

      <Stack.Screen
        name="faq"
  options={{ headerShown: false }}
/>

      <Stack.Screen
        name="[roomId]"
  options={{ headerShown: false }}
/>

    </Stack>
  );
}