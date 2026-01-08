import Image from "next/image";

export function RedCarSection() {
    return (
        <section className="relative w-full h-[400px] lg:h-[600px] xl:h-[785px]">
            <Image
                src={"/image_red_car.png"}
                alt="Red car background"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center h-full">
                <div className="max-w-screen-xl mx-auto px-8 lg:px-20">
                    <h2
                        className="font-unbounded text-3xl sm:text-4xl lg:text-6xl xl:text-7xl text-[var(--accent-50)] font-semibold uppercase leading-tight max-w-4xl"
                    >
                        Increasing trust through Skilled work
                    </h2>
                </div>
            </div>
        </section>
    );
}
