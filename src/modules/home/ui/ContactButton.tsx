import {ArrowDownIcon} from "lucide-react";

export const ContactButton = () => {
    return (
        <button
            className={`flex items-center gap-2 text-[var(--accent-700)] font-unbounded text-base font-normal uppercase hover:opacity-80 transition-opacity`}
        >
            Contact us
            <ArrowDownIcon />
        </button>
    );
};
