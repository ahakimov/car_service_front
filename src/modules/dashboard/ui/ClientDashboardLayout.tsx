'use client';

import { ReactNode } from 'react';
import { ClientSidebar } from '../components/ClientSidebar';
import { BaseDashboardLayout } from './BaseDashboardLayout';

type ClientDashboardLayoutProps = {
  children: ReactNode;
};

export function ClientDashboardLayout({ children }: ClientDashboardLayoutProps) {
  return (
    <BaseDashboardLayout sidebar={<ClientSidebar />} sidebarWidth={200}>
      {children}
    </BaseDashboardLayout>
  );
}
