import OperationsConsole from '@/components/OperationsConsole';

export const route = { path: '/admin/operations', layout: 'owner', access: "profile === 'Admin_c'" };
export const nav = { icon: 'SlidersHorizontal', label: 'All Operations', section: 'Administration', profiles: ['Admin_c'], order: 3 };

export default function AdminOperations() {
  return <OperationsConsole mode="admin" />;
}
