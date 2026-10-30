import { UserProfile, UserRole } from '../types/auth';
import { DynamicMenuItem } from '../types/menu';

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'USR-001',
    name: 'Dhruv Halbe',
    email: 'admin@pragatimilk.com',
    role: 'admin',
    roleLabel: 'Super Admin',
    avatar: 'DH',
    centerCode: 'HQ-01',
    centerName: 'Central Dairy Hub',
    mobile: '9876543210'
  },
  staff: {
    id: 'USR-002',
    name: 'Ramesh Patil',
    email: 'operator@pragatimilk.com',
    role: 'staff',
    roleLabel: 'Dairy Operator',
    avatar: 'RP',
    centerCode: 'CTR-04',
    centerName: 'North Village Milk Center',
    mobile: '9876501042'
  },
  farmer: {
    id: 'FAR-1043',
    name: 'Biren Dhal',
    email: 'farmer@pragatimilk.com',
    role: 'farmer',
    roleLabel: 'Milk Producer',
    avatar: 'BD',
    centerCode: 'CTR-04',
    centerName: 'North Village Milk Center',
    mobile: '9583722800'
  }
};

/**
 * Menu rows simulating dynamic MySQL query:
 * SELECT * FROM sys_menus WHERE JSON_CONTAINS(roles, '"admin"') ORDER BY order_index ASC;
 */
export const DYNAMIC_MENUS: DynamicMenuItem[] = [
  {
    id: 1,
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'staff', 'farmer'],
    category: 'dashboard',
    order_index: 10
  },
  {
    id: 2,
    title: 'Samples & Fat',
    path: '/samples',
    icon: 'Package',
    roles: ['admin', 'staff'],
    category: 'operations',
    order_index: 60
  },
  {
    id: 20,
    title: 'Farmers',
    path: '/farmers',
    icon: 'Users',
    roles: ['admin', 'staff'],
    category: 'master',
    order_index: 20,
    badge: '13',
    children: [
      {
        id: '2-1',
        title: 'All Farmers',
        path: '/farmers',
        icon: 'ListFilter'
      },
      {
        id: '2-2',
        title: 'Add Farmer',
        path: '/farmers/new',
        icon: 'UserPlus'
      }
    ]
  },
  {
    id: 5,
    title: 'Daily Collection',
    path: '/collection',
    icon: 'Milk',
    roles: ['admin', 'staff', 'farmer'],
    category: 'operations',
    order_index: 50,
    badge: 'Morning'
  },
];

export async function fetchMenusForRole(role: UserRole): Promise<DynamicMenuItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = DYNAMIC_MENUS
        .filter((item) => item.roles.includes(role))
        .sort((a, b) => a.order_index - b.order_index);
      resolve(filtered);
    }, 20);
  });
}
