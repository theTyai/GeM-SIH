import { User } from './types';

export const USERS: Record<string, User> = {
  'user_1': {
    id: 'user_1',
    name: 'Ashish Mishra',
    email: 'ashish@gemintel.gov.in',
    role: 'OFFICER',
    department: 'Electronics Procurement'
  },
  'user_2': {
    id: 'user_2',
    name: 'R. Sharma',
    email: 'r.sharma@gemintel.gov.in',
    role: 'OFFICER',
    department: 'IT Procurement'
  },
  'user_3': {
    id: 'user_3',
    name: 'Auditor Alpha',
    email: 'auditor@gemintel.gov.in',
    role: 'AUDITOR',
    department: 'Central Audit'
  },
  'user_4': {
    id: 'user_4',
    name: 'System Admin',
    email: 'admin@gemintel.gov.in',
    role: 'ADMIN',
    department: 'IT Support'
  }
};
