'use client';

import { MechanicDashboardLayout } from "@/modules/dashboard/ui/MechanicDashboardLayout";
import { SchedulePage } from "@/modules/dashboard/ui/SchedulePage";

export default function MechanicScheduleDashboard() {
  return (
    <MechanicDashboardLayout>
      <SchedulePage filterByMechanic={true} />
    </MechanicDashboardLayout>
  );
}
