import Image from "next/image";
import FeatureItem from "@/modules/home/ui/FeatureItem";
import Container from "@/modules/layout/Container";

export default function WhyChoiceUs() {
    return (
        <section className="w-full py-16 lg:py-20 bg-[var(--primary-950)]">
            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* LEFT IMAGE */}
                    <div className="flex-1">
                        <Image
                            src="/car_repair_image.png"
                            alt="Car repair service"
                            width={556}
                            height={556}
                            className="w-full h-auto rounded-lg"
                        />
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="flex-1 flex flex-col justify-between h-full">
                        {/* TOP */}
                        <div className="space-y-4">
                            <p className="font-unbounded text-base font-normal uppercase leading-6 text-[var(--danger-500)]">
                                WHY CHOOSE US?
                            </p>

                            <h2 className="font-unbounded text-3xl lg:text-4xl font-bold uppercase leading-tight text-[var(--neutral-50)]">
                                TRUSTED BY DRIVERS
                            </h2>

                            <p className="text-base leading-6 text-[var(--neutral-300)]">
                                Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                                massa mi. Aliquam in hendrerit urna. Pellentesque sit amet
                                sapien fringilla, mattis ligula consectetur, ultrices.
                            </p>
                        </div>

                        {/* BOTTOM */}
                        <div className="mt-12 space-y-6">
                            <FeatureItem
                                title="EXPERTISE & EXPERIENCE"
                                description="Lorem ipsum dolor sit amet consectetur adipiscing elit ut et massa mi."
                            />
                            <FeatureItem
                                title="ATTENTION TO DETAILS"
                                description="Lorem ipsum dolor sit amet consectetur adipiscing elit ut et massa mi."
                            />
                            <FeatureItem
                                title="CUSTOMER SATISFACTION"
                                description="Lorem ipsum dolor sit amet consectetur adipiscing elit ut et massa mi."
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
