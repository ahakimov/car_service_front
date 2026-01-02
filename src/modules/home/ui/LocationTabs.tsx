"use client";

import { useLayoutEffect, useRef, useState } from "react";

const DETAILS_HEIGHT = 320;

const locations = [
    { city: "WARSAW", address: "Instalatorów 23,", code: "02-237" },
    { city: "WARSAW", address: "Żwirki i Wigury 61,", code: "02-091" },
    { city: "WARSAW", address: "Al. Jerozolimskie 168,", code: "02-034" },
    { city: "WARSAW", address: "Al. Jerozolimskie 179,", code: "02-022" },
];

export default function LocationTabs() {
    const [active, setActive] = useState(1);
    const btnRefs = useRef<HTMLButtonElement[]>([]);
    const [panel, setPanel] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const el = btnRefs.current[active];
        if (!el) return;

        setPanel({
            left: el.offsetLeft,
            width: el.offsetWidth,
        });
    }, [active]);

    return (
        <div className="relative pb-[360px]">
            {/* TOP BUTTONS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
                {locations.map((l, i) => (
                    <button
                        key={i}
                        ref={(el) => (btnRefs.current[i] = el!)}
                        onClick={() => setActive(i)}
                        className={`
              text-left p-6 transition
              ${i === active
                            ? "bg-[#EEF3FD] rounded-t-xl"
                            : "hover:bg-[#F3F6FC] rounded-xl"}
            `}
                    >
                        <h3
                            className={`font-unbounded text-xl font-bold uppercase mb-2
                ${i === active ? "text-blue-900" : "text-blue-900"}
              `}
                        >
                            {l.city}
                        </h3>

                        <p
                            className={`text-sm
                ${i === active ? "text-blue-700" : "text-blue-700"}
              `}
                        >
                            {l.address}
                            <br />
                            {l.code}
                        </p>
                    </button>
                ))}
            </div>

            {/* DETAILS PANEL */}
            <div
                className="
          absolute
          bg-[#EEF3FD]
          p-8
          transition-[left]
          duration-300
        "
                style={{
                    left: panel.left,
                    width: panel.width,
                    height: DETAILS_HEIGHT,
                }}
            >
                <div className="space-y-12">
                    <InfoBlock title="Working Hours" icon={<IconClock />}>
                        <p>Mon – Sat: 08:00 – 22:00</p>
                        <p>Sun: 08:00 – 20:00</p>
                    </InfoBlock>

                    <InfoBlock title="Get in Touch" icon={<IconPhone />}>
                        <p>support@carservice.pl</p>
                        <p>+48 676 787 986</p>
                        <p>+48 234 753 349</p>
                    </InfoBlock>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------- */
/* SMALL COMPONENTS                    */
/* ---------------------------------- */

function InfoBlock({
                       title,
                       icon,
                       children,
                   }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-5">
            {icon}
            <div>
                <p className="text-red-600 font-bold uppercase text-sm mb-1">
                    {title}
                </p>
                <div className="text-blue-800 text-sm space-y-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

function IconClock() {
    return (
        <div className="w-9 h-9 rounded-full border-2 border-red-600 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2" />
                <path
                    d="M12 7v6l4 2"
                    stroke="#DC2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

function IconPhone() {
    return (
        <div className="w-9 h-9 rounded-full border-2 border-red-600 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                    d="M22 16.9v3c0 1-1 2-2 2C11 21.9 2.1 13 2.1 4c0-1 1-2 2-2h3"
                    stroke="#DC2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}
