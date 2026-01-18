'use client';

import { DashboardLayout } from "@/modules/dashboard/ui/DashboardLayout";
import { SettingsPage } from "@/modules/dashboard/ui/SettingsPage";

export default function SettingsDashboard() {
  return (
    <DashboardLayout>
      <SettingsPage userRole="manager" />
    </DashboardLayout>
  );
}
