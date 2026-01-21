'use client';

import { useState, useEffect, useCallback } from "react";
import { X, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { RepairJobDto, Service, Client, Car, Mechanic } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/app/api";

type CreateRepairJobModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
};

export function CreateRepairJobModal({
  isOpen,
  onClose,
  onSuccess,
  onNotification,
}: CreateRepairJobModalProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientCars, setClientCars] = useState<Car[]>([]);
  const [mechanicName, setMechanicName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<RepairJobDto & { plate?: string; carId?: number }>({
    clientId: undefined,
    mechanicId: user?.userId,
    startDateTime: "",
    endDateTime: "",
    serviceId: undefined,
    status: "upcoming",
    additionalDetails: "",
    plate: "",
    carId: undefined,
  });

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesRes, clientsRes, mechanicsRes] = await Promise.all([
        httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST),
        httpClient.get<Client[]>(API_CONFIG.ENDPOINTS.CLIENTS.LIST),
        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
      ]);

      if (servicesRes.data) setServices(servicesRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
      
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
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  const fetchClientCars = async (clientId: number) => {
    try {
      const carsRes = await httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST);
      if (carsRes.data) {
        const cars = carsRes.data.filter(car => car.owner?.id === clientId);
        setClientCars(cars);
        // Auto-select first car if available
        if (cars.length > 0) {
          setFormData(prev => ({
            ...prev,
            carId: cars[0].id,
            plate: cars[0].licensePlate || '',
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching client cars:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      // Reset form
      setFormData({
        clientId: undefined,
        mechanicId: user?.userId,
        startDateTime: "",
        endDateTime: "",
        serviceId: undefined,
        status: "upcoming",
        additionalDetails: "",
        plate: "",
        carId: undefined,
      });
      setStartDate(undefined);
      setEndDate(undefined);
      setStartTime("09:00");
      setEndTime("12:00");
      setClientCars([]);
    }
  }, [isOpen, fetchData, user?.userId]);

  useEffect(() => {
    if (formData.clientId) {
      fetchClientCars(formData.clientId);
    } else {
      setClientCars([]);
      setFormData(prev => ({ ...prev, carId: undefined, plate: '' }));
    }
  }, [formData.clientId]);

  useEffect(() => {
    if (startDate && startTime) {
      const [hours, minutes] = startTime.split(':');
      const dateTime = new Date(startDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      setFormData(prev => ({ ...prev, startDateTime: dateTime.toISOString() }));
    }
  }, [startDate, startTime]);

  useEffect(() => {
    if (endDate && endTime) {
      const [hours, minutes] = endTime.split(':');
      const dateTime = new Date(endDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      setFormData(prev => ({ ...prev, endDateTime: dateTime.toISOString() }));
    }
  }, [endDate, endTime]);

  useEffect(() => {
    if (formData.carId) {
      const selectedCar = clientCars.find(car => car.id === formData.carId);
      if (selectedCar) {
        setFormData(prev => ({ ...prev, plate: selectedCar.licensePlate || '' }));
      }
    }
  }, [formData.carId, clientCars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.carId || !formData.serviceId || !formData.startDateTime || !formData.endDateTime) {
      if (onNotification) {
        onNotification('Error', 'Please fill in all required fields', 'error');
      }
      return;
    }

    setSaving(true);
    try {
      const jobData: RepairJobDto = {
        clientId: formData.clientId,
        mechanicId: formData.mechanicId,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        serviceId: formData.serviceId,
        status: formData.status,
        additionalDetails: formData.additionalDetails || undefined,
      };

      const response = await httpClient.post<RepairJobDto, RepairJobDto>(
        API_CONFIG.ENDPOINTS.REPAIR_JOBS.CREATE,
        jobData
      );

      if (response.error) {
        if (onNotification) {
          onNotification('Error', response.error, 'error');
        }
      } else {
        if (onNotification) {
          onNotification('Successfully created repair job', 'Your changes have been saved.', 'success');
        }
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating repair job:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to create repair job', 'error');
      }
    } finally {
      setSaving(false);
    }
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[800px] max-w-[90vw] z-50 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'white' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="font-medium text-xl"
            style={{ color: 'var(--primary-950)' }}
          >
            Repair Job details
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* General Info */}
            <div>
              <h3 className="font-medium text-base mb-4" style={{ color: 'var(--primary-950)' }}>
                General Info
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Client:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.clientId || ""}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Vehicle:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.carId || ""}
                      onChange={(e) => setFormData({ ...formData, carId: e.target.value ? Number(e.target.value) : undefined })}
                      disabled={!formData.clientId || clientCars.length === 0}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">Select vehicle</option>
                      {clientCars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {`${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim()}
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
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Plate:</label>
                  <input
                    type="text"
                    value={formData.plate || ""}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                      backgroundColor: 'var(--neutral-50)',
                    }}
                    placeholder="WA00000"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Assignment */}
            <div>
              <h3 className="font-medium text-base mb-4" style={{ color: 'var(--primary-950)' }}>
                Schedule & Assignment
              </h3>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Mechanic:</label>
                  <input
                    type="text"
                    value={mechanicName || user?.username || '-'}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                      backgroundColor: 'var(--neutral-50)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Start Date:</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full px-3 py-2 border rounded-lg text-sm flex items-center justify-between"
                        style={{ 
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      >
                        <span>{startDate ? format(startDate, 'dd.MM.yyyy') : 'Select date'}</span>
                        <CalendarIcon className="w-4 h-4" style={{ color: 'var(--neutral-500)' }} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Start Time:</label>
                  <div className="relative">
                    <select
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
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
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>End Date:</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full px-3 py-2 border rounded-lg text-sm flex items-center justify-between"
                        style={{ 
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      >
                        <span>{endDate ? format(endDate, 'dd.MM.yyyy') : 'Select date'}</span>
                        <CalendarIcon className="w-4 h-4" style={{ color: 'var(--neutral-500)' }} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>End Time:</label>
                  <div className="relative">
                    <select
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
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

            {/* Details */}
            <div>
              <h3 className="font-medium text-base mb-4" style={{ color: 'var(--primary-950)' }}>
                Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Service:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.serviceId || ""}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value ? Number(e.target.value) : undefined })}
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
                      required
                      value={formData.status || ""}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 capitalize"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional details */}
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                Additional details - Optional:
              </label>
              <textarea
                value={formData.additionalDetails || ""}
                onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: 'var(--primary-950)',
                }}
                placeholder="Car has been making a strange noise lately."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
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
                disabled={saving}
                className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: 'var(--primary-600)',
                  borderColor: 'var(--primary-600)',
                  color: 'white',
                }}
              >
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
