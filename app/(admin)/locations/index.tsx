import React from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function LocationsScreen() {
  return (
    <AdminShell title="Locations" subtitle="Coming soon" active="Locations">
      <ComingSoon name="Locations" />
    </AdminShell>
  );
}
