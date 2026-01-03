import ContactForm from "../../../components/ContactForm";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero_image.jpg"
                    alt="Car repair background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-[var(--neutral-950)]/30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 lg:px-20 pt-24">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-16">
                    <div className="flex-1 pt-16 lg:pt-32">
                        <div className="space-y-6">
                            <p className="font-unbounded text-lg lg:text-2xl font-medium uppercase leading-loose tracking-wide text-[var(--accent-400)]">
                                Best Car Repair Shop
                            </p>

                            <div className="space-y-4">
                                <h1 className="font-unbounded text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black uppercase leading-tight text-[var(--accent-50)]">
                                    Drive With
                                </h1>
                                <h1 className="font-unbounded text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black uppercase leading-tight pl-8 text-[var(--accent-50)]">
                                    Confidence
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto lg:min-w-[416px] pt-8 lg:pt-16">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </section>
    );
}