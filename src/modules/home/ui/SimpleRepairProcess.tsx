import {ArrowDownIcon} from "lucide-react";
import {ContactButton} from "@/modules/home/ui/ContactButton";
import Container from "@/modules/layout/Container";

export const SimpleRepairProcess = () => {
    return (
        <section
            className={"w-full py-16 lg:py-20 bg-[var(--primary-50)]"}
        >
            <Container>
                <div className="flex flex-col gap-16">
                    <div className="max-w-2xl">
                        <div className="space-y-4">
                            <p
                                className="font-unbounded text-base font-normal uppercase leading-6 text-[var(--accent-800)]"
                            >
                                guaranteed satisfaction
                            </p>
                            <div className="space-y-2">
                                <h2
                                    className="font-unbounded text-3xl lg:text-4xl font-semibold uppercase leading-relaxed text-[var(--primary-800)]"
                                >
                                    Simple repair process
                                </h2>
                                <p
                                    className="text-base leading-6 max-w-lg text-[var(--primary-600)]"
                                >
                                    Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                                    massa mi. Aliquam in hendrerit urna. Pellentesque sit amet
                                    sapien fringilla, mattis ligula consectetur, ultrices.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                        <ProcessStep
                            number="01"
                            title="Appointment"
                            description="Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna."
                            buttonColor="text-accent-700"
                        />
                        <ProcessStep
                            number="02"
                            title="Diagnose issue"
                            description="Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna."
                            buttonColor="text-accent-700"
                        />
                        <ProcessStep
                            number="03"
                            title="complete repair"
                            description="Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna."
                            buttonColor="text-accent-600"
                        />
                    </div>
                </div>
            </Container>
        </section>
    );
};

function ProcessStep ({
                          number,
                          title,
                          description,
                          buttonColor,
                      }: {
    number: string;
    title: string;
    description: string;
    buttonColor: string;
})  {
    return (
        <div className="flex flex-col items-center gap-6 max-w-sm">
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-full max-w-[365px] h-16 flex items-center justify-center">
          <span
              className="font-unbounded text-6xl lg:text-7xl font-semibold uppercase leading-none absolute text-[var(--primary-100)]"
          >
            {number}
          </span>
                    <h3
                        className="font-unbounded text-2xl lg:text-3xl font-normal uppercase leading-none relative z-10 text-center text-[var(--primary-800)]"

                    >
                        {title}
                    </h3>
                </div>
                <p
                    className="text-center text-base leading-6 max-w-sm text-[var(--primary-600)]"
                >
                    {description}
                </p>
            </div>

            <ContactButton />
        </div>
    );
};