import { colors } from '../constants/theme';
import type { IncidentStatus, CampusLocation } from '../types';

/**
 * Format an ISO date string for display
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format time only from ISO string
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format full date and time
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}, ${formatTime(isoString)}`;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: IncidentStatus): string {
  const map: Record<IncidentStatus, string> = {
    reported: colors.statusReported,
    acknowledged: colors.statusAcknowledged,
    assigned: colors.statusAssigned,
    responding: colors.statusResponding,
    on_site: colors.statusOnSite,
    resolved: colors.statusResolved,
    cancelled: colors.statusCancelled,
  };
  return map[status] || colors.textSecondary;
}

/**
 * Get status background color (light variant)
 */
export function getStatusBgColor(status: IncidentStatus): string {
  const map: Record<IncidentStatus, string> = {
    reported: '#EEF2FF',
    acknowledged: '#EFF6FF',
    assigned: '#F5F3FF',
    responding: '#FFFBEB',
    on_site: '#ECFEFF',
    resolved: '#ECFDF5',
    cancelled: '#F3F4F6',
  };
  return map[status] || '#F3F4F6';
}

/**
 * Format location for display
 */
export function formatLocation(location: CampusLocation): string {
  if (!location.building || location.building === 'Unknown') return 'Location pending';
  const parts = [location.building];
  if (location.room && location.room !== 'Unknown') {
    parts.push(location.room);
  }
  return parts.join(' - ');
}

/**
 * Format full location with floor
 */
export function formatLocationFull(location: CampusLocation): string {
  if (!location.building || location.building === 'Unknown') return 'Location pending';
  const parts = [location.building];
  if (location.floor && location.floor !== 'Unknown') parts.push(location.floor);
  if (location.room && location.room !== 'Unknown') parts.push(location.room);
  return parts.join('\n');
}

/**
 * Get emergency type icon color
 */
export function getEmergencyColor(type: string): string {
  const map: Record<string, string> = {
    medical: colors.danger,
    fire: '#EF4444',
    security: '#7C3AED',
    accident: colors.warning,
    hazard: '#F97316',
    other: colors.textSecondary,
  };
  return map[type] || colors.textSecondary;
}
