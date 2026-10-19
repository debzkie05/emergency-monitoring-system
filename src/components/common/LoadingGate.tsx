import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useDelayedFlag } from '@/hooks/useDelayedFlag';
import { useUiStore } from '@/stores/uiStore';

interface LoadingGateProps {
  loading: boolean;
  fallback: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

// Shows the real content when ready. While loading it shows the skeleton, but only if
// loading lasts longer than a blink, so fast loads never flash a skeleton.
export function LoadingGate({ loading, fallback, containerStyle, children }: LoadingGateProps) {
  const previewing = useUiStore((s) => s.previewSkeletons);
  const showFallback = useDelayedFlag(loading, previewing ? 0 : 150);
  if (!loading) return <>{children}</>;
  if (!showFallback) return null;
  return (
    <View
      accessible
      accessibilityLabel="Loading content"
      accessibilityState={{ busy: true }}
      style={[{ width: '100%' }, containerStyle]}
    >
      {fallback}
    </View>
  );
}
