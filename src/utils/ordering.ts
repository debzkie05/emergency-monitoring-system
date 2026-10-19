import type { Incident, Severity } from '../types';
import { getIncidentSeverity, SEVERITY_CONFIG } from './severity';

/**
 * Get real linked reports count safely. Never invents counts.
 * If linked reports array exists and has entries, returns its length.
 * Otherwise returns 1 (representing the initial incident report itself).
 */
export function getReportCount(incident: Partial<Incident>): number {
  if (incident.reports && Array.isArray(incident.reports) && incident.reports.length > 0) {
    return incident.reports.length;
  }
  return 1;
}

/**
 * Safely parse ISO timestamp to unix ms.
 * If missing, undefined or invalid, returns current time (or 0 if fallback).
 */
export function safeGetTimestamp(isoString?: string | null): number {
  if (!isoString) return Number.MAX_SAFE_INTEGER;
  const time = new Date(isoString).getTime();
  return isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

/**
 * Calculate waiting time in milliseconds.
 * - For unacknowledged alerts (status === 'reported'): time elapsed from createdAt to nowMs (ticks live).
 * - For acknowledged alerts (status !== 'reported'): frozen at the duration between createdAt and acknowledgment timestamp.
 */
export function getWaitingTimeMs(
  incidentOrCreatedAt?: Partial<Incident> | string | null,
  nowMs: number = Date.now()
): number {
  if (!incidentOrCreatedAt) return 0;

  // If passed an incident object
  if (typeof incidentOrCreatedAt === 'object') {
    const created = safeGetTimestamp(incidentOrCreatedAt.createdAt);
    if (created === Number.MAX_SAFE_INTEGER) return 0;

    // If acknowledged or beyond reported status, freeze waiting time at acknowledgment timestamp
    if (incidentOrCreatedAt.status && incidentOrCreatedAt.status !== 'reported') {
      let ackTime = safeGetTimestamp(incidentOrCreatedAt.updatedAt);
      if (incidentOrCreatedAt.statusHistory && incidentOrCreatedAt.statusHistory.length > 0) {
        const ackEntry = incidentOrCreatedAt.statusHistory.find((s) => s.status === 'acknowledged');
        if (ackEntry) {
          ackTime = safeGetTimestamp(ackEntry.timestamp);
        }
      }
      if (ackTime !== Number.MAX_SAFE_INTEGER && ackTime >= created) {
        return Math.max(0, ackTime - created);
      }
    }

    return Math.max(0, nowMs - created);
  }

  // Fallback for raw ISO string
  const created = safeGetTimestamp(incidentOrCreatedAt);
  if (created === Number.MAX_SAFE_INTEGER) return 0;
  return Math.max(0, nowMs - created);
}

/**
 * Format waiting time as MM:SS string (e.g., "02:03" or "00:42")
 */
export function formatWaitingTime(
  incidentOrCreatedAt?: Partial<Incident> | string | null,
  nowMs: number = Date.now()
): string {
  const ms = getWaitingTimeMs(incidentOrCreatedAt, nowMs);
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Returns 'waiting' if still unacknowledged, or 'waited' once acknowledged
 */
export function getWaitingSublabel(incident?: Partial<Incident> | null): string {
  if (!incident || !incident.status || incident.status === 'reported') {
    return 'waiting';
  }
  return 'waited';
}

/**
 * Single pure sorting function used across:
 * - Banner
 * - Live Incidents list
 * - Alert Queue panel
 * - Siren selection controller
 * - Priority indicators
 *
 * Sort Order:
 * 1. Severity: Critical (3) > High (2) > Moderate (1)
 * 2. Longest waiting time: Oldest createdAt timestamp comes first (ascending timestamp ms)
 * 3. Report count: Higher linked report count comes first (descending)
 * 4. Incident ID: Deterministic alphabetical tie-breaker (ascending)
 */
export function sortIncidentsForQueue<T extends Partial<Incident>>(incidents: T[]): T[] {
  return [...incidents].sort((a, b) => {
    // 1. Severity weight (higher comes first)
    const sevA: Severity = getIncidentSeverity(a);
    const sevB: Severity = getIncidentSeverity(b);
    const weightA = SEVERITY_CONFIG[sevA]?.weight ?? 0;
    const weightB = SEVERITY_CONFIG[sevB]?.weight ?? 0;

    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // 2. Longest waiting (oldest timestamp comes first => smaller ms number)
    const timeA = safeGetTimestamp(a.createdAt);
    const timeB = safeGetTimestamp(b.createdAt);

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // 3. More linked reports (higher count comes first)
    const countA = getReportCount(a);
    const countB = getReportCount(b);

    if (countA !== countB) {
      return countB - countA;
    }

    // 4. Incident ID tie-breaker
    const idA = a.id || '';
    const idB = b.id || '';
    return idA.localeCompare(idB);
  });
}

/**
 * Select the top critical incident eligible for siren playback.
 * Must be unacknowledged (status === 'reported') and Critical severity.
 * Uses sortIncidentsForQueue to ensure 100% consistency with banner & list.
 */
export function getTopCriticalIncident<T extends Partial<Incident>>(incidents: T[]): T | null {
  const sorted = sortIncidentsForQueue(incidents);
  const criticals = sorted.filter(
    (inc) =>
      getIncidentSeverity(inc) === 'Critical' &&
      inc.status === 'reported'
  );
  return criticals.length > 0 ? criticals[0] : null;
}
