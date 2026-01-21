'use client';

import { useState, useEffect, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { Service, Mechanic } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useAuth } from "@/app/api";

type MechanicReservationFilter = {
  dateFrom?: string;
  dateTo?: string;
  carModel?: string;
  serviceId?: number;
  status?: string;
};

type MechanicReservationFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filter: MechanicReservationFilter) => void;
  currentFilter?: MechanicReservationFilter;
};

export function MechanicReservationFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilter,
}: MechanicReservationFilterModalProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [mechanicName, setMechanicName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(
    currentFilter?.dateFrom && currentFilter?.dateTo
      ? {
          from: new Date(currentFilter.dateFrom),
          to: new Date(currentFilter.dateTo),
        }
      : undefined
  );

  const [filter, setFilter] = useState<MechanicReservationFilter>({
    dateFrom: currentFilter?.dateFrom || '',
    dateTo: currentFilter?.dateTo || '',
    carModel: currentFilter?.carModel || '',
    serviceId: currentFilter?.serviceId,
    status: currentFilter?.status || '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesRes, mechanicsRes] = await Promise.all([
        httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST),
        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
      ]);
      if (servicesRes.data) setServices(servicesRes.data);
      
      // Find the current mechanic by email
      if (mechanicsRes.data && user?.username) {
        const currentMechanic = mechanicsRes.data.find(
          m => m.email?.toLowerCase() === user.username?.toLowerCase()
        );
        if (currentMechanic) {
          setMechanicName(currentMechanic.name || user.username);
        } else {
          setMechanicName(user.username);
        }
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

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
  }, [isOpen, currentFilter, fetchData]);

  const handleApply = () => {
    const filterToSend: MechanicReservationFilter = {
      dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
      dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
      carModel: filter.carModel || undefined,
      serviceId: filter.serviceId,
      status: filter.status || undefined,
    };
    onApply(filterToSend);
    onClose();
  };

  const handleReset = () => {
    setFilter({
      dateFrom: '',
      dateTo: '',
      carModel: '',
      serviceId: undefined,
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
        onClick={(e) => e.stopPropagation()}
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
                  <input
                    type="text"
                    value={filter.carModel || ""}
                    onChange={(e) => setFilter({ ...filter, carModel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                    }}
                    placeholder="Select model"
                  />
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
                      <option value="completed">Completed</option>
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
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Mechanic:</label>
                  <input
                    type="text"
                    readOnly
                    value={mechanicName || user?.username || '-'}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                      backgroundColor: 'var(--neutral-50)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 font-medium text-base transition-colors hover:opacity-80"
                style={{ 
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
