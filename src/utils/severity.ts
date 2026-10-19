import type { EmergencyType, Incident, Severity } from '../types';

/**
 * Classify severity based on emergency type:
 * - Fire, medical, security threat => Critical
 * - Accident, other => High
 * - Safety hazard => Moderate
 * - Instant alert / no type specified yet => Critical (enters queue immediately)
 */
export function classifySeverity(type?: EmergencyType | string | null): Severity {
  if (!type || typeof type !== 'string' || type.trim() === '') {
    return 'Critical';
  }

  const normalized = type.toLowerCase().trim();

  switch (normalized) {
    case 'fire':
    case 'medical':
    case 'security':
      return 'Critical';

    case 'accident':
    case 'other':
      return 'High';

    case 'hazard':
      return 'Moderate';

    default:
      // Unknown type or pending type defaults to Critical for safety
      return 'Critical';
  }
}

/**
 * Get the effective severity for an incident.
 * If an admin has overridden the severity, returns the override.
 * Otherwise, calculates severity based on incident type.
 */
export function getIncidentSeverity(incident: Partial<Incident>): Severity {
  if (incident.severity) {
    return incident.severity;
  }
  return classifySeverity(incident.type);
}

/**
 * Human-readable colors / badge styles mapping for severity
 */
export const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; color: string; bgColor: string; borderColor: string; weight: number }
> = {
  Critical: {
    label: 'CRITICAL',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#EF4444',
    weight: 3,
  },
  High: {
    label: 'HIGH',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#F59E0B',
    weight: 2,
  },
  Moderate: {
    label: 'MODERATE',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#3B82F6',
    weight: 1,
  },
};
