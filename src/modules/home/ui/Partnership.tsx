import Image from "next/image";
import Container from "@/modules/layout/Container";

export default function Partnership() {
    return (
        <section
            className="w-full py-16 lg:py-20"
            style={{ backgroundColor: "var(--primary-50)" }}
        >
            <Container>
                <div className="flex flex-col items-center gap-8">
                    <p
                        className="text-center text-base font-medium leading-6"
                        style={{ color: "var(--primary-800)" }}
                    >
                        In partnership with:
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-between items-center gap-8 w-full">
                        <Image
                            src="/Company logo.png"
                            alt="Company logo"
                            width={146}
                            height={48}
                            className="h-8 lg:h-12 w-auto"
                        />
                        <Image
                            src="/Company logo2.png"
                            alt="Company logo"
                            width={169}
                            height={48}
                            className="h-8 lg:h-12 w-auto"
                        />
                        <Image
                            src="/Company logo3.png"
                            alt="Company logo"
                            width={183}
                            height={48}
                            className="h-8 lg:h-12 w-auto"
                        />
                        <Image
                            src="/Company logo4.png"
                            alt="Company logo"
                            width={160}
                            height={48}
                            className="h-8 lg:h-12 w-auto"
                        />
                        <Image
                            src="/Company logo5.png"
                            alt="Company logo"
                            width={187}
                            height={48}
                            className="h-8 lg:h-12 w-auto"
                        />
                    </div>
                </div>
            </Container>
        </section>
    )
}
