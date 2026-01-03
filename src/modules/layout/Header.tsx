"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar, Wrench, Users, BookOpen, Settings, Menu, X } from "lucide-react";
import Link from "next/link";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? "bg-[var(--primary-950)]/80 backdrop-blur-md shadow-lg" : "bg-transparent"
            }`}
        >
            <div className="flex w-full max-w-screen-xl mx-auto px-8 lg:px-0 h-24 justify-between items-center">
                <div className="relative">
                    <Image
                        src="/logo_white.png"
                        alt="Car Repair Logo"
                        width={127}
                        height={96}
                        className="w-[80px] h-[60px] lg:w-[127px] lg:h-[96px]"
                        priority
                    />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-16">
                    <div className="flex items-center gap-3">
                        <NavItem href="#home" active>
                            Home
                        </NavItem>
                        <NavItem href="#about">About us</NavItem>
                        <NavItem href="#services">Services</NavItem>
                        <NavItem href="#process">Process</NavItem>
                        <NavItem href="#team">Team</NavItem>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center justify-center px-3 py-2.5 rounded-lg text-gray-50 hover:bg-white/10 transition-colors text-sm lg:text-base">
                            Track your status
                        </button>
                        <button className="flex items-center justify-center px-3 py-2.5 rounded-lg text-gray-50 hover:bg-white/10 transition-colors text-sm lg:text-base min-w-[124px]">
                            Log in
                        </button>
                        <button
                            className="flex items-center justify-center px-4 py-2.5 rounded-lg border transition-colors text-sm lg:text-base min-w-[124px] shadow-sm hover:opacity-90"
                            style={{
                                backgroundColor: "var(--primary-600)",
                                borderColor: "var(--primary-600)",
                                color: "var(--primary-50)",
                            }}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Trigger */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <button
                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            <Menu className="w-6 h-6 text-white" />
                        </button>
                    </SheetTrigger>

                    <SheetContent
                        side="left"
                        className="w-[288px] p-0 flex flex-col justify-between border-r"
                        style={{
                            backgroundColor: "white",
                            borderColor: "var(--neutral-200)",
                        }}
                    >
                        <MobileSidebar onClose={() => setIsMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}

interface NavItemProps {
    href: string;
    children: React.ReactNode;
    active?: boolean;
}

function NavItem({ href, children, active = false }: NavItemProps) {
    return (
        <a
            href={href}
            className="flex items-center justify-center px-2 py-2 text-sm lg:text-base font-unbounded uppercase transition-colors"
            style={{
                color: active ? "var(--primary-500)" : "var(--primary-100)",
            }}
        >
            {children}
        </a>
    );
}

// Mobile Sidebar Component matching Figma design
function MobileSidebar({ onClose }: { onClose: () => void }) {
    const menuItems = [
        {
            icon: Calendar,
            label: "Reservations",
            href: "/reservations",
            isActive: true,
        },
        {
            icon: Wrench,
            label: "Mechanics",
            href: "/mechanics",
            isActive: false,
        },
        {
            icon: Users,
            label: "Clients",
            href: "/clients",
            isActive: false,
        },
        {
            icon: BookOpen,
            label: "Schedule",
            href: "/schedule",
            isActive: false,
        },
        {
            icon: Settings,
            label: "Settings",
            href: "/settings",
            isActive: false,
        },
    ];

    return (
        <>
            {/* Top Section */}
            <div className="flex flex-col gap-6 px-4 py-8">
                {/* Logo */}
                <div className="h-16 w-full flex items-center justify-center">
                    <Image
                        src="/logo_dark.png"
                        alt="CarService Logo"
                        width={150}
                        height={64}
                        className="object-contain"
                    />
                </div>

                {/* Menu Items */}
                <nav className="flex flex-col gap-1 w-full">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-2 px-3 py-2 rounded transition-colors"
                            style={{
                                backgroundColor: item.isActive ? "var(--primary-50)" : "white",
                                color: item.isActive ? "var(--primary-700)" : "var(--neutral-900)",
                            }}
                        >
                            <item.icon
                                className="w-6 h-6"
                                style={{
                                    color: item.isActive ? "var(--primary-500)" : "var(--neutral-700)",
                                }}
                            />
                            <span className="font-medium text-base leading-6">
                {item.label}
              </span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Bottom Section - Profile */}
            <div className="flex flex-col gap-6 px-4 pb-8">
                {/* Divider */}
                <div
                    className="w-full h-px"
                    style={{ backgroundColor: "var(--neutral-200)" }}
                />

                {/* Profile */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                                src="/profile.jpg"
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <p
                                className="text-[13px] font-medium leading-6"
                                style={{ color: "var(--primary-950)" }}
                            >
                                Tomasz Lewandowski
                            </p>
                            <p
                                className="text-[10px] leading-4"
                                style={{ color: "var(--neutral-800)" }}
                            >
                                Service Manager
                            </p>
                        </div>
                    </div>
                    <button
                        className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                        aria-label="Profile options"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3 10H17"
                                stroke="var(--neutral-700)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M3 5H17"
                                stroke="var(--neutral-700)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M3 15H17"
                                stroke="var(--neutral-700)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}