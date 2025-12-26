import Image from "next/image"
export default function FeatureItem({
                                        title,
                                        description,
                                    }: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-[var(--primary-900)] rounded flex items-center justify-center flex-shrink-0 mt-1">
                <Image src="/thumbs-up.png" width={40} height={40} alt="thumbs-up" />
            </div>

            <div className="flex min-h-20 flex-col">
                <h3 className="font-unbounded text-base font-bold uppercase text-white mb-auto">
                    {title}
                </h3>

                <p className="text-sm text-gray-300 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>

    );
}