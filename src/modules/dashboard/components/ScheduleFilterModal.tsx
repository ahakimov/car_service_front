'use client';

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Mechanic, Service, Client } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { DateRangePicker } from "@/components/DateRangePicker";

type ScheduleFilter = {
  dateRange?: { from?: Date; to?: Date };
  clientId?: number;
  mechanicId?: number;
  serviceId?: number;
};

type ScheduleFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filter: ScheduleFilter) => void;
  currentFilter?: ScheduleFilter;
};

export function ScheduleFilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilter,
}: ScheduleFilterModalProps) {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<ScheduleFilter>(currentFilter || {});

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (currentFilter) {
        setFilters(currentFilter);
      } else {
        setFilters({});
      }
    }
  }, [isOpen, currentFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mechanicsRes, servicesRes, clientsRes] = await Promise.all([
        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
        httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST),
        httpClient.get<Client[]>(API_CONFIG.ENDPOINTS.CLIENTS.LIST),
      ]);

      if (mechanicsRes.data) setMechanics(mechanicsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleCancel = () => {
    if (currentFilter) {
      setFilters(currentFilter);
    } else {
      setFilters({});
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

        <div className="grid grid-cols-2 gap-6">
          {/* Date Range */}
          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Date range:
            </label>
            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => setFilters({ ...filters, dateRange: range })}
              placeholder="Select range"
            />
          </div>

          {/* Client */}
          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Client:
            </label>
            <div className="relative">
              <select
                value={filters.clientId || ''}
                onChange={(e) => setFilters({ ...filters, clientId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: filters.clientId ? 'var(--primary-950)' : 'var(--neutral-500)',
                }}
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <ChevronDown 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: 'var(--neutral-500)' }}
              />
            </div>
          </div>

          {/* Mechanic */}
          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Mechanic:
            </label>
            <div className="relative">
              <select
                value={filters.mechanicId || ''}
                onChange={(e) => setFilters({ ...filters, mechanicId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: filters.mechanicId ? 'var(--primary-950)' : 'var(--neutral-500)',
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: 'var(--neutral-500)' }}
              />
            </div>
          </div>

          {/* Service */}
          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Service:
            </label>
            <div className="relative">
              <select
                value={filters.serviceId || ''}
                onChange={(e) => setFilters({ ...filters, serviceId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: filters.serviceId ? 'var(--primary-950)' : 'var(--neutral-500)',
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: 'var(--neutral-500)' }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-between pt-6 mt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
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
    </>
  );
}
