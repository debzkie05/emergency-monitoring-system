import { Stack } from 'expo-router';

export default function EmergencyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sent" />
      <Stack.Screen name="type" />
      <Stack.Screen name="location" />
      <Stack.Screen name="details" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
