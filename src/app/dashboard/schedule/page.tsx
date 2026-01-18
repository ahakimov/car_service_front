'use client';

import { DashboardLayout } from "@/modules/dashboard/ui/DashboardLayout";
import { SchedulePage } from "@/modules/dashboard/ui/SchedulePage";

export default function ScheduleDashboard() {
  return (
    <DashboardLayout>
      <SchedulePage />
    </DashboardLayout>
  );
}
