'use client';

import { ClientDashboardLayout } from "@/modules/dashboard/ui/ClientDashboardLayout";
import { ClientVehiclesPage } from "@/modules/dashboard/ui/ClientVehiclesPage";

export default function ClientVehiclesDashboard() {
  return (
    <ClientDashboardLayout>
      <ClientVehiclesPage />
    </ClientDashboardLayout>
  );
}
