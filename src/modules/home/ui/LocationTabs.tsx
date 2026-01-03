'use client';

import React, { useState, useRef, useEffect } from 'react';
import Container from "@/modules/layout/Container";

interface Location {
    id: number;
    city: string;
    address: string;
    postalCode: string;
    workingHours: {
        weekdays: string;
        weekend: string;
    };
    contact: {
        email: string;
        phones: string[];
    };
}

const LocationTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [cardOffset, setCardOffset] = useState(0);
    const [cardWidth, setCardWidth] = useState(457);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const locations: Location[] = [
        {
            id: 0,
            city: 'Warsaw',
            address: 'Instalatorów 23,',
            postalCode: '02-237',
            workingHours: {
                weekdays: 'Mon - Sat: 08:00 - 22:00',
                weekend: 'Sun: 08:00 - 20:00',
            },
            contact: {
                email: 'support@carservice.pl',
                phones: ['+48 676 787 986', '+48 234 753 349'],
            },
        },
        {
            id: 1,
            city: 'Warsaw',
            address: 'Żwirki i Wigury 61,',
            postalCode: '02-091',
            workingHours: {
                weekdays: 'Mon - Sat: 09:00 - 21:00',
                weekend: 'Sun: 09:00 - 19:00',
            },
            contact: {
                email: 'zwirki@carservice.pl',
                phones: ['+48 676 787 987', '+48 234 753 350'],
            },
        },
        {
            id: 2,
            city: 'Warsaw',
            address: 'Al. Jerozolimskie 168,',
            postalCode: '02-34',
            workingHours: {
                weekdays: 'Mon - Sat: 08:00 - 22:00',
                weekend: 'Sun: 08:00 - 20:00',
            },
            contact: {
                email: 'jerozolimskie@carservice.pl',
                phones: ['+48 676 787 988', '+48 234 753 351'],
            },
        },
        {
            id: 3,
            city: 'Warsaw',
            address: 'Al. Jerozolimskie 179,',
            postalCode: '02-22',
            workingHours: {
                weekdays: 'Mon - Sat: 08:00 - 22:00',
                weekend: 'Sun: 08:00 - 20:00',
            },
            contact: {
                email: 'jerozolimskie179@carservice.pl',
                phones: ['+48 676 787 989', '+48 234 753 352'],
            },
        },
    ];

    const activeLocation = locations[activeTab];

    useEffect(() => {
        // Calculate the left offset and width based on active tab position
        const calculatePosition = () => {
            if (activeTab <= 1) {
                // For tabs 0 and 1, align to the left and span first two tabs
                setCardOffset(0);
                let width = 0;
                for (let i = 0; i < 2; i++) {
                    if (tabRefs.current[i]) {
                        width += tabRefs.current[i]!.offsetWidth;
                    }
                }
                setCardWidth(width || 457);
            } else {
                // For tabs 2 and 3, align to the right and span last two tabs
                let offset = 0;
                let width = 0;
                // Calculate offset (width of first two tabs)
                for (let i = 0; i < 2; i++) {
                    if (tabRefs.current[i]) {
                        offset += tabRefs.current[i]!.offsetWidth;
                    }
                }
                // Calculate width (width of last two tabs)
                for (let i = 2; i < 4; i++) {
                    if (tabRefs.current[i]) {
                        width += tabRefs.current[i]!.offsetWidth;
                    }
                }
                setCardOffset(offset);
                setCardWidth(width || 492);
            }
        };

        calculatePosition();

        // Recalculate on window resize
        window.addEventListener('resize', calculatePosition);
        return () => window.removeEventListener('resize', calculatePosition);
    }, [activeTab]);

    return (
        <section className="w-full py-16 lg:py-20" style={{ backgroundColor: 'var(--primary-50)' }}>
            <Container>
                <div className="flex flex-col gap-8 lg:gap-12">
                    {/* Header */}
                    <div className="flex flex-col">
                        <h2
                            className="font-unbounded font-semibold text-2xl sm:text-3xl lg:text-[39px] leading-tight lg:leading-[64px] uppercase"
                            style={{ color: 'var(--primary-800)' }}
                        >
                            locate our nearest
                            <br className="lg:hidden" />{' '}
                            <span className="hidden lg:inline"><br /></span>
                            car repair shop
                        </h2>
                    </div>

                    {/* Mobile Accordion (visible on mobile/tablet) */}
                    <div className="flex flex-col gap-4 lg:hidden">
                        {locations.map((location, index) => (
                            <div
                                key={location.id}
                                className="rounded overflow-hidden"
                                style={{ backgroundColor: 'var(--primary-100)' }}
                            >
                                {/* Accordion Header */}
                                <button
                                    onClick={() => setActiveTab(activeTab === index ? -1 : index)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                                >
                                    <div className="flex-1">
                                        <p
                                            className="font-unbounded font-normal text-lg sm:text-xl uppercase mb-1"
                                            style={{ color: 'var(--primary-800)' }}
                                        >
                                            {location.city}
                                        </p>
                                        <div className="text-sm" style={{ color: 'var(--primary-600)' }}>
                                            <p className="mb-0">{location.address} {location.postalCode}</p>
                                        </div>
                                    </div>
                                    <div
                                        className="ml-4 transition-transform duration-200"
                                        style={{
                                            transform: activeTab === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                            color: 'var(--primary-800)'
                                        }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </button>

                                {/* Accordion Content */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        activeTab === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="px-6 pb-6 pt-2 space-y-6">
                                        {/* Working Hours */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2 items-center">
                                                <div className="w-5 h-5 flex-shrink-0">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--accent-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M12 6V12L16 14" stroke="var(--accent-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                                <p
                                                    className="font-unbounded font-normal text-sm uppercase mb-0"
                                                    style={{ color: 'var(--accent-800)' }}
                                                >
                                                    Working hours
                                                </p>
                                            </div>
                                            <div className="font-normal text-sm leading-6" style={{ color: 'var(--primary-700)' }}>
                                                <p className="mb-0">{location.workingHours.weekdays}</p>
                                                <p className="mb-0">{location.workingHours.weekend}</p>
                                            </div>
                                        </div>

                                        {/* Get in Touch */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2 items-center">
                                                <div className="w-5 h-5 flex-shrink-0">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09501 3.90347 2.12788 3.62476 2.21649 3.36162C2.30511 3.09849 2.44757 2.85669 2.63477 2.65162C2.82196 2.44655 3.04981 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59524 1.99522 8.06572 2.16708 8.43369 2.48353C8.80166 2.79999 9.04201 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="var(--accent-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                                <p
                                                    className="font-unbounded font-normal text-sm uppercase mb-0"
                                                    style={{ color: 'var(--accent-800)' }}
                                                >
                                                    get in touch
                                                </p>
                                            </div>
                                            <div className="font-normal text-sm leading-6" style={{ color: 'var(--primary-700)' }}>
                                                <p className="mb-0">{location.contact.email}</p>
                                                {location.contact.phones.map((phone, idx) => (
                                                    <p key={idx} className="mb-0">{phone}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Tabs (visible on desktop) */}
                    <div className="hidden lg:flex flex-col">
                        {/* Tabs Row */}
                        <div className="flex relative">
                            {locations.map((location, index) => (
                                <button
                                    key={location.id}
                                    ref={(el) => (tabRefs.current[index] = el)}
                                    onClick={() => setActiveTab(index)}
                                    className={`
                      flex flex-col gap-1 px-8 py-[34px] 
                      ${index === 0 ? '' : 'w-[246px]'}
                      ${activeTab === index
                                        ? 'rounded-tl rounded-tr'
                                        : ''
                                    }
                      transition-colors duration-200 hover:bg-[var(--accent-neutral-50)] cursor-pointer
                    `}
                                    style={{
                                        backgroundColor: activeTab === index ? 'var(--primary-100)' : 'var(--accent-neutral-50)',
                                    }}
                                >
                                    <p
                                        className="font-unbounded font-normal text-[25px] leading-10 uppercase text-left whitespace-nowrap mb-0"
                                        style={{ color: 'var(--primary-800)' }}
                                    >
                                        {location.city}
                                    </p>
                                    <div className="font-normal text-base leading-6 text-left" style={{ color: 'var(--primary-600)' }}>
                                        <p className="mb-0">{location.address}</p>
                                        <p className="mb-0">{location.postalCode}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Contact Info Card */}
                        <div
                            className="rounded p-8 flex justify-between transition-all duration-300"
                            style={{
                                marginLeft: `${cardOffset}px`,
                                width: `${cardWidth}px`,
                                backgroundColor: 'var(--primary-100)'
                            }}
                        >
                            {/* Working Hours */}
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-1 items-start">
                                    <div className="w-6 h-6 flex-shrink-0">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--accent-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 6V12L16 14" stroke="var(--accent-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <p
                                        className="font-unbounded font-normal text-base leading-6 uppercase mb-0 whitespace-nowrap"
                                        style={{ color: 'var(--accent-800)' }}
                                    >
                                        Working hours
                                    </p>
                                </div>
                                <div className="font-normal text-base leading-6" style={{ color: 'var(--primary-700)' }}>
                                    <p className="mb-0 whitespace-nowrap">{activeLocation.workingHours.weekdays}</p>
                                    <p className="mb-0 whitespace-nowrap">{activeLocation.workingHours.weekend}</p>
                                </div>
                            </div>

                            {/* Get in Touch */}
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-1 items-start">
                                    <div className="w-6 h-6 flex-shrink-0">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09501 3.90347 2.12788 3.62476 2.21649 3.36162C2.30511 3.09849 2.44757 2.85669 2.63477 2.65162C2.82196 2.44655 3.04981 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59524 1.99522 8.06572 2.16708 8.43369 2.48353C8.80166 2.79999 9.04201 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="var(--accent-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <p
                                        className="font-unbounded font-normal text-base leading-6 uppercase mb-0 whitespace-nowrap"
                                        style={{ color: 'var(--accent-800)' }}
                                    >
                                        get in touch
                                    </p>
                                </div>
                                <div className="font-normal text-base leading-6" style={{ color: 'var(--primary-700)' }}>
                                    <p className="mb-0 whitespace-nowrap">{activeLocation.contact.email}</p>
                                    {activeLocation.contact.phones.map((phone, index) => (
                                        <p key={index} className="mb-0 whitespace-nowrap">{phone}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default LocationTabs;