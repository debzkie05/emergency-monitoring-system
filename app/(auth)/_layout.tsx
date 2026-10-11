import { Stack } from 'expo-router';
import { ResponsiveFrame } from '@/components/layout/ResponsiveFrame';

export default function AuthLayout() {
  return (
    <ResponsiveFrame>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    </ResponsiveFrame>
  );
}
