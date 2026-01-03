"use client";

import { useState } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

type DateRange = {
    from?: Date;
    to?: Date;
};

type DateRangePickerProps = {
    value?: DateRange;
    onChange: (range: DateRange) => void;
    placeholder?: string;
};

export function DateRangePicker({ value, onChange, placeholder = "Select range" }: DateRangePickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (range: DateRange | undefined) => {
        if (range) {
            onChange(range);
        }
    };

    const formatRange = () => {
        if (!value?.from) return placeholder;
        if (!value.to) return format(value.from, "MMM d, yyyy");
        return `${format(value.from, "MMM d")} - ${format(value.to, "MMM d, yyyy")}`;
    };

    const presets = [
        { label: "Today", fn: () => ({ from: new Date(), to: new Date() }) },
        { label: "Yesterday", fn: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
        { label: "Last 7 days", fn: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
        { label: "Last 30 days", fn: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
        { label: "This week", fn: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
        { label: "This month", fn: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    ];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-base transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                        borderColor: "var(--neutral-400)",
                        backgroundColor: "white",
                        color: value?.from ? "var(--primary-950)" : "var(--neutral-500)",
                    }}
                >
                    <span>{formatRange()}</span>
                    <ChevronDown className="w-5 h-5" style={{ color: "var(--neutral-500)" }} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    <div className="border-r p-3 space-y-2" style={{ borderColor: "var(--neutral-200)" }}>
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    onChange(preset.fn());
                                    setOpen(false);
                                }}
                                className="block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
                                style={{ color: "var(--neutral-700)" }}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-3">
                        <Calendar
                            mode="range"
                            selected={value?.from ? { from: value.from, to: value.to } : undefined}
                            onSelect={handleSelect}
                            numberOfMonths={2}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
