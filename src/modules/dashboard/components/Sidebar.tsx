'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LucideIcon } from "lucide-react";
import { useAuth } from "@/app/api";

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
};

type SidebarConfig = {
  menuItems: MenuItem[];
  basePath: string;
  width: number;
  role: string;
  roleLabel: string;
  avatarColor?: 'primary' | 'accent';
};

type SidebarProps = {
  config: SidebarConfig;
};

export function Sidebar({ config }: SidebarProps) {
  const { menuItems, basePath, width, role, roleLabel, avatarColor = 'primary' } = config;
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const isActive = (href: string) => {
    if (href === basePath) {
      return pathname === basePath;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const displayName = user?.username || roleLabel;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const isCompact = width <= 200;

  const avatarColors = {
    primary: { bg: 'var(--primary-100)', text: 'var(--primary-700)' },
    accent: { bg: 'var(--accent-100)', text: 'var(--accent-700)' },
  };

  const colors = avatarColors[avatarColor];

  return (
    <div 
      className="h-screen fixed left-0 top-0 border-r"
      style={{ 
        width: `${width}px`,
        backgroundColor: 'white',
        borderColor: 'var(--neutral-200)' 
      }}
    >
      <div className="flex flex-col items-start justify-between h-full px-4 py-8">
        {/* Top Section */}
        <div className="flex flex-col gap-6 w-full">
          {/* Logo */}
          <div className={`w-full flex items-center justify-center ${isCompact ? 'h-12' : 'h-16'}`}>
            <Image
              src="/logo_dark.png"
              alt="CarService Logo"
              width={isCompact ? 120 : 150}
              height={isCompact ? 48 : 64}
              className="object-contain"
            />
          </div>

          {/* Menu */}
          <nav className="flex flex-col gap-1 w-full">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded transition-colors w-full"
                  style={{
                    backgroundColor: isActive(item.href) ? 'var(--primary-50)' : 'white',
                    color: isActive(item.href) ? 'var(--primary-700)' : 'var(--neutral-800)',
                  }}
                >
                  <div
                    style={{
                      color: isActive(item.href) ? 'var(--primary-500)' : 'var(--neutral-600)',
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`font-medium ${isCompact ? 'text-sm' : 'text-base'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section - User Profile */}
        <div className={`flex flex-col w-full ${isCompact ? 'gap-4' : 'gap-6'}`}>
          <div 
            className="h-px w-full" 
            style={{ backgroundColor: 'var(--neutral-200)' }} 
          />
          <div className={`flex items-center justify-between w-full ${isCompact ? '' : 'px-2'}`}>
            <div className={`flex items-center ${isCompact ? 'gap-2' : 'gap-3'}`}>
              <div 
                className={`overflow-hidden rounded-lg shrink-0 flex items-center justify-center ${
                  isCompact ? 'w-8 h-8' : 'w-10 h-10'
                }`}
                style={{ backgroundColor: colors.bg }}
              >
                <span 
                  className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}
                  style={{ color: colors.text }}
                >
                  {role === 'manager' ? 'TL' : avatarInitial}
                </span>
              </div>
              <div className="flex flex-col">
                <p 
                  className={`font-medium leading-4 ${
                    isCompact ? 'text-xs truncate max-w-[100px]' : 'text-[13px] leading-5'
                  }`}
                  style={{ color: 'var(--primary-950)' }}
                >
                  {role === 'manager' ? 'Service Manager' : displayName}
                </p>
                <p 
                  className={`${isCompact ? 'text-[10px] leading-3' : 'text-[10px] leading-4'}`}
                  style={{ color: isCompact ? 'var(--neutral-600)' : 'var(--neutral-700)' }}
                >
                  {roleLabel}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className={`transition-colors hover:opacity-70 ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`}
              style={{ color: 'var(--neutral-600)' }}
              title="Logout"
            >
              <LogOut className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
