export const colors = {
  // Base
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',

  // Text
  text: '#111827',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  // Brand
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primaryMuted: '#93C5FD',

  // Emergency
  danger: '#DC2626',
  dangerDark: '#B91C1C',
  dangerLight: '#FEF2F2',

  // Status
  success: '#16A34A',
  successLight: '#F0FDF4',

  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningDark: '#93370D',

  info: '#0891B2',
  infoLight: '#ECFEFF',

  // Incident status
  statusReported: '#6366F1',
  statusAcknowledged: '#2563EB',
  statusAssigned: '#7C3AED',
  statusResponding: '#D97706',
  statusOnSite: '#0891B2',
  statusResolved: '#059669',
  statusCancelled: '#6B7280',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Admin
  sidebar: '#0F172A',
  sidebarHover: '#1E293B',
  sidebarText: '#CBD5E1',
  sidebarActive: '#2563EB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  md: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  lg: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
};

export const breakpoints = {
  tablet: 600,   // iPad portrait, large phones in landscape, small tablets
  desktop: 1024, // laptops, desktops, iPad landscape and larger
};
