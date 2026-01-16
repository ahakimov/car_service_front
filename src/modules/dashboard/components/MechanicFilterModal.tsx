'use client';

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";

type MechanicFilter = {
  dateRange?: { from?: Date; to?: Date };
  shift?: string;
  specialty?: string;
  status?: string;
};

type MechanicFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: MechanicFilter) => void;
  currentFilter?: MechanicFilter;
};

const SHIFT_OPTIONS = ['morning', 'afternoon', 'evening', 'night'] as const;
const SPECIALTY_OPTIONS = [
  { value: 'engine-diagnostics', label: 'Engine Diagnostics' },
  { value: 'suspension-steering', label: 'Suspension and Steering Repair' },
  { value: 'electrical', label: 'Electrical System Repair' },
  { value: 'brake-service', label: 'Brake Service' },
  { value: 'oil-change', label: 'Oil Change' },
  { value: 'transmission', label: 'Transmission Repair' },
];
const STATUS_OPTIONS = ['available', 'busy', 'on leave'] as const;

export function MechanicFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilter,
}: MechanicFilterModalProps) {
  const [filters, setFilters] = useState<MechanicFilter>(currentFilter || {});

  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilter || {});
    }
  }, [isOpen, currentFilter]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => setFilters({});

  const handleCancel = () => {
    setFilters(currentFilter || {});
    onClose();
  };

  if (!isOpen) return null;

  const selectStyle = {
    base: "w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2",
    border: { borderColor: 'var(--neutral-400)' },
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(35, 40, 72, 0.2)' }}
        onClick={onClose}
      />

      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[600px] z-50 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'white' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-xl" style={{ color: 'var(--primary-950)' }}>
            Filter by
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:opacity-70 transition-colors"
            style={{ color: 'var(--neutral-500)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-sm" style={{ color: 'var(--neutral-900)' }}>
              Date range:
            </label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => setFilters({ ...filters, dateRange: range })}
              placeholder="Select range"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-sm" style={{ color: 'var(--neutral-900)' }}>
              Shift:
            </label>
            <div className="relative">
              <select
                value={filters.shift || ''}
                onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
                className={selectStyle.base}
                style={{ ...selectStyle.border, color: 'var(--primary-950)' }}
              >
                <option value="">Select shift</option>
                {SHIFT_OPTIONS.map((shift) => (
                  <option key={shift} value={shift} className="capitalize">{shift}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--neutral-500)' }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-sm" style={{ color: 'var(--neutral-900)' }}>
              Specialty:
            </label>
            <div className="relative">
              <select
                value={filters.specialty || ''}
                onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                className={selectStyle.base}
                style={{ ...selectStyle.border, color: filters.specialty ? 'var(--primary-950)' : 'var(--neutral-500)' }}
              >
                <option value="">Select service</option>
                {SPECIALTY_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--neutral-500)' }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-medium text-sm" style={{ color: 'var(--neutral-900)' }}>
              Status:
            </label>
            <div className="relative">
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={`${selectStyle.base} capitalize`}
                style={{ ...selectStyle.border, color: 'var(--primary-950)' }}
              >
                <option value="">Select status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--neutral-500)' }} />
            </div>
          </div>

          <div className="flex gap-3 justify-between pt-4 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-80"
              style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)', color: 'var(--neutral-700)' }}
            >
              Reset filters
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-80"
                style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)', color: 'var(--neutral-700)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--primary-600)', borderColor: 'var(--primary-600)', color: 'white' }}
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
