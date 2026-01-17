'use client';

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { Mechanic, Service, ReservationDto, RepairJobDto, Client, Car } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type AddEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onReservationSubmit: (data: ReservationDto & { name?: string; phone?: string; email?: string; carModel?: string }) => void;
  onRepairJobSubmit: (data: RepairJobDto) => void;
  mechanicOnly?: boolean; // If true, only show Repair Job tab (for mechanic view)
};

type TabType = 'reservation' | 'repair-job';

export function AddEventModal({
  isOpen,
  onClose,
  onReservationSubmit,
  onRepairJobSubmit,
  mechanicOnly = false,
}: AddEventModalProps) {
  // Default to repair-job tab if mechanic only mode
  const [activeTab, setActiveTab] = useState<TabType>(mechanicOnly ? 'repair-job' : 'reservation');
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientCars, setClientCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  // Reservation form data
  const [reservationData, setReservationData] = useState({
    name: '',
    phone: '',
    email: '',
    carModel: '',
    serviceId: undefined as number | undefined,
    mechanicId: undefined as number | undefined,
    visitDate: new Date(),
    visitTime: '09:00',
    endTime: '10:00',
    additionalDetails: '',
    status: 'Scheduled',
  });

  // Repair Job form data
  const [repairJobData, setRepairJobData] = useState({
    clientId: undefined as number | undefined,
    carId: undefined as number | undefined,
    plate: '',
    mechanicId: undefined as number | undefined,
    startDate: new Date(),
    startTime: '09:00',
    endDate: new Date(),
    endTime: '09:00',
    serviceId: undefined as number | undefined,
    status: 'Pending',
    additionalDetails: '',
  });

  // Time options
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (repairJobData.clientId) {
      fetchClientCars(repairJobData.clientId);
    } else {
      setClientCars([]);
      setRepairJobData(prev => ({ ...prev, carId: undefined }));
    }
  }, [repairJobData.clientId]);

  // Auto-set end time to 1 hour after start time when start time changes (for reservations)
  useEffect(() => {
    if (reservationData.visitTime) {
      const [hours] = reservationData.visitTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:00`;
      if (reservationData.endTime === '10:00' || !reservationData.endTime) {
        setReservationData(prev => ({ ...prev, endTime: endTimeStr }));
      }
    }
  }, [reservationData.visitTime]);

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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientCars = async (clientId: number) => {
    try {
      const clientRes = await httpClient.get<Client>(API_CONFIG.ENDPOINTS.CLIENTS.GET(clientId.toString()));
      if (clientRes.data) {
        // Fetch cars for this client
        const carsRes = await httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST);
        if (carsRes.data) {
          const clientCars = carsRes.data.filter(car => car.owner?.id === clientId);
          setClientCars(clientCars);
        }
      }
    } catch (error) {
      console.error('Error fetching client cars:', error);
    }
  };

  const handleReservationSubmit = () => {
    setValidationError('');
    
    const visitDateTime = new Date(reservationData.visitDate);
    const [hours, minutes] = reservationData.visitTime.split(':').map(Number);
    visitDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(reservationData.visitDate);
    const [endHours, endMinutes] = reservationData.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // Validate duration: 30 minutes to 2 hours
    const durationMs = endDateTime.getTime() - visitDateTime.getTime();
    const durationMinutes = durationMs / (1000 * 60);

    if (durationMinutes < 30) {
      setValidationError('Reservation duration must be at least 30 minutes');
      return;
    }
    if (durationMinutes > 120) {
      setValidationError('Reservation duration cannot exceed 2 hours');
      return;
    }
    if (endDateTime <= visitDateTime) {
      setValidationError('End time must be after start time');
      return;
    }

    const submitData: ReservationDto & { name?: string; phone?: string; email?: string; carModel?: string } = {
      serviceId: reservationData.serviceId,
      mechanicId: reservationData.mechanicId,
      visitDateTime: visitDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      additionalDetails: reservationData.additionalDetails || undefined,
      status: reservationData.status,
      name: reservationData.name,
      phone: reservationData.phone,
      email: reservationData.email,
      carModel: reservationData.carModel,
    };

    onReservationSubmit(submitData);
    handleClose();
  };

  const handleRepairJobSubmit = () => {
    const startDateTime = new Date(repairJobData.startDate);
    const [startHours, startMinutes] = repairJobData.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(repairJobData.endDate);
    const [endHours, endMinutes] = repairJobData.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const submitData: RepairJobDto = {
      clientId: repairJobData.clientId,
      mechanicId: repairJobData.mechanicId,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      serviceId: repairJobData.serviceId,
      status: repairJobData.status,
      additionalDetails: repairJobData.additionalDetails || undefined,
    };

    onRepairJobSubmit(submitData);
    handleClose();
  };

  const handleClose = () => {
    setReservationData({
      name: '',
      phone: '',
      email: '',
      carModel: '',
      serviceId: undefined,
      mechanicId: undefined,
      visitDate: new Date(),
      visitTime: '09:00',
      endTime: '10:00',
      additionalDetails: '',
      status: 'Scheduled',
    });
    setValidationError('');
    setRepairJobData({
      clientId: undefined,
      carId: undefined,
      plate: '',
      mechanicId: undefined,
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(),
      endTime: '09:00',
      serviceId: undefined,
      status: 'Pending',
      additionalDetails: '',
    });
    // Reset to appropriate tab based on mode
    setActiveTab(mechanicOnly ? 'repair-job' : 'reservation');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(35, 40, 72, 0.2)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[800px] max-w-[90vw] z-50 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'white' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="font-medium text-2xl"
            style={{ color: 'var(--primary-950)' }}
          >
            Add new event
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 rounded-md hover:opacity-70 transition-colors"
            style={{ color: 'var(--neutral-500)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs - Hide Reservation tab for mechanics */}
        <div className="flex gap-6 mb-6 border-b" style={{ borderColor: 'var(--neutral-200)' }}>
          {!mechanicOnly && (
            <button
              onClick={() => setActiveTab('reservation')}
              className="px-4 py-2 font-medium text-base relative transition-colors"
              style={{
                color: activeTab === 'reservation' ? 'var(--primary-600)' : 'var(--neutral-600)',
              }}
            >
              Reservation
              {activeTab === 'reservation' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--primary-600)' }} />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab('repair-job')}
            className="px-4 py-2 font-medium text-base relative transition-colors"
            style={{
              color: activeTab === 'repair-job' ? 'var(--primary-600)' : 'var(--neutral-600)',
            }}
          >
            Repair Job
            {activeTab === 'repair-job' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--primary-600)' }} />
            )}
          </button>
        </div>

        {/* Form Content */}
        {activeTab === 'reservation' ? (
          <ReservationForm
            data={reservationData}
            setData={setReservationData}
            mechanics={mechanics}
            services={services}
            timeOptions={timeOptions}
          />
        ) : (
          <RepairJobForm
            data={repairJobData}
            setData={setRepairJobData}
            mechanics={mechanics}
            services={services}
            clients={clients}
            clientCars={clientCars}
            timeOptions={timeOptions}
          />
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            {validationError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 mt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
          <button
            type="button"
            onClick={handleClose}
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
            onClick={activeTab === 'reservation' ? handleReservationSubmit : handleRepairJobSubmit}
            className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--primary-600)',
              borderColor: 'var(--primary-600)',
              color: 'white',
            }}
          >
            Create
          </button>
        </div>
      </div>
    </>
  );
}

// Reservation Form Component
function ReservationForm({
  data,
  setData,
  mechanics,
  services,
  timeOptions,
}: {
  data: any;
  setData: (data: any) => void;
  mechanics: Mechanic[];
  services: Service[];
  timeOptions: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
            style={{ 
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
            placeholder="Enter name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Contact Number
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
            style={{ 
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
            placeholder="Enter contact number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
            style={{ 
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
            placeholder="Enter email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Car Model
          </label>
          <input
            type="text"
            value={data.carModel}
            onChange={(e) => setData({ ...data, carModel: e.target.value })}
            className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
            style={{ 
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
            placeholder="Enter car model"
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Service
          </label>
          <div className="relative">
            <select
              value={data.serviceId || ''}
              onChange={(e) => setData({ ...data, serviceId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--neutral-400)',
                color: data.serviceId ? 'var(--primary-950)' : 'var(--neutral-500)',
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

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Mechanic
          </label>
          <div className="relative">
            <select
              value={data.mechanicId || ''}
              onChange={(e) => setData({ ...data, mechanicId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--neutral-400)',
                color: data.mechanicId ? 'var(--primary-950)' : 'var(--neutral-500)',
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

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Visit date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-full px-4 py-2.5 border rounded-lg text-base flex items-center gap-2 justify-between"
                style={{
                  borderColor: 'var(--neutral-400)',
                  color: 'var(--primary-950)',
                  backgroundColor: 'white',
                }}
              >
                <span>{format(data.visitDate, 'dd.MM.yyyy')}</span>
                <CalendarIcon className="w-5 h-5" style={{ color: 'var(--neutral-500)' }} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.visitDate}
                onSelect={(date) => date && setData({ ...data, visitDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Start time
          </label>
          <div className="relative">
            <select
              value={data.visitTime}
              onChange={(e) => setData({ ...data, visitTime: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
              style={{ color: 'var(--neutral-500)' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            End time
          </label>
          <div className="relative">
            <select
              value={data.endTime}
              onChange={(e) => setData({ ...data, endTime: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
              style={{ color: 'var(--neutral-500)' }}
            />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>
            Duration must be 30 minutes to 2 hours
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
            Status
          </label>
          <div className="relative">
                <select
                  value={data.status}
                  onChange={(e) => setData({ ...data, status: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--neutral-400)',
                    color: 'var(--primary-950)',
                  }}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
            <ChevronDown 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
              style={{ color: 'var(--neutral-500)' }}
            />
          </div>
        </div>
      </div>

      {/* Full Width Fields */}
      <div className="col-span-2">
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
          Additional details - Optional
        </label>
        <textarea
          value={data.additionalDetails}
          onChange={(e) => setData({ ...data, additionalDetails: e.target.value })}
          rows={4}
          className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 resize-none"
          style={{ 
            borderColor: 'var(--neutral-400)',
            color: 'var(--primary-950)',
          }}
          placeholder="Start typing additional details"
        />
      </div>
    </div>
  );
}

// Repair Job Form Component
function RepairJobForm({
  data,
  setData,
  mechanics,
  services,
  clients,
  clientCars,
  timeOptions,
}: {
  data: any;
  setData: (data: any) => void;
  mechanics: Mechanic[];
  services: Service[];
  clients: Client[];
  clientCars: Car[];
  timeOptions: string[];
}) {
  return (
    <div className="space-y-6">
      {/* General Info Section */}
      <div>
        <h3 className="font-medium text-base mb-4" style={{ color: 'var(--primary-950)' }}>
          General Info
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
              Client
            </label>
            <div className="relative">
              <select
                value={data.clientId || ''}
                onChange={(e) => setData({ ...data, clientId: e.target.value ? Number(e.target.value) : undefined, carId: undefined })}
                className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: data.clientId ? 'var(--primary-950)' : 'var(--neutral-500)',
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

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
              Vehicle
            </label>
            <div className="relative">
              <select
                value={data.carId || ''}
                onChange={(e) => setData({ ...data, carId: e.target.value ? Number(e.target.value) : undefined })}
                disabled={!data.clientId}
                className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: data.carId ? 'var(--primary-950)' : 'var(--neutral-500)',
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: 'var(--neutral-500)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
              Plate
            </label>
            <input
              type="text"
              value={data.plate}
              onChange={(e) => setData({ ...data, plate: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
              style={{ 
                borderColor: 'var(--neutral-400)',
                color: 'var(--primary-950)',
              }}
              placeholder="Enter plate number"
            />
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
              Mechanic
            </label>
            <div className="relative">
              <select
                value={data.mechanicId || ''}
                onChange={(e) => setData({ ...data, mechanicId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: data.mechanicId ? 'var(--primary-950)' : 'var(--neutral-500)',
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-full px-4 py-2.5 border rounded-lg text-base flex items-center gap-2 justify-between"
                    style={{
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                      backgroundColor: 'white',
                    }}
                  >
                    <span>{format(data.startDate, 'dd.MM.yyyy')}</span>
                    <CalendarIcon className="w-5 h-5" style={{ color: 'var(--neutral-500)' }} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.startDate}
                    onSelect={(date) => date && setData({ ...data, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
                Start Time
              </label>
              <div className="relative">
                <select
                  value={data.startTime}
                  onChange={(e) => setData({ ...data, startTime: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                  style={{ color: 'var(--neutral-500)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-full px-4 py-2.5 border rounded-lg text-base flex items-center gap-2 justify-between"
                    style={{
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                      backgroundColor: 'white',
                    }}
                  >
                    <span>{format(data.endDate, 'dd.MM.yyyy')}</span>
                    <CalendarIcon className="w-5 h-5" style={{ color: 'var(--neutral-500)' }} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.endDate}
                    onSelect={(date) => date && setData({ ...data, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
                End Time
              </label>
              <div className="relative">
                <select
                  value={data.endTime}
                  onChange={(e) => setData({ ...data, endTime: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                  style={{ color: 'var(--neutral-500)' }}
                />
              </div>
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
              Service
            </label>
            <div className="relative">
              <select
                value={data.serviceId || ''}
                onChange={(e) => setData({ ...data, serviceId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: data.serviceId ? 'var(--primary-950)' : 'var(--neutral-500)',
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

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
              Status
            </label>
            <div className="relative">
              <select
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: 'var(--primary-950)',
                }}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Completed">Completed</option>
              </select>
              <ChevronDown 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: 'var(--neutral-500)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--neutral-900)' }}>
          Additional details - Optional
        </label>
        <textarea
          value={data.additionalDetails}
          onChange={(e) => setData({ ...data, additionalDetails: e.target.value })}
          rows={4}
          className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 resize-none"
          style={{ 
            borderColor: 'var(--neutral-400)',
            color: 'var(--primary-950)',
          }}
          placeholder="Start typing additional details"
        />
      </div>
    </div>
  );
}
