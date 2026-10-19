
import type { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Juan Dela Cruz',
    email: 'student@campussafe.edu',
    studentId: '23-A-00296',
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

export const MOCK_CREDENTIALS: Record<
  string,
  { password: string; userId: string }
> = {
  '23-a-00296': {
    password: 'password',
    userId: 'USR-001',
  },
  'student@campussafe.edu': {
    password: 'password',
    userId: 'USR-001',
  },
  'maria@campussafe.edu': {
    password: 'password',
    userId: 'USR-002',
  },
  'admin@campussafe.edu': {
    password: 'password',
    userId: 'ADM-001',
  },
};
