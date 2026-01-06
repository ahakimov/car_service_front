import { services } from "../mapper";
import Link from "next/link";
import Container from "@/modules/layout/Container";

export default function OurServices() {
    return (
        <section className="w-full py-16 lg:py-20 bg-[var(--primary-50)]">
            <Container>
                {/* Title */}
                <h2 className="mb-16 text-center font-unbounded text-5xl font-bold tracking-tight text-[var(--primary-800)]">
                    OUR SERVICES
                </h2>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    {/* Left description */}
                    <div className="bg-[var(--primary-100)] p-8">
                        <h3 className="mb-4 font-unbounded text-lg font-normal text-[var(--primary-900)]">
                            TIRE SERVICES
                        </h3>

                        <p className="mb-6 text-sm leading-relaxed text-[var(--primary-950)]">
                            Tire services encompass tire rotation, balancing, alignment, and
                            replacement. Rotating tires ensures even wear, balancing eliminates
                            vibrations, alignment corrects suspension angles, and replacement
                            provides new tires when the old ones are worn out.
                        </p>

                        <Link
                            href="#contact"
                            className="inline-flex items-center gap-2 font-medium text-[var(--accent-700)] hover:underline"
                        >
                            Contact us <span className="text-xl">↓</span>
                        </Link>
                    </div>

                    {/* Services list */}
                    <div className="md:col-span-2">
                        <ul className="divide-y divide-[var(--primary-200)]">
                            {services.map((service) => (
                                <li
                                    key={service.id}
                                    className="
                    group flex items-center justify-between px-6 py-4
                    transition
                    hover:bg-[var(--primary-100)]
                    active:bg-[var(--primary-200)]
                  "
                                >
                                    <div className="flex items-center gap-4 text-[var(--primary-900)]">
                    <span className="text-sm">
                      {service.id.toString().padStart(2, "0")}
                    </span>

                                        <span className="font-unbounded text-sm font-semibold uppercase">
                      {service.title}
                    </span>
                                    </div>

                                    <Link
                                        href="#"
                                        className="text-sm text-[var(--primary-700)] hover:underline"
                                    >
                                        Details
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Container>
        </section>
    );
}
