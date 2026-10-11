import React from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function UsersScreen() {
  return (
    <AdminShell title="Users" subtitle="Coming soon" active="Users">
      <ComingSoon name="Users" />
    </AdminShell>
  );
}
