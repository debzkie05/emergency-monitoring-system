import { useWindowDimensions } from 'react-native';
import { breakpoints } from '@/constants/theme';

export type DeviceClass = 'phone' | 'tablet' | 'desktop';

// One place that decides how the layout adapts. It reacts to window resizes and device rotation.
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const device: DeviceClass =
    width >= breakpoints.desktop ? 'desktop' : width >= breakpoints.tablet ? 'tablet' : 'phone';
  // Width of the app column: full width on phones, a readable column on bigger screens.
  const frameWidth = device === 'phone' ? width : Math.min(width, device === 'tablet' ? 760 : 960);
  return {
    width,
    height,
    device,
    isPhone: device === 'phone',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isLandscape: width > height,
    frameWidth,
    columns: frameWidth >= 640 ? 2 : 1,
  };
}
