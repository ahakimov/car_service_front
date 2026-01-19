'use client';

import { Calendar, Wrench, Car, Settings } from "lucide-react";
import { Sidebar } from './Sidebar';

const menuItems = [
  { id: "reservations", label: "My Reservations", icon: Calendar, href: "/client" },
  { id: "repair-jobs", label: "Repair Jobs", icon: Wrench, href: "/client/repair-jobs" },
  { id: "vehicles", label: "My Vehicles", icon: Car, href: "/client/vehicles" },
  { id: "settings", label: "Settings", icon: Settings, href: "/client/settings" },
];

export function ClientSidebar() {
  return (
    <Sidebar
      config={{
        menuItems,
        basePath: "/client",
        width: 200,
        role: "client",
        roleLabel: "Client",
        avatarColor: "primary",
      }}
    />
  );
}
