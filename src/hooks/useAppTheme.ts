
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  darkColors,
  lightColors,
} from '@/constants/themePalettes';

export function useAppTheme() {
  const systemScheme = useColorScheme();

  const themePreference = useSettingsStore(
    (state) => state.themePreference
  );

  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemScheme === 'dark');

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
    themePreference,
  };
}
