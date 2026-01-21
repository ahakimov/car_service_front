'use client';

import { ClientDashboardLayout } from "@/modules/dashboard/ui/ClientDashboardLayout";
import { ClientReservationsPage } from "@/modules/dashboard/ui/ClientReservationsPage";

export default function ClientDashboard() {
  return (
    <ClientDashboardLayout>
      <ClientReservationsPage />
    </ClientDashboardLayout>
  );
}
