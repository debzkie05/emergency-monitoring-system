import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    if (user.role === 'admin') {
      return <Redirect href="/(admin)" />;
    }

    return <Redirect href="/(user)" />;
  }

  return <Redirect href="/(auth)/login" />;
}