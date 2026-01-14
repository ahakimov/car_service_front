'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '@/modules/layout/ProtectedRoute';

type BaseDashboardLayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
  sidebarWidth: number;
};

export function BaseDashboardLayout({ children, sidebar, sidebarWidth }: BaseDashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div style={{ backgroundColor: 'var(--primary-50)' }} className="min-h-screen">
        {sidebar}
        <div style={{ marginLeft: `${sidebarWidth}px` }}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
