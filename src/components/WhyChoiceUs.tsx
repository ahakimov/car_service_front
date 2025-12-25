import Image from "next/image";
import FeatureItem from "@/components/FeatureItem";

export default function WhyChoiceUs() {
    return (
        <section className="w-full py-20 lg:py-24 bg-slate-800">
        <div className="max-w-[1440px] mx-auto px-8 lg:px-20">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                <div className="flex-1">
                    <Image
                        src="/car_repair_image.png"
                        alt="Car repair service"
                        width={556}
                        height={556}
                        className="w-full h-auto rounded-lg"
                    />
                </div>

                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <p className="font-unbounded text-base font-normal uppercase leading-6 text-red-500">
                            WHY CHOOSE US?
                        </p>
                        <div className="space-y-4">
                            <h2 className="font-unbounded text-3xl lg:text-4xl font-bold uppercase leading-tight text-white">
                                TRUSTED BY DRIVERS
                            </h2>
                            <p className="text-base leading-6 text-gray-300">
                                Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                                massa mi. Aliquam in hendrerit urna. Pellentesque sit amet
                                sapien fringilla, mattis ligula consectetur, ultrices.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
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
        </div>
    </section>
    )
}