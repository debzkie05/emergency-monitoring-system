import { useIncidentStore } from '@/stores/incidentStore';
import { useUiStore } from '@/stores/uiStore';
import { useHydrated } from './useHydrated';

// True while saved incidents are still loading from the device (or while previewing skeletons).
export function useIncidentsLoading(): boolean {
  const hydrated = useHydrated(useIncidentStore);
  const preview = useUiStore((s) => s.previewSkeletons);
  return !hydrated || preview;
}
