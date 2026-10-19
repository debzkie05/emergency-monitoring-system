import type { Incident, EscalationRecord } from '../types';
import { getIncidentSeverity } from './severity';
import { safeGetTimestamp } from './ordering';

export const DEV_ESCALATION_MS = 10 * 1000; // 10 seconds in development
export const DEMO_ESCALATION_MS = 120 * 1000; // 120 seconds demo default

export const ESCALATION_MESSAGE = 'DEV FALLBACK: Escalated to backup admin (simulated)';

export interface EscalationEvaluationResult {
  shouldEscalate: boolean;
  type?: 'unacknowledged' | 'unassigned';
  record?: EscalationRecord;
}

/**
 * Pure evaluation function to check if a critical incident qualifies for simulated escalation.
 * Conditions:
 * 1. Must be Critical severity.
 * 2. Condition (a): unacknowledged (status === 'reported') past threshold from createdAt.
 * 3. Condition (b): acknowledged with no responder assigned (status === 'acknowledged' && !assignedTo)
 *    past threshold from when it was acknowledged.
 * 4. Must not already have an escalation record for that specific type.
 */
export function evaluateIncidentEscalation(
  incident: Partial<Incident>,
  thresholdMs: number = DEV_ESCALATION_MS,
  nowMs: number = Date.now()
): EscalationEvaluationResult {
  const severity = getIncidentSeverity(incident);
  if (severity !== 'Critical') {
    return { shouldEscalate: false };
  }

  const existingHistory = incident.escalationHistory || [];

  // Condition (a): Unacknowledged
  if (incident.status === 'reported') {
    const hasUnackEscalation = existingHistory.some((h) => h.type === 'unacknowledged');
    if (hasUnackEscalation) {
      return { shouldEscalate: false };
    }

    const createdTime = safeGetTimestamp(incident.createdAt);
    if (createdTime !== Number.MAX_SAFE_INTEGER && nowMs - createdTime >= thresholdMs) {
      return {
        shouldEscalate: true,
        type: 'unacknowledged',
        record: {
          type: 'unacknowledged',
          timestamp: new Date(nowMs).toISOString(),
          message: ESCALATION_MESSAGE,
        },
      };
    }
  }

  // Condition (b): Acknowledged with no responder assigned
  if (incident.status === 'acknowledged' && (!incident.assignedTo || incident.assignedTo.trim() === '')) {
    const hasUnassignedEscalation = existingHistory.some((h) => h.type === 'unassigned');
    if (hasUnassignedEscalation) {
      return { shouldEscalate: false };
    }

    // Determine when acknowledgment occurred
    let ackTime = safeGetTimestamp(incident.updatedAt);
    if (incident.statusHistory && incident.statusHistory.length > 0) {
      const ackEntry = incident.statusHistory.find((s) => s.status === 'acknowledged');
      if (ackEntry) {
        ackTime = safeGetTimestamp(ackEntry.timestamp);
      }
    }

    if (ackTime !== Number.MAX_SAFE_INTEGER && nowMs - ackTime >= thresholdMs) {
      return {
        shouldEscalate: true,
        type: 'unassigned',
        record: {
          type: 'unassigned',
          timestamp: new Date(nowMs).toISOString(),
          message: ESCALATION_MESSAGE,
        },
      };
    }
  }

  return { shouldEscalate: false };
}

/**
 * Check if an incident has been escalated based on its history or active evaluation.
 */
export function isIncidentEscalated(
  incident: Partial<Incident>,
  thresholdMs: number = DEV_ESCALATION_MS,
  nowMs: number = Date.now()
): { isEscalated: boolean; message: string; records: EscalationRecord[] } {
  const history = incident.escalationHistory || [];

  if (history.length > 0) {
    return {
      isEscalated: true,
      message: ESCALATION_MESSAGE,
      records: history,
    };
  }

  // Check if it currently qualifies
  const evalResult = evaluateIncidentEscalation(incident, thresholdMs, nowMs);
  if (evalResult.shouldEscalate && evalResult.record) {
    return {
      isEscalated: true,
      message: ESCALATION_MESSAGE,
      records: [evalResult.record],
    };
  }

  return {
    isEscalated: false,
    message: '',
    records: [],
  };
}
