// ─── Auth Types ───
export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: Role;
  avatar?: string;               // profile photo (local image uri)
  idPhoto?: string;              // photo of the school ID card (optional)
  phone?: string;
  program?: string;              // course or department
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// ─── Emergency Types ───
export type EmergencyType =
  | 'medical'
  | 'fire'
  | 'security'
  | 'accident'
  | 'hazard'
  | 'other';

export interface EmergencyTypeInfo {
  id: EmergencyType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

// ─── Location Types ───
export interface CampusBuilding {
  id: string;
  name: string;
  floors: string[];
}

export interface CampusLocation {
  building: string;
  floor: string;
  room: string;
}

// ─── Incident Status ───
export type IncidentStatus =
  | 'reported'
  | 'acknowledged'
  | 'assigned'
  | 'responding'
  | 'on_site'
  | 'resolved'
  | 'cancelled';

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: 'REPORTED',
  acknowledged: 'ACKNOWLEDGED',
  assigned: 'ASSIGNED',
  responding: 'RESPONDING',
  on_site: 'ON-SITE',
  resolved: 'RESOLVED',
  cancelled: 'CANCELLED',
};

export const INCIDENT_STATUS_ORDER: IncidentStatus[] = [
  'reported',
  'acknowledged',
  'assigned',
  'responding',
  'on_site',
  'resolved',
];

// ─── Incident / Report ───
export interface Incident {
  id: string;
  type: EmergencyType;
  typeLabel: string;
  location: CampusLocation;
  description: string;
  photo?: string;
  status: IncidentStatus;
  reporterId: string;
  reporterName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusUpdate[];
}

export interface StatusUpdate {
  status: IncidentStatus;
  timestamp: string;
  note?: string;
}

// ─── Responder ───
export interface Responder {
  id: string;
  name: string;
  role: string;
  available: boolean;
}
