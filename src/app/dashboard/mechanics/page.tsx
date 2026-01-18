'use client';

import { DashboardLayout } from "@/modules/dashboard/ui/DashboardLayout";
import { MechanicsPage } from "@/modules/dashboard/ui/MechanicsPage";

export default function MechanicsDashboard() {
  return (
    <DashboardLayout>
      <MechanicsPage />
    </DashboardLayout>
  );
}
