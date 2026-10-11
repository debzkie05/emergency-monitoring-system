import type { Incident } from '../types';

// Generate a realistic date string
const today = new Date();
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatFull = (date: Date) => `${formatDate(date)}, ${formatTime(date)}`;

// Create some realistic timestamps
const now = today.toISOString();
const hourAgo = new Date(today.getTime() - 60 * 60 * 1000).toISOString();
const twoHoursAgo = new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString();
const threeHoursAgo = new Date(today.getTime() - 3 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(today.getTime() - 48 * 60 * 60 * 1000).toISOString();

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    type: 'medical',
    typeLabel: 'Medical Emergency',
    location: {
      building: 'CCS Building',
      floor: '2nd Floor',
      room: 'Computer Laboratory 2',
    },
    description: 'A student fainted during class and requires immediate medical assistance. The student appears to be unconscious.',
    status: 'reported',
    reporterId: 'USR-001',
    reporterName: 'Juan Dela Cruz',
    createdAt: hourAgo,
    updatedAt: hourAgo,
    statusHistory: [
      { status: 'reported', timestamp: hourAgo },
    ],
  },
  {
    id: 'INC-002',
    type: 'security',
    typeLabel: 'Security Threat',
    location: {
      building: 'Main Gate',
      floor: 'Ground Level',
      room: 'Entrance',
    },
    description: 'Suspicious individual loitering near the main gate. The person has been there for over an hour and appears to be photographing students.',
    status: 'acknowledged',
    reporterId: 'USR-002',
    reporterName: 'Maria Santos',
    createdAt: twoHoursAgo,
    updatedAt: hourAgo,
    statusHistory: [
      { status: 'reported', timestamp: twoHoursAgo },
      { status: 'acknowledged', timestamp: hourAgo, note: 'Security team notified' },
    ],
  },
  {
    id: 'INC-003',
    type: 'fire',
    typeLabel: 'Fire',
    location: {
      building: 'Engineering Building',
      floor: '3rd Floor',
      room: 'Workshop A',
    },
    description: 'Smoke detected coming from the workshop area. Possible electrical fire from equipment.',
    status: 'responding',
    reporterId: 'USR-001',
    reporterName: 'Juan Dela Cruz',
    assignedTo: 'RSP-006',
    assignedToName: 'Fire Safety Officer',
    createdAt: threeHoursAgo,
    updatedAt: twoHoursAgo,
    statusHistory: [
      { status: 'reported', timestamp: threeHoursAgo },
      { status: 'acknowledged', timestamp: threeHoursAgo },
      { status: 'assigned', timestamp: twoHoursAgo, note: 'Fire Safety Officer assigned' },
      { status: 'responding', timestamp: twoHoursAgo },
    ],
  },
  {
    id: 'INC-004',
    type: 'hazard',
    typeLabel: 'Safety Hazard',
    location: {
      building: 'Engineering Building',
      floor: 'Ground Floor',
      room: 'Lobby',
    },
    description: 'Wet floor near the entrance without any warning signs. Several students have already slipped.',
    status: 'resolved',
    reporterId: 'USR-002',
    reporterName: 'Maria Santos',
    assignedTo: 'RSP-007',
    assignedToName: 'Maintenance Staff 01',
    createdAt: yesterday,
    updatedAt: yesterday,
    statusHistory: [
      { status: 'reported', timestamp: yesterday },
      { status: 'acknowledged', timestamp: yesterday },
      { status: 'assigned', timestamp: yesterday, note: 'Maintenance Staff assigned' },
      { status: 'responding', timestamp: yesterday },
      { status: 'on_site', timestamp: yesterday },
      { status: 'resolved', timestamp: yesterday, note: 'Warning signs placed and floor dried' },
    ],
  },
  {
    id: 'INC-005',
    type: 'accident',
    typeLabel: 'Accident',
    location: {
      building: 'Gymnasium',
      floor: 'Ground Floor',
      room: 'Main Court',
    },
    description: 'Student injured during basketball practice. Possible ankle sprain, unable to walk.',
    status: 'resolved',
    reporterId: 'USR-001',
    reporterName: 'Juan Dela Cruz',
    assignedTo: 'RSP-004',
    assignedToName: 'Medical Staff 01',
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    statusHistory: [
      { status: 'reported', timestamp: twoDaysAgo },
      { status: 'acknowledged', timestamp: twoDaysAgo },
      { status: 'assigned', timestamp: twoDaysAgo, note: 'Medical Staff 01 assigned' },
      { status: 'responding', timestamp: twoDaysAgo },
      { status: 'on_site', timestamp: twoDaysAgo },
      { status: 'resolved', timestamp: twoDaysAgo, note: 'Student treated and sent to clinic' },
    ],
  },
  {
    id: 'INC-006',
    type: 'medical',
    typeLabel: 'Medical Emergency',
    location: {
      building: 'Library',
      floor: '2nd Floor',
      room: 'Reading Area',
    },
    description: 'Student experiencing severe allergic reaction. Having difficulty breathing.',
    status: 'reported',
    reporterId: 'USR-002',
    reporterName: 'Maria Santos',
    createdAt: now,
    updatedAt: now,
    statusHistory: [
      { status: 'reported', timestamp: now },
    ],
  },
];
