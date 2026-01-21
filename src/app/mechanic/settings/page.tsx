'use client';

import { MechanicDashboardLayout } from "@/modules/dashboard/ui/MechanicDashboardLayout";
import { SettingsPage } from "@/modules/dashboard/ui/SettingsPage";

export default function MechanicSettingsDashboard() {
  return (
    <MechanicDashboardLayout>
      <SettingsPage userRole="mechanic" />
    </MechanicDashboardLayout>
  );
}
