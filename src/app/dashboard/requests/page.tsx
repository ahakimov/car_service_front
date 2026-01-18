'use client';

import { DashboardLayout } from '@/modules/dashboard/ui/DashboardLayout';
import { RequestBoxPage } from '@/modules/dashboard/ui/RequestBoxPage';

export default function RequestsPage() {
  return (
    <DashboardLayout>
      <RequestBoxPage />
    </DashboardLayout>
  );
}
