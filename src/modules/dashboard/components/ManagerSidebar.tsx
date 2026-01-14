'use client';

import { Calendar, Settings, Users, Wrench, BarChart3, Inbox } from "lucide-react";
import { Sidebar } from './Sidebar';

const menuItems = [
  { id: "reservations", label: "Reservations", icon: Calendar, href: "/dashboard" },
  { id: "request-box", label: "Request Box", icon: Inbox, href: "/dashboard/requests" },
  { id: "mechanics", label: "Mechanics", icon: Wrench, href: "/dashboard/mechanics" },
  { id: "clients", label: "Clients", icon: Users, href: "/dashboard/clients" },
  { id: "schedule", label: "Schedule", icon: BarChart3, href: "/dashboard/schedule" },
  { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function ManagerSidebar() {
  return (
    <Sidebar
      config={{
        menuItems,
        basePath: "/dashboard",
        width: 288,
        role: "manager",
        roleLabel: "Manager",
        avatarColor: "primary",
      }}
    />
  );
}
