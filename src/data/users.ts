import type { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Juan Dela Cruz',
    email: 'student@campussafe.edu',
    studentId: '2024-00123',
    role: 'user',
  },
  {
    id: 'USR-002',
    name: 'Maria Santos',
    email: 'maria@campussafe.edu',
    studentId: '2024-00456',
    role: 'user',
  },
  {
    id: 'ADM-001',
    name: 'Admin Officer',
    email: 'admin@campussafe.edu',
    studentId: 'ADMIN-001',
    role: 'admin',
  },
];

// Mock credentials for login
export const MOCK_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'student@campussafe.edu': { password: 'password', userId: 'USR-001' },
  'maria@campussafe.edu': { password: 'password', userId: 'USR-002' },
  'admin@campussafe.edu': { password: 'password', userId: 'ADM-001' },
};
