'use client';

import { DashboardLayout } from "@/modules/dashboard/ui/DashboardLayout";
import { ReservationsPage } from "@/modules/dashboard/ui/ReservationsPage";

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <ReservationsPage />
    </DashboardLayout>
  );
}
