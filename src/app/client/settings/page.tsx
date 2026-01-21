'use client';

import { ClientDashboardLayout } from "@/modules/dashboard/ui/ClientDashboardLayout";
import { SettingsPage } from "@/modules/dashboard/ui/SettingsPage";

export default function ClientSettingsDashboard() {
  return (
    <ClientDashboardLayout>
      <SettingsPage userRole="client" />
    </ClientDashboardLayout>
  );
}
