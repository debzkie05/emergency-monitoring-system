import { Stack } from 'expo-router';

export default function LostFoundLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="report" />
    </Stack>
  );
}
