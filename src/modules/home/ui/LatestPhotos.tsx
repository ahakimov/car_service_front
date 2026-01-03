import Image from "next/image";
import Container from "@/modules/layout/Container";

export default function LatestPhotos() {
    return (
        <section
            className="w-full py-16 lg:py-20"
            style={{ backgroundColor: "var(--primary-50)" }}
        >
            <Container>
                <div className="flex flex-col items-center gap-16">
                    <h2
                        className="text-center font-unbounded text-4xl lg:text-6xl xl:text-7xl font-semibold uppercase"
                        style={{ color: "var(--primary-800)" }}
                    >
                        Latest photos
                    </h2>

                    {/* GRID WITH FIXED GEOMETRY */}
                    <div
                        className="
              grid w-full gap-5
              lg:grid-cols-2 lg:grid-rows-2
              aspect-[16/9]
            "
                    >
                        {/* LEFT – spans 2 rows */}
                        <div className="relative row-span-2 overflow-hidden ">
                            <Image
                                src="/image_car_example_1.png"
                                alt="Car repair example 1"
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>

                        {/* RIGHT TOP */}
                        <div className="relative overflow-hidden ">
                            <Image
                                src="/image_car_example_2.png"
                                alt="Car repair example 2"
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>

                        {/* RIGHT BOTTOM */}
                        <div className="relative overflow-hidden ">
                            <Image
                                src="/image_car_example_3.png"
                                alt="Car repair example 3"
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
