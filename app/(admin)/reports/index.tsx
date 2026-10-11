import React from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function ReportsScreen() {
  return (
    <AdminShell title="Reports" subtitle="Coming soon" active="Reports">
      <ComingSoon name="Reports" />
    </AdminShell>
  );
}
