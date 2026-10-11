import { create } from 'zustand';
import type { Incident, IncidentStatus, CampusLocation, EmergencyType, StatusUpdate } from '../types';
import { MOCK_INCIDENTS } from '../data/incidents';
import { EMERGENCY_TYPES } from '../data/emergencyTypes';

interface IncidentState {
  incidents: Incident[];

  // Emergency flow state
  currentEmergency: {
    type?: EmergencyType;
    typeLabel?: string;
    location?: CampusLocation;
    description?: string;
    photo?: string;
  };

  // Actions
  createEmergencyAlert: (reporterId: string, reporterName: string) => string;
  updateEmergencyDetails: (incidentId: string, details: {
    type?: EmergencyType;
    location?: CampusLocation;
    description?: string;
    photo?: string;
  }) => void;
  setCurrentEmergencyField: (field: string, value: unknown) => void;
  resetCurrentEmergency: () => void;
  submitEmergencyDetails: (incidentId: string) => void;

  // Admin actions
  acknowledgeIncident: (incidentId: string) => void;
  assignResponder: (incidentId: string, responderId: string, responderName: string) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => void;

  // Queries
  getIncidentById: (id: string) => Incident | undefined;
  getIncidentsByReporter: (reporterId: string) => Incident[];
  getIncidentsByStatus: (status: IncidentStatus | 'all' | 'new' | 'active') => Incident[];
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [...MOCK_INCIDENTS],

  currentEmergency: {},

  createEmergencyAlert: (reporterId: string, reporterName: string) => {
    const id = `INC-${String(get().incidents.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newIncident: Incident = {
      id,
      type: 'other',
      typeLabel: 'Emergency Alert',
      location: {
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
      statusHistory: [
        { status: 'reported', timestamp: now },
      ],
    };

    set((state) => ({
      incidents: [newIncident, ...state.incidents],
    }));

    return id;
  },

  updateEmergencyDetails: (incidentId: string, details) => {
    set((state) => ({
      incidents: state.incidents.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const typeInfo = details.type
          ? EMERGENCY_TYPES.find((t) => t.id === details.type)
          : undefined;
        return {
          ...inc,
          ...(details.type && { type: details.type, typeLabel: typeInfo?.label || inc.typeLabel }),
          ...(details.location && { location: details.location }),
          ...(details.description && { description: details.description }),
          ...(details.photo !== undefined && { photo: details.photo }),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  setCurrentEmergencyField: (field: string, value: unknown) => {
    set((state) => {
      const updated = { ...state.currentEmergency, [field]: value };
      // Auto-populate typeLabel when type changes
      if (field === 'type') {
        const typeInfo = EMERGENCY_TYPES.find((t) => t.id === value);
        if (typeInfo) updated.typeLabel = typeInfo.label;
      }
      return { currentEmergency: updated };
    });
  },

  resetCurrentEmergency: () => {
    set({ currentEmergency: {} });
  },

  submitEmergencyDetails: (incidentId: string) => {
    const { currentEmergency } = get();
    const typeInfo = currentEmergency.type
      ? EMERGENCY_TYPES.find((t) => t.id === currentEmergency.type)
      : undefined;

    set((state) => ({
      incidents: state.incidents.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          ...(currentEmergency.type && { type: currentEmergency.type, typeLabel: typeInfo?.label || inc.typeLabel }),
          ...(currentEmergency.location && { location: currentEmergency.location }),
          ...(currentEmergency.description && { description: currentEmergency.description }),
          ...(currentEmergency.photo !== undefined && { photo: currentEmergency.photo }),
          updatedAt: new Date().toISOString(),
        };
      }),
      currentEmergency: {},
    }));
  },

  acknowledgeIncident: (incidentId: string) => {
    const now = new Date().toISOString();
    set((state) => ({
      incidents: state.incidents.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'acknowledged' as IncidentStatus,
          updatedAt: now,
          statusHistory: [
            ...inc.statusHistory,
            { status: 'acknowledged' as IncidentStatus, timestamp: now, note: 'Incident acknowledged by admin' },
          ],
        };
      }),
    }));
  },

  assignResponder: (incidentId: string, responderId: string, responderName: string) => {
    const now = new Date().toISOString();
    set((state) => ({
      incidents: state.incidents.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          status: 'assigned' as IncidentStatus,
          assignedTo: responderId,
          assignedToName: responderName,
          updatedAt: now,
          statusHistory: [
            ...inc.statusHistory,
            { status: 'assigned' as IncidentStatus, timestamp: now, note: `Assigned to ${responderName}` },
          ],
        };
      }),
    }));
  },

  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => {
    const now = new Date().toISOString();
    set((state) => ({
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

  getIncidentById: (id: string) => {
    return get().incidents.find((inc) => inc.id === id);
  },

  getIncidentsByReporter: (reporterId: string) => {
    return get().incidents.filter((inc) => inc.reporterId === reporterId);
  },

  getIncidentsByStatus: (filter: IncidentStatus | 'all' | 'new' | 'active') => {
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
}));
