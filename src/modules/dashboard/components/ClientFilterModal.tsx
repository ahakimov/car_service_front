'use client';

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";

type ClientFilter = {
  dateRange?: { from?: Date; to?: Date };
  carModel?: string;
  minReservations?: number;
  maxReservations?: number;
};

type ClientFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ClientFilter) => void;
  currentFilter?: ClientFilter;
};

export function ClientFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilter,
}: ClientFilterModalProps) {
  const [filters, setFilters] = useState<ClientFilter>(currentFilter || {
    minReservations: 0,
    maxReservations: 100,
  });

  useEffect(() => {
    if (isOpen && currentFilter) {
      setFilters({
        minReservations: 0,
        maxReservations: 100,
        ...currentFilter,
      });
    } else if (isOpen) {
      setFilters({
        minReservations: 0,
        maxReservations: 100,
      });
    }
  }, [isOpen, currentFilter]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      minReservations: 0,
      maxReservations: 100,
    });
  };

  const handleCancel = () => {
    if (currentFilter) {
      setFilters({
        minReservations: 0,
        maxReservations: 100,
        ...currentFilter,
      });
    } else {
      setFilters({
        minReservations: 0,
        maxReservations: 100,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(35, 40, 72, 0.2)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[600px] z-50 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'white' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="font-medium text-xl"
            style={{ color: 'var(--primary-950)' }}
          >
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
          {/* Date Range */}
          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Sort by last visit date:
            </label>
            <div className="flex flex-col gap-1.5">
              <label 
                className="text-xs"
                style={{ color: 'var(--neutral-600)' }}
              >
                Date range:
              </label>
              <DateRangePicker
                value={filters.dateRange}
                onChange={(range) => setFilters({ ...filters, dateRange: range })}
                placeholder="Select range"
              />
            </div>
          </div>

          {/* Car Model */}
          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Vehicle selector:
            </label>
            <div className="flex flex-col gap-1.5">
              <label 
                className="text-xs"
                style={{ color: 'var(--neutral-600)' }}
              >
                Car Model:
              </label>
              <div className="relative">
                <select
                  value={filters.carModel || ''}
                  onChange={(e) => setFilters({ ...filters, carModel: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--neutral-400)',
                    color: filters.carModel ? 'var(--primary-950)' : 'var(--neutral-500)',
                  }}
                >
                  <option value="">Select model</option>
                  <option value="toyota-corolla">Toyota Corolla</option>
                  <option value="volkswagen-golf">Volkswagen Golf</option>
                  <option value="bmw-3-series">BMW 3 Series</option>
                  <option value="ford-focus">Ford Focus</option>
                  <option value="audi-a4">Audi A4</option>
                  <option value="mercedes-c-class">Mercedes C-Class</option>
                </select>
                <ChevronDown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                  style={{ color: 'var(--neutral-500)' }}
                />
              </div>
            </div>
          </div>

          {/* Number of Reservations */}
          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Number of reservations:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label 
                  className="text-xs block mb-1.5"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  Min:
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minReservations ?? 0}
                  onChange={(e) => setFilters({ ...filters, minReservations: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--neutral-400)',
                    color: 'var(--primary-950)',
                  }}
                />
              </div>
              <div>
                <label 
                  className="text-xs block mb-1.5"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  Max:
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxReservations ?? 100}
                  onChange={(e) => setFilters({ ...filters, maxReservations: parseInt(e.target.value) || 100 })}
                  className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--neutral-400)',
                    color: 'var(--primary-950)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-between pt-4 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-80"
              style={{ 
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--neutral-700)',
              }}
            >
              Reset filters
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-80"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: 'var(--neutral-400)',
                  color: 'var(--neutral-700)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--primary-600)',
                  borderColor: 'var(--primary-600)',
                  color: 'white',
                }}
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
