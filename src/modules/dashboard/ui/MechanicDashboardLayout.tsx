'use client';

import { ReactNode } from 'react';
import { MechanicSidebar } from '../components/MechanicSidebar';
import { BaseDashboardLayout } from './BaseDashboardLayout';

type MechanicDashboardLayoutProps = {
  children: ReactNode;
};

export function MechanicDashboardLayout({ children }: MechanicDashboardLayoutProps) {
  return (
    <BaseDashboardLayout sidebar={<MechanicSidebar />} sidebarWidth={200}>
      {children}
    </BaseDashboardLayout>
  );
}
