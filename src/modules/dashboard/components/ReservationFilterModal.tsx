'use client';

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Mechanic, Service, Car, ReservationFilter } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { DateRangePicker } from "@/components/DateRangePicker";

type ReservationFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filter: ReservationFilter) => void;
  currentFilter?: ReservationFilter;
};

export function ReservationFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilter,
}: ReservationFilterModalProps) {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(
    currentFilter?.dateFrom && currentFilter?.dateTo
      ? {
          from: new Date(currentFilter.dateFrom),
          to: new Date(currentFilter.dateTo),
        }
      : undefined
  );

  const [filter, setFilter] = useState<ReservationFilter & { status?: string }>({
    dateFrom: currentFilter?.dateFrom || '',
    dateTo: currentFilter?.dateTo || '',
    carId: currentFilter?.carId,
    serviceId: currentFilter?.serviceId,
    mechanicId: currentFilter?.mechanicId,
    status: currentFilter?.status || '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (currentFilter) {
        setFilter({
          ...currentFilter,
          status: currentFilter.status || '',
        });
        setDateRange(
          currentFilter.dateFrom && currentFilter.dateTo
            ? {
                from: new Date(currentFilter.dateFrom),
                to: new Date(currentFilter.dateTo),
              }
            : undefined
        );
      }
    }
  }, [isOpen, currentFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mechanicsRes, servicesRes, carsRes] = await Promise.all([
        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
        httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST),
        httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST),
      ]);

      if (mechanicsRes.data) setMechanics(mechanicsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (carsRes.data) setCars(carsRes.data);
    } catch (error) {
      console.error("Error fetching filter data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const filterToSend: ReservationFilter = {
      dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
      dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
      carId: filter.carId,
      serviceId: filter.serviceId,
      mechanicId: filter.mechanicId,
      status: filter.status || undefined,
    };
    onApply(filterToSend);
    onClose();
  };

  const handleReset = () => {
    setFilter({
      dateFrom: '',
      dateTo: '',
      carId: undefined,
      serviceId: undefined,
      mechanicId: undefined,
      status: '',
    });
    setDateRange(undefined);
    onApply({});
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[700px] z-50 max-h-[90vh] overflow-y-auto"
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div 
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleApply(); }} className="flex flex-col gap-6">
            {/* Two-column layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Date range:</label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={(range) => {
                      setDateRange(range);
                      setFilter({
                        ...filter,
                        dateFrom: range?.from ? range.from.toISOString() : '',
                        dateTo: range?.to ? range.to.toISOString() : '',
                      });
                    }}
                    placeholder="Select range"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Car Model:</label>
                  <div className="relative">
                    <select
                      value={filter.carId || ""}
                      onChange={(e) => setFilter({ ...filter, carId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">Select model</option>
                      {cars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.make} {car.model}
                        </option>
                      ))}
                    </select>
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Service:</label>
                  <div className="relative">
                    <select
                      value={filter.serviceId || ""}
                      onChange={(e) => setFilter({ ...filter, serviceId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">Select service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.serviceName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Status:</label>
                  <div className="relative">
                    <select
                      value={filter.status || ""}
                      onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 capitalize"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">Select status</option>
                      <option value="unconfirmed">Unconfirmed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Mechanic:</label>
                  <div className="relative">
                    <select
                      value={filter.mechanicId || ""}
                      onChange={(e) => setFilter({ ...filter, mechanicId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">Select mechanic</option>
                      {mechanics.map((mechanic) => (
                        <option key={mechanic.id} value={mechanic.id}>
                          {mechanic.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
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
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
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
                  type="submit"
                  className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90"
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
          </form>
        )}
      </div>
    </>
  );
}
