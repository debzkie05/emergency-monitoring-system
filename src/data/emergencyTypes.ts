import type { EmergencyTypeInfo } from '../types';
import { colors } from '../constants/theme';

export const EMERGENCY_TYPES: EmergencyTypeInfo[] = [
  {
    id: 'medical',
    label: 'Medical Emergency',
    icon: 'medkit',
    color: colors.danger,
    description: 'Injury, illness, or medical assistance needed',
  },
  {
    id: 'fire',
    label: 'Fire',
    icon: 'flame',
    color: '#EF4444',
    description: 'Fire, smoke, or fire hazard detected',
  },
  {
    id: 'security',
    label: 'Security Threat',
    icon: 'shield',
    color: '#7C3AED',
    description: 'Suspicious activity or security concern',
  },
  {
    id: 'accident',
    label: 'Accident',
    icon: 'warning',
    color: colors.warning,
    description: 'Vehicle or physical accident',
  },
  {
    id: 'hazard',
    label: 'Safety Hazard',
    icon: 'alert-circle',
    color: '#F97316',
    description: 'Unsafe conditions or equipment',
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'ellipsis-horizontal-circle',
    color: colors.textSecondary,
    description: 'Other emergency situations',
  },
];
