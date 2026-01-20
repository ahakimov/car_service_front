'use client';

import { Calendar, Wrench, Clock, Settings } from "lucide-react";
import { Sidebar } from './Sidebar';

const menuItems = [
  { id: "reservations", label: "Reservations", icon: Calendar, href: "/mechanic" },
  { id: "repair-jobs", label: "Repair Jobs", icon: Wrench, href: "/mechanic/repair-jobs" },
  { id: "schedule", label: "My Schedule", icon: Clock, href: "/mechanic/schedule" },
  { id: "settings", label: "Settings", icon: Settings, href: "/mechanic/settings" },
];

export function MechanicSidebar() {
  return (
    <Sidebar
      config={{
        menuItems,
        basePath: "/mechanic",
        width: 200,
        role: "mechanic",
        roleLabel: "Mechanic",
        avatarColor: "accent",
      }}
    />
  );
}
