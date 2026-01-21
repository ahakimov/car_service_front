'use client';

import { useState, useEffect, useCallback } from "react";
import { X, ChevronDown, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { RepairJob, RepairJobDto, Service, Mechanic, Client, Car } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteModal } from "./DeleteModal";

type RepairJobDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  repairJobId: number;
  onUpdate?: () => void;
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
};

export function RepairJobDetailsModal({
  isOpen,
  onClose,
  repairJobId,
  onUpdate,
  onNotification,
}: RepairJobDetailsModalProps) {
  const [repairJob, setRepairJob] = useState<RepairJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientCars, setClientCars] = useState<Car[]>([]);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState<RepairJobDto & { plate?: string; carId?: number }>({
    clientId: undefined,
    mechanicId: undefined,
    startDateTime: "",
    endDateTime: "",
    serviceId: undefined,
    status: "upcoming",
    additionalDetails: "",
    plate: "",
    carId: undefined,
  });

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const fetchRepairJobDetails = useCallback(async () => {
    if (!repairJobId) return;
    setLoading(true);
    try {
      const response = await httpClient.get<RepairJob>(
        API_CONFIG.ENDPOINTS.REPAIR_JOBS.GET(String(repairJobId))
      );
      if (response.data) {
        setRepairJob(response.data);
        // Populate form data
        const startDate = response.data.startDateTime 
          ? new Date(response.data.startDateTime)
          : new Date();
        const endDate = response.data.endDateTime 
          ? new Date(response.data.endDateTime)
          : new Date();
        
        setFormData({
          clientId: response.data.client?.id,
          mechanicId: response.data.mechanic?.id,
          startDateTime: response.data.startDateTime || "",
          endDateTime: response.data.endDateTime || "",
          serviceId: response.data.service?.id,
          status: response.data.status || "upcoming",
          additionalDetails: response.data.additionalDetails || "",
          plate: "", // Plate would need to be fetched from car if available
        });

        // Fetch client cars if client exists
        if (response.data.client?.id) {
          fetchClientCars(response.data.client.id);
        }
      }
    } catch (error) {
      console.error("Error fetching repair job details:", error);
    } finally {
      setLoading(false);
    }
  }, [repairJobId]);

  const fetchClientCars = async (clientId: number) => {
    try {
      const carsRes = await httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST);
      if (carsRes.data) {
        const clientCars = carsRes.data.filter(car => car.owner?.id === clientId);
        setClientCars(clientCars);
      }
    } catch (error) {
      console.error('Error fetching client cars:', error);
    }
  };

  const fetchServicesMechanicsAndClients = useCallback(async () => {
    try {
      const [servicesRes, mechanicsRes, clientsRes] = await Promise.all([
        httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST),
        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
        httpClient.get<Client[]>(API_CONFIG.ENDPOINTS.CLIENTS.LIST),
      ]);
      if (servicesRes.data) setServices(servicesRes.data);
      if (mechanicsRes.data) setMechanics(mechanicsRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
    } catch (error) {
      console.error("Error fetching services, mechanics, and clients:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && repairJobId) {
      fetchRepairJobDetails();
      fetchServicesMechanicsAndClients();
      setIsEditing(false);
    } else {
      setRepairJob(null);
      setIsEditing(false);
    }
  }, [isOpen, repairJobId, fetchRepairJobDetails, fetchServicesMechanicsAndClients]);

  useEffect(() => {
    if (formData.clientId) {
      fetchClientCars(formData.clientId);
    } else {
      setClientCars([]);
    }
  }, [formData.clientId]);

  const handleSave = async () => {
    if (!repairJobId) return;
    setSaving(true);
    try {
      const startDateTime = formData.startDateTime 
        ? new Date(formData.startDateTime).toISOString()
        : undefined;
      const endDateTime = formData.endDateTime 
        ? new Date(formData.endDateTime).toISOString()
        : undefined;

      const updateData: RepairJobDto = {
        clientId: formData.clientId,
        mechanicId: formData.mechanicId,
        startDateTime,
        endDateTime,
        serviceId: formData.serviceId,
        status: formData.status,
        additionalDetails: formData.additionalDetails || undefined,
      };

      const response = await httpClient.put(
        API_CONFIG.ENDPOINTS.REPAIR_JOBS.UPDATE(repairJobId),
        updateData
      );

      if (response.error) {
        if (onNotification) {
          onNotification('Error', response.error, 'error');
        }
      } else {
        setIsEditing(false);
        fetchRepairJobDetails();
        if (onUpdate) onUpdate();
        if (onNotification) {
          onNotification('Successfully updated repair job', 'Your changes have been saved', 'success');
        }
      }
    } catch (error) {
      console.error("Error saving repair job:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to save repair job', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original repair job
    if (repairJob) {
      const startDate = repairJob.startDateTime 
        ? new Date(repairJob.startDateTime)
        : new Date();
      const endDate = repairJob.endDateTime 
        ? new Date(repairJob.endDateTime)
        : new Date();
      
      setFormData({
        clientId: repairJob.client?.id,
        mechanicId: repairJob.mechanic?.id,
        startDateTime: repairJob.startDateTime || "",
        endDateTime: repairJob.endDateTime || "",
        serviceId: repairJob.service?.id,
        status: repairJob.status || "upcoming",
        additionalDetails: repairJob.additionalDetails || "",
        plate: "",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!repairJobId) return;
    try {
      const response = await httpClient.delete(
        API_CONFIG.ENDPOINTS.REPAIR_JOBS.DELETE(String(repairJobId))
      );
      if (response.error) {
        if (onNotification) {
          onNotification('Error', response.error, 'error');
        }
      } else {
        setIsDeleteModalOpen(false);
        if (onUpdate) onUpdate();
        if (onNotification) {
          onNotification('Successfully deleted repair job', 'Your changes have been saved', 'success');
        }
        onClose();
      }
    } catch (error) {
      console.error("Error deleting repair job:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to delete repair job', 'error');
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy');
    } catch {
      return '-';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm');
    } catch {
      return '-';
    }
  };

  const getStartDate = () => {
    if (isEditing && formData.startDateTime) {
      return new Date(formData.startDateTime);
    }
    return repairJob?.startDateTime ? new Date(repairJob.startDateTime) : new Date();
  };

  const getEndDate = () => {
    if (isEditing && formData.endDateTime) {
      return new Date(formData.endDateTime);
    }
    return repairJob?.endDateTime ? new Date(repairJob.endDateTime) : new Date();
  };

  const getStartTime = () => {
    if (isEditing && formData.startDateTime) {
      const date = new Date(formData.startDateTime);
      return format(date, 'HH:mm');
    }
    return formatTime(repairJob?.startDateTime);
  };

  const getEndTime = () => {
    if (isEditing && formData.endDateTime) {
      const date = new Date(formData.endDateTime);
      return format(date, 'HH:mm');
    }
    return formatTime(repairJob?.endDateTime);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(35, 40, 72, 0.2)' }}
        onClick={isEditing ? undefined : onClose}
      />

      {/* Modal */}
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto z-50"
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
        ) : repairJob ? (
          <div className="space-y-6">
            {/* General Info Section */}
            <div>
              <h3 className="font-medium text-base mb-4" style={{ color: 'var(--primary-950)' }}>
                General Info
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                    Client:
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={formData.clientId || ''}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value ? Number(e.target.value) : undefined, plate: '' })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
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
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {repairJob.client?.name || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                    Vehicle:
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={formData.carId || ''}
                        onChange={(e) => {
                          const selectedCar = clientCars.find(c => c.id === Number(e.target.value));
                          setFormData({ 
                            ...formData, 
                            carId: e.target.value ? Number(e.target.value) : undefined,
                            plate: selectedCar?.licensePlate || ''
                          });
                        }}
                        disabled={!formData.clientId}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                        style={{ 
                          borderColor: 'var(--neutral-400)',
                          color: formData.carId ? 'var(--primary-950)' : 'var(--neutral-500)',
                        }}
                      >
                        <option value="">Select vehicle</option>
                        {clientCars.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.make} {car.model} {car.year}
                          </option>
                        ))}
                      </select>
                      <ChevronDown 
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--neutral-500)' }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {(() => {
                        const clientCar = clientCars.find(c => c.owner?.id === repairJob.client?.id);
                        if (clientCar) {
                          return `${clientCar.make || ''} ${clientCar.model || ''} ${clientCar.year || ''}`.trim() || '-';
                        }
                        return '-';
                      })()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                    Plate:
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.plate || ''}
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                      placeholder="Enter plate number"
                    />
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {formData.plate || '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule & Assignment Section */}
            <div>
              <h3 className="font-medium text-base mb-4" style={{ color: 'var(--primary-950)' }}>
                Schedule & Assignment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                    Mechanic:
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={formData.mechanicId || ''}
                        onChange={(e) => setFormData({ ...formData, mechanicId: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
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
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {repairJob.mechanic?.name || '-'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                      Start Date:
                    </label>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-full px-3 py-2 border rounded-lg text-sm flex items-center gap-2 justify-between"
                            style={{
                              borderColor: 'var(--neutral-400)',
                              color: 'var(--primary-950)',
                              backgroundColor: 'white',
                            }}
                          >
                            <span>{format(getStartDate(), 'dd.MM.yyyy')}</span>
                            <CalendarIcon className="w-4 h-4" style={{ color: 'var(--neutral-500)' }} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={getStartDate()}
                            onSelect={(date) => {
                              if (date) {
                                const currentTime = getStartTime();
                                const [hours, minutes] = currentTime.split(':').map(Number);
                                date.setHours(hours, minutes || 0, 0, 0);
                                setFormData({ ...formData, startDateTime: date.toISOString() });
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                        {formatDate(repairJob.startDateTime)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                      Start Time:
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          value={getStartTime()}
                          onChange={(e) => {
                            const startDate = getStartDate();
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            startDate.setHours(hours, minutes || 0, 0, 0);
                            setFormData({ ...formData, startDateTime: startDate.toISOString() });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
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
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                        {formatTime(repairJob.startDateTime)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                      End Date:
                    </label>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-full px-3 py-2 border rounded-lg text-sm flex items-center gap-2 justify-between"
                            style={{
                              borderColor: 'var(--neutral-400)',
                              color: 'var(--primary-950)',
                              backgroundColor: 'white',
                            }}
                          >
                            <span>{format(getEndDate(), 'dd.MM.yyyy')}</span>
                            <CalendarIcon className="w-4 h-4" style={{ color: 'var(--neutral-500)' }} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={getEndDate()}
                            onSelect={(date) => {
                              if (date) {
                                const currentTime = getEndTime();
                                const [hours, minutes] = currentTime.split(':').map(Number);
                                date.setHours(hours, minutes || 0, 0, 0);
                                setFormData({ ...formData, endDateTime: date.toISOString() });
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                        {formatDate(repairJob.endDateTime)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                      End Time:
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          value={getEndTime()}
                          onChange={(e) => {
                            const endDate = getEndDate();
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            endDate.setHours(hours, minutes || 0, 0, 0);
                            setFormData({ ...formData, endDateTime: endDate.toISOString() });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
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
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                        {formatTime(repairJob.endDateTime)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div>
              <h3 className="font-medium text-base mb-4" style={{ color: 'var(--primary-950)' }}>
                Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                    Service:
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={formData.serviceId || ''}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
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
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {repairJob.service?.serviceName || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                    Status:
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={formData.status || 'upcoming'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                        style={{ 
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <ChevronDown 
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--neutral-500)' }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm capitalize" style={{ color: 'var(--primary-950)' }}>
                      {repairJob.status || '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>
                Additional details - Optional:
              </label>
              {isEditing ? (
                <textarea
                  value={formData.additionalDetails || ''}
                  onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    borderColor: 'var(--neutral-400)',
                    color: 'var(--primary-950)',
                  }}
                  placeholder="Start typing additional details"
                />
              ) : (
                <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                  {repairJob.additionalDetails || '-'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
              {isEditing ? (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-80 flex items-center gap-2"
                  style={{ 
                    color: 'var(--danger-600)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              ) : (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-80 flex items-center gap-2"
                  style={{ 
                    color: 'var(--danger-600)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80 disabled:opacity-50"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--neutral-700)',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50"
                      style={{ 
                        backgroundColor: 'var(--primary-600)',
                        borderColor: 'var(--primary-600)',
                        color: 'white',
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--neutral-700)',
                      }}
                    >
                      Return
                    </button>
                    <button
                      onClick={handleEdit}
                      className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90"
                      style={{ 
                        backgroundColor: 'var(--primary-600)',
                        borderColor: 'var(--primary-600)',
                        color: 'white',
                      }}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              Repair job not found
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Do you want to delete this repair job?"
        message="Are you sure you want to delete this repair job? This action cannot be undone."
      />
    </>
  );
}
