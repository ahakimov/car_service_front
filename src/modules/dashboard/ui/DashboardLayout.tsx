'use client';

import { ReactNode } from 'react';
import { ManagerSidebar } from '../components';
import { BaseDashboardLayout } from './BaseDashboardLayout';

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <BaseDashboardLayout sidebar={<ManagerSidebar />} sidebarWidth={288}>
      {children}
    </BaseDashboardLayout>
  );
}
