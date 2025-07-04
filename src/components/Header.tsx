"use client";

import Image from "next/image";
import { useState } from "react";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="absolute top-0 left-0 right-0 z-50 flex w-full max-w-screen-xl mx-auto px-8 lg:px-0 h-24 justify-between items-center">
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

            {/* Mobile Menu Button */}
            <button
                className="lg:hidden flex flex-col gap-1 p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
            >
                <span className="w-6 h-0.5 bg-white transition-all duration-300"></span>
                <span className="w-6 h-0.5 bg-white transition-all duration-300"></span>
                <span className="w-6 h-0.5 bg-white transition-all duration-300"></span>
            </button>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div
                    className="absolute top-full left-0 right-0 border-t lg:hidden"
                    style={{
                        backgroundColor: "var(--primary-950)",
                        borderColor: "var(--primary-800)",
                    }}
                >
                    <div className="flex flex-col p-4 space-y-2">
                        <NavItem href="#home" mobile active>
                            Home
                        </NavItem>
                        <NavItem href="#about" mobile>
                            About us
                        </NavItem>
                        <NavItem href="#services" mobile>
                            Services
                        </NavItem>
                        <NavItem href="#process" mobile>
                            Process
                        </NavItem>
                        <NavItem href="#team" mobile>
                            Team
                        </NavItem>

                        <div className="pt-4 space-y-2">
                            <button className="w-full text-left px-2 py-2 text-gray-50 hover:bg-white/10 rounded text-sm">
                                Track your status
                            </button>
                            <button className="w-full text-left px-2 py-2 text-gray-50 hover:bg-white/10 rounded text-sm">
                                Log in
                            </button>
                            <button
                                className="w-full px-4 py-2 rounded text-sm"
                                style={{
                                    backgroundColor: "var(--primary-600)",
                                    color: "var(--primary-50)",
                                }}
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

interface NavItemProps {
    href: string;
    children: React.ReactNode;
    active?: boolean;
    mobile?: boolean;
}

function NavItem({
                     href,
                     children,
                     active = false,
                     mobile = false,
                 }: NavItemProps) {
    const baseClasses = mobile
        ? "block px-2 py-2 text-sm font-unbounded uppercase transition-colors"
        : "flex items-center justify-center px-2 py-2 text-sm lg:text-base font-unbounded uppercase transition-colors";

    return (
        <a
            href={href}
            className={baseClasses}
            style={{
                color: active ? "var(--primary-500)" : "var(--primary-100)",
            }}
        >
            {children}
        </a>
    );
}
