import type { Incident } from '../types';
import { classifySeverity } from '../utils/severity';

const nowMs = Date.now();

// Realistic relative timestamps matching the target dashboard scenario
const twoMinThreeSecAgo = new Date(nowMs - (2 * 60 + 3) * 1000).toISOString();
const oneMinFiftySixSecAgo = new Date(nowMs - (1 * 60 + 56) * 1000).toISOString();
const oneMinFortyEightSecAgo = new Date(nowMs - (1 * 60 + 48) * 1000).toISOString();
const fortyTwoSecAgo = new Date(nowMs - 42 * 1000).toISOString();
const thirtySevenSecAgo = new Date(nowMs - 37 * 1000).toISOString();

const oneHourAgo = new Date(nowMs - 60 * 60 * 1000).toISOString();
const twoHoursAgo = new Date(nowMs - 2 * 60 * 60 * 1000).toISOString();
const threeHoursAgo = new Date(nowMs - 3 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(nowMs - 24 * 60 * 60 * 1000).toISOString();

export const MOCK_INCIDENTS: Incident[] = [
  // 1. Critical: Security Threat (1 report, 02:03 waiting)
  {
    id: 'INC-001',
    type: 'security',
    typeLabel: 'Security Threat',
    severity: 'Critical',
    location: {
      building: 'Main Gate',
      floor: 'Ground Level',
      room: 'Entrance',
    },
    description: 'Suspicious individual loitering near the main gate. The person has been there for over an hour photographing students.',
    status: 'reported',
    reporterId: 'USR-002',
    reporterName: 'Maria Santos',
    createdAt: twoMinThreeSecAgo,
    updatedAt: twoMinThreeSecAgo,
    statusHistory: [
      { status: 'reported', timestamp: twoMinThreeSecAgo },
    ],
    reports: [
      {
        id: 'REP-001-A',
        reporterId: 'USR-002',
        reporterName: 'Maria Santos',
        studentId: '2024-00456',
        timestamp: twoMinThreeSecAgo,
        location: { building: 'Main Gate', floor: 'Ground Level', room: 'Entrance' },
        description: 'Suspicious individual loitering near the main gate.',
      },
    ],
    auditTrail: [],
  },

  // 2. Critical: Medical Emergency (2 reports, 01:56 waiting)
  {
    id: 'INC-002',
    type: 'medical',
    typeLabel: 'Medical Emergency',
    severity: 'Critical',
    location: {
      building: 'Science Building',
      floor: '2nd Floor',
      room: 'Room 204',
    },
    description: 'Student experiencing severe asthma attack and difficulty breathing. First aid required immediately.',
    status: 'reported',
    reporterId: 'USR-001',
    reporterName: 'Juan Dela Cruz',
    createdAt: oneMinFiftySixSecAgo,
    updatedAt: oneMinFiftySixSecAgo,
    statusHistory: [
      { status: 'reported', timestamp: oneMinFiftySixSecAgo },
    ],
    reports: [
      {
        id: 'REP-002-A',
        reporterId: 'USR-001',
        reporterName: 'Juan Dela Cruz',
        studentId: '2024-00123',
        timestamp: oneMinFiftySixSecAgo,
        location: { building: 'Science Building', floor: '2nd Floor', room: 'Room 204' },
        description: 'Student having severe asthma attack in Room 204.',
      },
      {
        id: 'REP-002-B',
        reporterId: 'USR-003',
        reporterName: 'Elena Ramos',
        studentId: '2024-00891',
        timestamp: oneMinFiftySixSecAgo,
        location: { building: 'Science Building', floor: '2nd Floor', room: 'Room 204' },
        description: 'Need clinic staff in Science Building Room 204 right away.',
      },
    ],
    auditTrail: [],
  },

  // 3. Critical: Fire (8 reports, 01:48 waiting)
  {
    id: 'INC-003',
    type: 'fire',
    typeLabel: 'Fire',
    severity: 'Critical',
    location: {
      building: 'Science Building',
      floor: '1st Floor',
      room: 'Room 101',
    },
    description: 'Electrical fire spark and heavy smoke reported in Chemistry laboratory Room 101.',
    status: 'reported',
    reporterId: 'USR-004',
    reporterName: 'Carlo Mendoza',
    createdAt: oneMinFortyEightSecAgo,
    updatedAt: oneMinFortyEightSecAgo,
    statusHistory: [
      { status: 'reported', timestamp: oneMinFortyEightSecAgo },
    ],
    reports: [
      {
        id: 'REP-003-A',
        reporterId: 'USR-004',
        reporterName: 'Carlo Mendoza',
        studentId: '2024-00912',
        timestamp: oneMinFortyEightSecAgo,
        location: { building: 'Science Building', floor: '1st Floor', room: 'Room 101' },
        description: 'Heavy smoke and sparking power strip in Room 101.',
      },
      {
        id: 'REP-003-B',
        reporterId: 'USR-005',
        reporterName: 'Gabriel Lim',
        studentId: '2024-00915',
        timestamp: oneMinFortyEightSecAgo,
        location: { building: 'Science Building', floor: '1st Floor', room: 'Room 101' },
        description: 'Smoke alarm sounding in Science Building Room 101.',
      },
      {
        id: 'REP-003-C',
        reporterId: 'USR-006',
        reporterName: 'Patricia Tan',
        studentId: '2024-00922',
        timestamp: oneMinFortyEightSecAgo,
        location: { building: 'Science Building', floor: '1st Floor', room: 'Room 101' },
        description: 'Burning smell and smoke outside Room 101.',
      },
      {
        id: 'REP-003-D',
        reporterId: 'USR-007',
        reporterName: 'Mark Bautista',
        studentId: '2024-00933',
        timestamp: oneMinFortyEightSecAgo,
        location: { building: 'Science Building', floor: '1st Floor', room: 'Room 101' },
        description: 'Students evacuating hallway near Room 101.',
      },
      {
        id: 'REP-003-E',
        reporterId: 'USR-008',
        reporterName: 'Chloe De Vera',
        studentId: '2024-00940',
        timestamp: oneMinFortyEightSecAgo,
        location: { building: 'Science Building', floor: '1st Floor', room: 'Room 101' },
        description: 'Fire alarm pulled in Science Building.',
      },
      {
        id: 'REP-003-F',
        reporterId: 'USR-009',
        reporterName: 'Joshua Reyes',
        studentId: '2024-00951',
        timestamp: oneMinFortyEightSecAgo,
        location: { building: 'Science Building', floor: '1st Floor', room: 'Room 101' },
        description: 'Need fire extinguisher team at Room 101.',
      },
      {
        id: 'REP-003-G',
        reporterId: 'USR-010',
        reporterName: 'Bianca Aquino',
        studentId: '2024-00962',
        timestamp: oneMinFortyEightSecAgo,
        location: { building: 'Science Building', floor: '1st Floor', room: 'Room 101' },
        description: 'Circuit breaker sparking near Room 101.',
      },
      {
        id: 'REP-003-H',
        reporterId: 'USR-011',
        reporterName: 'Kevin Torres',
        studentId: '2024-00970',
        timestamp: oneMinFortyEightSecAgo,
        location: { building: 'Science Building', floor: '1st Floor', room: 'Room 101' },
        description: 'Hallway filled with white smoke.',
      },
    ],
    auditTrail: [],
  },

  // 4. High: Accident (1 report, 00:42 waiting)
  {
    id: 'INC-004',
    type: 'accident',
    typeLabel: 'Accident',
    severity: 'High',
    location: {
      building: 'Engineering Building',
      floor: 'Ground Floor',
      room: 'Hallway',
    },
    description: 'Student tripped over uneven floor tiles and suffered a deep elbow abrasion.',
    status: 'reported',
    reporterId: 'USR-012',
    reporterName: 'Ana Reyes',
    createdAt: fortyTwoSecAgo,
    updatedAt: fortyTwoSecAgo,
    statusHistory: [
      { status: 'reported', timestamp: fortyTwoSecAgo },
    ],
    reports: [
      {
        id: 'REP-004-A',
        reporterId: 'USR-012',
        reporterName: 'Ana Reyes',
        studentId: '2024-00789',
        timestamp: fortyTwoSecAgo,
        location: { building: 'Engineering Building', floor: 'Ground Floor', room: 'Hallway' },
        description: 'Student injured on loose floor tile in hallway.',
      },
    ],
    auditTrail: [],
  },

  // 5. Moderate: Safety Hazard (1 report, 00:37 waiting)
  {
    id: 'INC-005',
    type: 'hazard',
    typeLabel: 'Safety Hazard',
    severity: 'Moderate',
    location: {
      building: 'Library',
      floor: '2nd Floor',
      room: 'Second Floor',
    },
    description: 'Water leaking from overhead air conditioner pipe, creating slippery floor in reading area.',
    status: 'reported',
    reporterId: 'USR-013',
    reporterName: 'Liza Cruz',
    createdAt: thirtySevenSecAgo,
    updatedAt: thirtySevenSecAgo,
    statusHistory: [
      { status: 'reported', timestamp: thirtySevenSecAgo },
    ],
    reports: [
      {
        id: 'REP-005-A',
        reporterId: 'USR-013',
        reporterName: 'Liza Cruz',
        studentId: '2024-01034',
        timestamp: thirtySevenSecAgo,
        location: { building: 'Library', floor: '2nd Floor', room: 'Second Floor' },
        description: 'AC leak making floor very slippery on 2nd floor.',
      },
    ],
    auditTrail: [],
  },

  // Historical resolved items (showing 12 resolved today for dashboard metrics)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `INC-HIST-${String(i + 1).padStart(3, '0')}`,
    type: (i % 2 === 0 ? 'medical' : i % 3 === 0 ? 'hazard' : 'accident') as any,
    typeLabel: i % 2 === 0 ? 'Medical Emergency' : i % 3 === 0 ? 'Safety Hazard' : 'Accident',
    severity: (i % 2 === 0 ? 'Critical' : i % 3 === 0 ? 'Moderate' : 'High') as any,
    location: {
      building: 'Main Building',
      floor: '1st Floor',
      room: `Room ${100 + i}`,
    },
    description: `Resolved incident record #${i + 1}`,
    status: 'resolved' as const,
    reporterId: `USR-HIST-${i}`,
    reporterName: `Campus Member ${i + 1}`,
    assignedTo: 'RSP-001',
    assignedToName: 'Campus Safety Officer',
    createdAt: new Date(nowMs - (4 + i) * 3600 * 1000).toISOString(),
    updatedAt: new Date(nowMs - (2 + i) * 3600 * 1000).toISOString(),
    statusHistory: [
      { status: 'reported' as const, timestamp: new Date(nowMs - (4 + i) * 3600 * 1000).toISOString() },
      { status: 'acknowledged' as const, timestamp: new Date(nowMs - (3.5 + i) * 3600 * 1000).toISOString() },
      { status: 'resolved' as const, timestamp: new Date(nowMs - (2 + i) * 3600 * 1000).toISOString() },
    ],
    reports: [],
    auditTrail: [],
  })),
];
