import type { Responder } from '../types';

export const MOCK_RESPONDERS: Responder[] = [
  {
    id: 'RSP-001',
    name: 'Security Officer 01',
    role: 'Security',
    available: true,
  },
  {
    id: 'RSP-002',
    name: 'Security Officer 02',
    role: 'Security',
    available: true,
  },
  {
    id: 'RSP-003',
    name: 'Security Officer 03',
    role: 'Security',
    available: false,
  },
  {
    id: 'RSP-004',
    name: 'Medical Staff 01',
    role: 'Medical',
    available: true,
  },
  {
    id: 'RSP-005',
    name: 'Medical Staff 02',
    role: 'Medical',
    available: true,
  },
  {
    id: 'RSP-006',
    name: 'Fire Safety Officer',
    role: 'Fire Safety',
    available: true,
  },
  {
    id: 'RSP-007',
    name: 'Maintenance Staff 01',
    role: 'Maintenance',
    available: true,
  },
];
