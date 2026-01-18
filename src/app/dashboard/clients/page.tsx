'use client';

import { DashboardLayout } from "@/modules/dashboard/ui/DashboardLayout";
import { ClientsPage } from "@/modules/dashboard/ui/ClientsPage";

export default function ClientsDashboard() {
  return (
    <DashboardLayout>
      <ClientsPage />
    </DashboardLayout>
  );
}
