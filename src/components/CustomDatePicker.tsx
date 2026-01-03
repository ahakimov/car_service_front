'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface CustomDatePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
                                                               value,
                                                               onChange,
                                                               placeholder = 'Select date',
                                                           }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
    const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());
    const [hoveredDate, setHoveredDate] = useState<Date | undefined>();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get days from previous month to fill the grid
    const startDayOfWeek = monthStart.getDay();
    const daysFromPrevMonth = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Get days from next month to fill the grid
    const totalDaysShown = daysInMonth.length + daysFromPrevMonth;
    const daysFromNextMonth = totalDaysShown % 7 === 0 ? 0 : 7 - (totalDaysShown % 7);

    const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
    const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) => {
        const day = new Date(prevMonthEnd);
        day.setDate(day.getDate() - daysFromPrevMonth + i + 1);
        return day;
    });

    const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
    const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) => {
        const day = new Date(nextMonthStart);
        day.setDate(day.getDate() + i);
        return day;
    });

    const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleApply = () => {
        if (onChange && selectedDate) {
            onChange(selectedDate);
        }
        setIsOpen(false);
    };

    const handleCancel = () => {
        setSelectedDate(value);
        setIsOpen(false);
    };

    const getDayClassName = (day: Date) => {
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isTodayDate = isToday(day);
        const isHovered = hoveredDate && isSameDay(day, hoveredDate);

        return cn(
            'relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors',
            {
                // Text colors
                'text-[var(--neutral-600)]': !isCurrentMonth,
                'text-[var(--neutral-900)]': isCurrentMonth && !isSelected,
                'text-white font-medium': isSelected,

                // Background colors
                'bg-[var(--primary-600)]': isSelected,
                'bg-[var(--neutral-100)]': isTodayDate && !isSelected,
                'bg-[var(--primary-50)] text-[var(--primary-700)]': isHovered && !isSelected,

                // Hover state
                'hover:bg-[var(--primary-50)] hover:text-[var(--primary-700)]': !isSelected,
            }
        );
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'h-11 w-full justify-start text-left font-normal rounded-lg px-[18px] py-[10px]',
                        !selectedDate && 'text-muted-foreground'
                    )}
                    style={{
                        borderColor: 'var(--neutral-400)',
                        backgroundColor: selectedDate ? 'var(--neutral-200)' : 'white',
                        color: selectedDate ? 'var(--neutral-900)' : 'var(--neutral-600)',
                        fontWeight: selectedDate ? 500 : 400,
                    }}
                >
                    <CalendarIcon
                        className="mr-2 h-5 w-5 flex-shrink-0"
                        style={{
                            color: selectedDate ? 'var(--neutral-900)' : 'var(--neutral-600)'
                        }}
                    />
                    {selectedDate ? format(selectedDate, 'dd.MM.yyyy') : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[328px] p-0 rounded-lg"
                align="start"
                style={{
                    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.1), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
                }}
            >
                <div className="flex flex-col">
                    {/* Calendar Header */}
                    <div className="px-6 py-5">
                        <div className="flex flex-col gap-3">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between w-full">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePrevMonth}
                                    className="h-10 w-10 p-0 rounded-lg hover:bg-transparent"
                                >
                                    <ChevronLeft
                                        className="h-5 w-5"
                                        style={{ color: 'var(--neutral-600)' }}
                                    />
                                </Button>
                                <span
                                    className="text-base font-medium"
                                    style={{ color: 'var(--neutral-900)' }}
                                >
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleNextMonth}
                                    className="h-10 w-10 p-0 rounded-lg hover:bg-transparent"
                                >
                                    <ChevronRight
                                        className="h-5 w-5"
                                        style={{ color: 'var(--neutral-600)' }}
                                    />
                                </Button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-0">
                                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Su'].map((day) => (
                                    <div
                                        key={day}
                                        className="w-10 h-10 flex items-center justify-center text-sm font-medium"
                                        style={{ color: 'var(--neutral-900)' }}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-0">
                                {allDays.map((day, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleDateSelect(day)}
                                        onMouseEnter={() => setHoveredDate(day)}
                                        onMouseLeave={() => setHoveredDate(undefined)}
                                        className={getDayClassName(day)}
                                    >
                    <span className="text-sm">
                      {day.getDate()}
                    </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div
                        className="w-full h-px"
                        style={{ backgroundColor: 'var(--neutral-200)' }}
                    />

                    {/* Action Buttons */}
                    <div className="px-6 py-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1 h-11 rounded-lg font-medium"
                            style={{
                                borderColor: 'var(--neutral-400)',
                                color: 'var(--neutral-900)',
                                backgroundColor: 'white',
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApply}
                            className="flex-1 h-11 rounded-lg font-medium"
                            style={{
                                backgroundColor: 'var(--primary-600)',
                                borderColor: 'var(--primary-600)',
                            }}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default CustomDatePicker;