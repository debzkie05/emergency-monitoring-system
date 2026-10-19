import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Incident,
  IncidentStatus,
  CampusLocation,
  EmergencyType,
  StatusUpdate,
  Severity,
  LinkedReport,
  EscalationRecord,
  AuditEntry,
} from '../types';
import { MOCK_INCIDENTS } from '../data/incidents';
import { EMERGENCY_TYPES } from '../data/emergencyTypes';
import { classifySeverity, getIncidentSeverity } from '../utils/severity';
import { sortIncidentsForQueue, getTopCriticalIncident, getReportCount } from '../utils/ordering';
import { broadcastStoreUpdate, onCrossTabUpdate } from '../utils/crossTabSync';

export type AudioStatus = 'not_started' | 'active' | 'blocked' | 'unavailable';

interface IncidentState {
  incidents: Incident[];

  // Emergency creation flow state
  currentEmergency: {
    type?: EmergencyType;
    typeLabel?: string;
    location?: CampusLocation;
    description?: string;
    photo?: string;
  };

  // Audio & Queue monitoring state
  audioState: AudioStatus;
  volume: number;
  isMuted: boolean;
  muteRemainingSeconds: number;
  activeSirenIncidentId: string | null;

  // Development demo state
  demoModeVisible: boolean;

  // Student Emergency Actions
  createEmergencyAlert: (
    reporterId: string,
    reporterName: string,
    studentId?: string,
    location?: CampusLocation,
    type?: EmergencyType
  ) => string;
  updateEmergencyDetails: (
    incidentId: string,
    details: {
      type?: EmergencyType;
      location?: CampusLocation;
      description?: string;
      photo?: string;
    }
  ) => void;
  setCurrentEmergencyField: (field: string, value: unknown) => void;
  resetCurrentEmergency: () => void;
  submitEmergencyDetails: (incidentId: string) => void;

  // Admin Actions
  acknowledgeIncident: (incidentId: string, adminId?: string, adminName?: string) => void;
  assignResponder: (
    incidentId: string,
    responderId: string,
    responderName: string,
    adminId?: string,
    adminName?: string
  ) => void;
  resolveIncident: (incidentId: string, note?: string, adminId?: string, adminName?: string) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => void;
  changeSeverity: (incidentId: string, severity: Severity, adminId?: string, adminName?: string) => void;
  recordEscalation: (incidentId: string, record: EscalationRecord) => void;

  // Grouping & Splitting
  mergeIncidents: (
    targetIncidentId: string,
    sourceIncidentId: string,
    adminId?: string,
    adminName?: string
  ) => void;
  splitReport: (
    incidentId: string,
    reportId: string,
    adminId?: string,
    adminName?: string
  ) => string;

  // Audio Controls
  setAudioState: (status: AudioStatus) => void;
  setVolume: (vol: number) => void;
  setMuted: (muted: boolean, seconds?: number) => void;
  decrementMuteSeconds: () => void;
  setActiveSirenIncidentId: (id: string | null) => void;

  // Demo / Simulation Controls
  setDemoModeVisible: (visible: boolean) => void;
  simulateAlerts: (count: number, options?: { grouped?: boolean; type?: EmergencyType }) => void;
  clearDemoAlerts: () => void;

  // Queries
  getIncidentById: (id: string) => Incident | undefined;
  getIncidentsByReporter: (reporterId: string) => Incident[];
  getIncidentsByStatus: (status: IncidentStatus | 'all' | 'new' | 'active') => Incident[];
}

const STORE_NAME = 'campussafe-incident-storage';

export const useIncidentStore = create<IncidentState>()(
  subscribeWithSelector(
  persist(
    (set, get) => {
      // Wrap set to broadcast cross-tab updates after every mutation
      const syncSet: typeof set = (...args) => {
        set(...args);
        try {
          const currentIncidents = get().incidents;
          broadcastStoreUpdate(STORE_NAME, currentIncidents);
        } catch {
          // Ignore broadcast failures
        }
      };

      return ({
      incidents: [...MOCK_INCIDENTS],

      currentEmergency: {},

      audioState: 'not_started',
      volume: 0.8,
      isMuted: false,
      muteRemainingSeconds: 0,
      activeSirenIncidentId: null,

      demoModeVisible: false,

      createEmergencyAlert: (
        reporterId: string,
        reporterName: string,
        studentId: string = '2024-' + Math.floor(10000 + Math.random() * 90000),
        location?: CampusLocation,
        type?: EmergencyType
      ) => {
        // Guaranteed collision-free unique ID
        const count = get().incidents.length + 1;
        const id = `INC-${String(count).padStart(3, '0')}-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();
        const severity = classifySeverity(type);

        const initialReport: LinkedReport = {
          id: `REP-${id}-1`,
          reporterId,
          reporterName,
          studentId,
          timestamp: now,
          location: location || {
            building: 'Unknown',
            floor: 'Unknown',
            room: 'Unknown',
          },
          description: 'Emergency alert sent. Details pending.',
        };

        const newIncident: Incident = {
          id,
          type: type || 'other',
          typeLabel: type
            ? (EMERGENCY_TYPES.find((t) => t.id === type)?.label || 'Emergency Alert')
            : 'Emergency Alert',
          severity,
          location: location || {
            building: 'Unknown',
            floor: 'Unknown',
            room: 'Unknown',
          },
          description: 'Emergency alert sent. Details pending.',
          status: 'reported',
          reporterId,
          reporterName,
          createdAt: now,
          updatedAt: now,
          statusHistory: [{ status: 'reported', timestamp: now }],
          reports: [initialReport],
          auditTrail: [],
          escalationHistory: [],
          isDemo: false,
        };

        syncSet((state) => ({
          incidents: [newIncident, ...state.incidents],
        }));

        return id;
      },

      updateEmergencyDetails: (incidentId: string, details) => {
        syncSet((state) => ({
          incidents: state.incidents.map((inc) => {
            if (inc.id !== incidentId) return inc;
            const typeInfo = details.type
              ? EMERGENCY_TYPES.find((t) => t.id === details.type)
              : undefined;
            const updatedSeverity = inc.severityOverridden
              ? inc.severity
              : details.type
              ? classifySeverity(details.type)
              : inc.severity;

            return {
              ...inc,
              ...(details.type && {
                type: details.type,
                typeLabel: typeInfo?.label || inc.typeLabel,
                severity: updatedSeverity,
              }),
              ...(details.location && { location: details.location }),
              ...(details.description && { description: details.description }),
              ...(details.photo !== undefined && { photo: details.photo }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      setCurrentEmergencyField: (field: string, value: unknown) => {
        syncSet((state) => {
          const updated = { ...state.currentEmergency, [field]: value };
          if (field === 'type') {
            const typeInfo = EMERGENCY_TYPES.find((t) => t.id === value);
            if (typeInfo) updated.typeLabel = typeInfo.label;
          }
          return { currentEmergency: updated };
        });
      },

      resetCurrentEmergency: () => {
        syncSet({ currentEmergency: {} });
      },

      submitEmergencyDetails: (incidentId: string) => {
        const { currentEmergency } = get();
        const typeInfo = currentEmergency.type
          ? EMERGENCY_TYPES.find((t) => t.id === currentEmergency.type)
          : undefined;

        syncSet((state) => ({
          incidents: state.incidents.map((inc) => {
            if (inc.id !== incidentId) return inc;
            const updatedSeverity = inc.severityOverridden
              ? inc.severity
              : currentEmergency.type
              ? classifySeverity(currentEmergency.type)
              : inc.severity;

            return {
              ...inc,
              ...(currentEmergency.type && {
                type: currentEmergency.type,
                typeLabel: typeInfo?.label || inc.typeLabel,
                severity: updatedSeverity,
              }),
              ...(currentEmergency.location && { location: currentEmergency.location }),
              ...(currentEmergency.description && { description: currentEmergency.description }),
              ...(currentEmergency.photo !== undefined && { photo: currentEmergency.photo }),
              updatedAt: new Date().toISOString(),
            };
          }),
          currentEmergency: {},
        }));
      },

      acknowledgeIncident: (
        incidentId: string,
        adminId: string = 'ADM-001',
        adminName: string = 'Administrator'
      ) => {
        const now = new Date().toISOString();
        syncSet((state) => {
          const updatedIncidents = state.incidents.map((inc) => {
            if (inc.id !== incidentId) return inc;

            const auditEntry: AuditEntry = {
              id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              action: 'acknowledge',
              adminId,
              adminName,
              timestamp: now,
              details: `Acknowledged by ${adminName}`,
            };

            return {
              ...inc,
              status: 'acknowledged' as IncidentStatus,
              updatedAt: now,
              statusHistory: [
                ...inc.statusHistory,
                {
                  status: 'acknowledged' as IncidentStatus,
                  timestamp: now,
                  note: `Acknowledged by ${adminName}`,
                },
              ],
              auditTrail: [...(inc.auditTrail || []), auditEntry],
            };
          });

          // Stop siren for this specific incident if it was actively sounding
          const newActiveSiren =
            state.activeSirenIncidentId === incidentId ? null : state.activeSirenIncidentId;

          return {
            incidents: updatedIncidents,
            activeSirenIncidentId: newActiveSiren,
          };
        });
      },

      assignResponder: (
        incidentId: string,
        responderId: string,
        responderName: string,
        adminId: string = 'ADM-001',
        adminName: string = 'Administrator'
      ) => {
        const now = new Date().toISOString();
        syncSet((state) => ({
          incidents: state.incidents.map((inc) => {
            if (inc.id !== incidentId) return inc;

            const auditEntry: AuditEntry = {
              id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              action: 'assign',
              adminId,
              adminName,
              timestamp: now,
              details: `Assigned responder ${responderName} (${responderId})`,
            };

            return {
              ...inc,
              status: 'assigned' as IncidentStatus,
              assignedTo: responderId,
              assignedToName: responderName,
              updatedAt: now,
              statusHistory: [
                ...inc.statusHistory,
                {
                  status: 'assigned' as IncidentStatus,
                  timestamp: now,
                  note: `Assigned to ${responderName}`,
                },
              ],
              auditTrail: [...(inc.auditTrail || []), auditEntry],
            };
          }),
        }));
      },

      resolveIncident: (
        incidentId: string,
        note?: string,
        adminId: string = 'ADM-001',
        adminName: string = 'Administrator'
      ) => {
        const now = new Date().toISOString();
        syncSet((state) => ({
          incidents: state.incidents.map((inc) => {
            if (inc.id !== incidentId) return inc;

            const auditEntry: AuditEntry = {
              id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              action: 'resolve',
              adminId,
              adminName,
              timestamp: now,
              details: note ? `Resolved: ${note}` : `Resolved by ${adminName}`,
            };

            return {
              ...inc,
              status: 'resolved' as IncidentStatus,
              updatedAt: now,
              statusHistory: [
                ...inc.statusHistory,
                {
                  status: 'resolved' as IncidentStatus,
                  timestamp: now,
                  note: note || 'Incident resolved',
                },
              ],
              auditTrail: [...(inc.auditTrail || []), auditEntry],
            };
          }),
          // Clear siren if resolved
          activeSirenIncidentId:
            state.activeSirenIncidentId === incidentId ? null : state.activeSirenIncidentId,
        }));
      },

      updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => {
        const now = new Date().toISOString();
        syncSet((state) => ({
          incidents: state.incidents.map((inc) => {
            if (inc.id !== incidentId) return inc;
            return {
              ...inc,
              status,
              updatedAt: now,
              statusHistory: [
                ...inc.statusHistory,
                { status, timestamp: now, note } as StatusUpdate,
              ],
            };
          }),
        }));
      },

      changeSeverity: (
        incidentId: string,
        severity: Severity,
        adminId: string = 'ADM-001',
        adminName: string = 'Administrator'
      ) => {
        const now = new Date().toISOString();
        syncSet((state) => ({
          incidents: state.incidents.map((inc) => {
            if (inc.id !== incidentId) return inc;

            const auditEntry: AuditEntry = {
              id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              action: 'severity_change',
              adminId,
              adminName,
              timestamp: now,
              details: `Changed severity from ${inc.severity || 'unclassified'} to ${severity}`,
            };

            return {
              ...inc,
              severity,
              severityOverridden: true,
              updatedAt: now,
              auditTrail: [...(inc.auditTrail || []), auditEntry],
            };
          }),
        }));
      },

      recordEscalation: (incidentId: string, record: EscalationRecord) => {
        const now = new Date().toISOString();
        syncSet((state) => ({
          incidents: state.incidents.map((inc) => {
            if (inc.id !== incidentId) return inc;

            const existing = inc.escalationHistory || [];
            if (existing.some((h) => h.type === record.type)) {
              return inc; // Never duplicate
            }

            const auditEntry: AuditEntry = {
              id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              action: 'escalation',
              adminId: 'SYSTEM',
              adminName: 'Escalation Monitor',
              timestamp: now,
              details: `Escalated: ${record.type} condition met`,
            };

            return {
              ...inc,
              escalationHistory: [...existing, record],
              auditTrail: [...(inc.auditTrail || []), auditEntry],
            };
          }),
        }));
      },

      mergeIncidents: (
        targetIncidentId: string,
        sourceIncidentId: string,
        adminId: string = 'ADM-001',
        adminName: string = 'Administrator'
      ) => {
        const now = new Date().toISOString();
        const { incidents } = get();
        const target = incidents.find((i) => i.id === targetIncidentId);
        const source = incidents.find((i) => i.id === sourceIncidentId);

        if (!target || !source) return;

        const sourceReports = source.reports && source.reports.length > 0
          ? source.reports
          : [
              {
                id: `REP-${source.id}-1`,
                reporterId: source.reporterId,
                reporterName: source.reporterName,
                timestamp: source.createdAt,
                location: source.location,
                description: source.description,
              },
            ];

        const targetReports = target.reports && target.reports.length > 0
          ? target.reports
          : [
              {
                id: `REP-${target.id}-1`,
                reporterId: target.reporterId,
                reporterName: target.reporterName,
                timestamp: target.createdAt,
                location: target.location,
                description: target.description,
              },
            ];

        const mergedReports = [...targetReports, ...sourceReports];

        const targetAudit: AuditEntry = {
          id: `AUD-${Date.now()}-merge`,
          action: 'merge',
          adminId,
          adminName,
          timestamp: now,
          details: `Merged reports from ${source.id} into this incident (${mergedReports.length} total reports)`,
        };

        syncSet((state) => ({
          incidents: state.incidents
            .map((inc) => {
              if (inc.id === targetIncidentId) {
                return {
                  ...inc,
                  reports: mergedReports,
                  updatedAt: now,
                  auditTrail: [...(inc.auditTrail || []), targetAudit],
                };
              }
              return inc;
            })
            // Remove or cancel the source incident
            .filter((inc) => inc.id !== sourceIncidentId),
        }));
      },

      splitReport: (
        incidentId: string,
        reportId: string,
        adminId: string = 'ADM-001',
        adminName: string = 'Administrator'
      ): string => {
        const now = new Date().toISOString();
        const { incidents } = get();
        const incident = incidents.find((i) => i.id === incidentId);
        if (!incident || !incident.reports) return '';

        const reportToSplit = incident.reports.find((r) => r.id === reportId);
        if (!reportToSplit) return '';

        // Generate new incident from this report
        const newIncidentId = `INC-${Date.now().toString().slice(-4)}-SPLIT`;
        const newIncident: Incident = {
          id: newIncidentId,
          type: incident.type,
          typeLabel: incident.typeLabel,
          severity: incident.severity || classifySeverity(incident.type),
          location: reportToSplit.location,
          description: reportToSplit.description,
          status: 'reported',
          reporterId: reportToSplit.reporterId,
          reporterName: reportToSplit.reporterName,
          createdAt: reportToSplit.timestamp || now,
          updatedAt: now,
          statusHistory: [{ status: 'reported', timestamp: now, note: `Split from ${incident.id}` }],
          reports: [reportToSplit],
          auditTrail: [
            {
              id: `AUD-${Date.now()}-split-new`,
              action: 'split',
              adminId,
              adminName,
              timestamp: now,
              details: `Split from incident ${incident.id}`,
            },
          ],
          escalationHistory: [],
          isDemo: incident.isDemo,
        };

        const updatedOriginalReports = incident.reports.filter((r) => r.id !== reportId);
        const originalAudit: AuditEntry = {
          id: `AUD-${Date.now()}-split-orig`,
          action: 'split',
          adminId,
          adminName,
          timestamp: now,
          details: `Split report ${reportId} into new incident ${newIncidentId}`,
        };

        syncSet((state) => ({
          incidents: [
            newIncident,
            ...state.incidents.map((inc) => {
              if (inc.id === incidentId) {
                return {
                  ...inc,
                  reports: updatedOriginalReports,
                  updatedAt: now,
                  auditTrail: [...(inc.auditTrail || []), originalAudit],
                };
              }
              return inc;
            }),
          ],
        }));

        return newIncidentId;
      },

      setAudioState: (status) => syncSet({ audioState: status }),
      setVolume: (volume) => syncSet({ volume: Math.max(0, Math.min(1, volume)) }),
      setMuted: (isMuted, seconds = 60) =>
        syncSet({ isMuted, muteRemainingSeconds: isMuted ? seconds : 0 }),
      decrementMuteSeconds: () =>
        syncSet((state) => {
          if (!state.isMuted) return {};
          const next = state.muteRemainingSeconds - 1;
          if (next <= 0) {
            return { isMuted: false, muteRemainingSeconds: 0 };
          }
          return { muteRemainingSeconds: next };
        }),
      setActiveSirenIncidentId: (id) => syncSet({ activeSirenIncidentId: id }),

      setDemoModeVisible: (visible) => syncSet({ demoModeVisible: visible }),

      simulateAlerts: (count, options) => {
        const nowMs = Date.now();
        const newDemoIncidents: Incident[] = [];

        const defaultTypes: EmergencyType[] = ['medical', 'fire', 'security', 'accident', 'hazard'];

        for (let i = 0; i < count; i++) {
          const type = options?.type || defaultTypes[i % defaultTypes.length];
          const severity = classifySeverity(type);
          const incId = `DEMO-${nowMs.toString().slice(-4)}-${i + 1}`;
          const time = new Date(nowMs - (count - i) * 2000).toISOString();

          const reportsCount = options?.grouped ? 3 : 1;
          const reports: LinkedReport[] = Array.from({ length: reportsCount }, (_, rIdx) => ({
            id: `REP-${incId}-${rIdx + 1}`,
            reporterId: `USR-DEMO-${i}-${rIdx}`,
            reporterName: `Demo Student ${i + 1}${rIdx > 0 ? ` (Report ${rIdx + 1})` : ''}`,
            studentId: `2024-SIM-${1000 + i * 10 + rIdx}`,
            timestamp: time,
            location: {
              building: options?.grouped ? 'Science Building' : 'Campus Center',
              floor: '2nd Floor',
              room: options?.grouped ? 'Room 204' : `Room ${200 + i}`,
            },
            description: `[SIMULATED DEMO] Test alert ${i + 1} of ${count}.`,
          }));

          newDemoIncidents.push({
            id: incId,
            type,
            typeLabel: EMERGENCY_TYPES.find((t) => t.id === type)?.label || 'Demo Incident',
            severity,
            location: reports[0].location,
            description: reports[0].description,
            status: 'reported',
            reporterId: reports[0].reporterId,
            reporterName: reports[0].reporterName,
            createdAt: time,
            updatedAt: time,
            statusHistory: [{ status: 'reported', timestamp: time }],
            reports,
            auditTrail: [],
            escalationHistory: [],
            isDemo: true,
          });
        }

        syncSet((state) => ({
          incidents: [...newDemoIncidents, ...state.incidents],
          demoModeVisible: true,
        }));
      },

      clearDemoAlerts: () => {
        syncSet((state) => ({
          incidents: state.incidents.filter((inc) => !inc.isDemo),
        }));
      },

      getIncidentById: (id) => get().incidents.find((inc) => inc.id === id),
      getIncidentsByReporter: (reporterId) =>
        get().incidents.filter((inc) => inc.reporterId === reporterId),

      getIncidentsByStatus: (filter) => {
        const incidents = get().incidents;
        switch (filter) {
          case 'all':
            return incidents;
          case 'new':
            return incidents.filter((inc) => inc.status === 'reported');
          case 'active':
            return incidents.filter((inc) =>
              ['acknowledged', 'assigned', 'responding', 'on_site'].includes(inc.status)
            );
          default:
            return incidents.filter((inc) => inc.status === filter);
        }
      },
    });
    },
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => {
        if (typeof AsyncStorage !== 'undefined' && typeof AsyncStorage.setItem === 'function') {
          return AsyncStorage;
        }
        // In-memory fallback for headless / Node.js test runners
        const memoryStorage = new Map<string, string>();
        return {
          getItem: (key: string) => memoryStorage.get(key) ?? null,
          setItem: (key: string, value: string) => {
            memoryStorage.set(key, value);
          },
          removeItem: (key: string) => {
            memoryStorage.delete(key);
          },
        };
      }),
      // Crucial: Only persist real incidents. Demo alerts are NEVER persisted as real records.
      partialize: (state) => ({
        incidents: state.incidents.filter((inc) => !inc.isDemo),
        volume: state.volume,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // If persisted list is empty, restore MOCK_INCIDENTS
        if (!state.incidents || state.incidents.length === 0) {
          state.incidents = [...MOCK_INCIDENTS];
        } else {
          // Ensure all restored records have valid severity
          state.incidents = state.incidents.map((inc) => ({
            ...inc,
            severity: getIncidentSeverity(inc),
          }));
        }
      },
    }
  )
  )
);

/**
 * Initialize cross-tab synchronization for the incident store.
 * Call this once when the app mounts (e.g., in a root layout or provider).
 * Returns a cleanup function.
 */
export function setupCrossTabSync(): () => void {
  return onCrossTabUpdate(STORE_NAME, (data) => {
    if (Array.isArray(data)) {
      useIncidentStore.setState({ incidents: data });
    }
    useIncidentStore.persist?.rehydrate();
  });
}
