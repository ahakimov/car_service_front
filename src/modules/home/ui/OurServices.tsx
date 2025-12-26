import { services } from "../mapper";
import Link from "next/link";

export default function OurServices() {
    return (
        <section className="bg-[#F4F6FB] py-24">
            <div className="mx-auto max-w-7xl px-6">
                {/* Title */}
                <h2 className="mb-16 text-center font-unbounded text-5xl font-bold tracking-tight text-[#3B4A8F]">
                    OUR SERVICES
                </h2>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    {/* Left description */}
                    <div className="bg-[#E9EDF7] p-8">
                        <h3 className="mb-4 font-unbounded text-lg font-normal text-[#1E2A5A]">
                            TIRE SERVICES
                        </h3>

                        <p className="mb-6 text-sm leading-relaxed text-[#3B4A8F]">
                            Tire services encompass tire rotation, balancing, alignment, and
                            replacement. Rotating tires ensures even wear, balancing eliminates
                            vibrations, alignment corrects suspension angles, and replacement
                            provides new tires when the old ones are worn out.
                        </p>

                        <Link
                            href="#contact"
                            className="inline-flex items-center gap-2 font-medium text-red-600 hover:underline"
                        >
                            Contact us <span className="text-xl">↓</span>
                        </Link>
                    </div>

                    {/* Services list */}
                    <div className="md:col-span-2">
                        <ul className="divide-y divide-[#D8DEEF]">
                            {services.map((service) => (
                                <li
                                    key={service.id}
                                    className="group flex items-center justify-between px-6 py-4 transition hover:bg-[#E2E9F7] active:bg-[#CBD8F2]"
                                >
                                    <div className="flex items-center gap-4">
                    <span className="text-sm text-[#3B4A8F]">
                      {service.id.toString().padStart(2, "0")}
                    </span>

                                        <span className="font-unbounded text-sm font-semibold uppercase text-[#1E2A5A]">
                      {service.title}
                    </span>
                                    </div>

                                    <Link href="#" className="text-sm text-[#3B4A8F] ">
                    Details
                  </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
