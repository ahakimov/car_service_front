import Image from "next/image";
import {ContactButton} from "@/modules/home/ui/ContactButton";
import TeamMember from "@/modules/home/ui/TeamMember";
import Container from "@/modules/layout/Container";

export function Team() {
    return (
        <section
            className="w-full py-16 lg:py-20 bg-[var(--primary-100)]"
        >
            <Container>
                <div className="flex flex-col gap-12">
                    <div className="space-y-4">
                        <p
                            className="font-unbounded text-base font-normal uppercase leading-6 text-[var(--accent-800)]"
                        >
                            top quality
                        </p>
                        <div className="space-y-3">
                            <h2
                                className="font-unbounded text-3xl lg:text-4xl font-semibold uppercase leading-relaxed text-[var(--primary-800)]"
                            >
                                Skilled team
                            </h2>
                            <p
                                className="text-base leading-6 max-w-md mb-4 text-[var(--primary-600)]"
                            >
                                Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                                massa mi.
                            </p>
                            <ContactButton />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        <TeamMember
                            name="Jan Kowalski"
                            role="Master Technician"
                            experience={11}
                            imageUrl="/specialist_1.png"
                        />
                        <TeamMember
                            name="Marek Zieliński"
                            role="Exhaust System Specialist"
                            experience={20}
                            imageUrl="/specialist_2.png"
                        />
                        <TeamMember
                            name="Piotr Wiśniewski"
                            role="Brake and Suspension Specialist"
                            experience={12}
                            imageUrl="/specialist_3.png"
                        />
                        <TeamMember
                            name="Krzysztof Wójcik"
                            role="Transmission Specialist"
                            experience={8}
                            imageUrl="/specialist_4.png"
                        />
                    </div>
                </div>
            </Container>
        </section>
    );
}
