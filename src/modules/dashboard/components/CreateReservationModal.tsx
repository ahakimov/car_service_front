'use client';

import { useState, useEffect } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import { Client, Car, Mechanic, Service, ReservationDto } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";

type CreateReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationDto & { name?: string; phone?: string; email?: string; carModel?: string }) => void;
};

export function CreateReservationModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateReservationModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientCars, setClientCars] = useState<Car[]>([]);

  const [formData, setFormData] = useState({
    clientId: undefined as number | undefined,
    name: '',
    phone: '',
    email: '',
    carId: undefined as number | undefined,
    carModel: '',
    serviceId: undefined as number | undefined,
    mechanicId: undefined as number | undefined,
    visitDate: '',
    visitTime: '',
    endTime: '',
    additionalDetails: '',
    status: 'confirmed',
  });
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Filter cars when client changes
  useEffect(() => {
    if (formData.clientId && cars.length > 0) {
      const filteredCars = cars.filter(car => {
        // Check both ownerId and owner.id since API might return either
        const carOwnerId = car.ownerId || car.owner?.id;
        return carOwnerId === formData.clientId;
      });
      setClientCars(filteredCars);
      // Reset car selection when client changes
      setFormData(prev => ({ ...prev, carId: undefined, carModel: '' }));
    } else {
      setClientCars([]);
    }
  }, [formData.clientId, cars]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, carsRes, mechanicsRes, servicesRes] = await Promise.all([
        httpClient.get<Client[]>(API_CONFIG.ENDPOINTS.CLIENTS.LIST),
        httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST),
        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
        httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST),
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (carsRes.data) setCars(carsRes.data);
      if (mechanicsRes.data) setMechanics(mechanicsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (clientId: number | undefined) => {
    if (clientId) {
      const selectedClient = clients.find(c => c.id === clientId);
      if (selectedClient) {
        setFormData(prev => ({
          ...prev,
          clientId,
          name: selectedClient.name || '',
          phone: selectedClient.phone || '',
          email: selectedClient.email || '',
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        clientId: undefined,
        name: '',
        phone: '',
        email: '',
      }));
    }
  };

  const handleCarChange = (carId: number | undefined) => {
    if (carId) {
      const selectedCar = clientCars.find(c => c.id === carId);
      if (selectedCar) {
        setFormData(prev => ({
          ...prev,
          carId,
          carModel: `${selectedCar.make || ''} ${selectedCar.model || ''}`.trim(),
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        carId: undefined,
        carModel: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    if (!formData.visitDate || !formData.visitTime || !formData.endTime) {
      setValidationError('Please fill in all date and time fields');
      return;
    }

    // Combine date and time for start
    const visitDateTime = `${formData.visitDate}T${formData.visitTime}:00`;
    // End time must be on the same date (reservations can't span days)
    const endDateTime = `${formData.visitDate}T${formData.endTime}:00`;

    // Validate duration: 30 minutes to 2 hours
    const start = new Date(visitDateTime);
    const end = new Date(endDateTime);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = durationMs / (1000 * 60);

    if (durationMinutes < 30) {
      setValidationError('Reservation duration must be at least 30 minutes');
      return;
    }
    if (durationMinutes > 120) {
      setValidationError('Reservation duration cannot exceed 2 hours');
      return;
    }
    if (end <= start) {
      setValidationError('End time must be after start time');
      return;
    }

    const reservationData: ReservationDto & { name?: string; phone?: string; email?: string; carModel?: string } = {
      clientId: formData.clientId,
      carId: formData.carId,
      serviceId: formData.serviceId,
      mechanicId: formData.mechanicId,
      visitDateTime,
      endDateTime,
      status: formData.status,
      additionalDetails: formData.additionalDetails,
      dateAdded: new Date().toISOString(),
      // Pass client/car info separately for creation
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      carModel: formData.carModel,
    };

    onSubmit(reservationData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientId: undefined,
      name: '',
      phone: '',
      email: '',
      carId: undefined,
      carModel: '',
      serviceId: undefined,
      mechanicId: undefined,
      visitDate: '',
      visitTime: '',
      endTime: '',
      additionalDetails: '',
      status: 'confirmed',
    });
    setClientCars([]);
    setValidationError('');
  };

  // Auto-set end time to 1 hour after start time when start time changes
  useEffect(() => {
    if (formData.visitTime && !formData.endTime) {
      const [hours, minutes] = formData.visitTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:00`;
      setFormData(prev => ({ ...prev, endTime: endTimeStr }));
    }
  }, [formData.visitTime]);

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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto z-50"
        style={{ backgroundColor: 'white' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="font-medium text-xl"
            style={{ color: 'var(--primary-950)' }}
          >
            Create new reservation
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
            {/* Two-column layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Select Client:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.clientId || ""}
                      onChange={(e) => handleClientChange(Number(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">- Select a client -</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} ({client.email})
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
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Contact Number:</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.phone}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                    style={{ 
                      borderColor: 'var(--neutral-300)',
                      color: 'var(--primary-950)',
                      backgroundColor: 'var(--neutral-100)',
                    }}
                    placeholder="Auto-filled from client"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Email:</label>
                  <input
                    type="email"
                    readOnly
                    value={formData.email}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                    style={{ 
                      borderColor: 'var(--neutral-300)',
                      color: 'var(--primary-950)',
                      backgroundColor: 'var(--neutral-100)',
                    }}
                    placeholder="Auto-filled from client"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Select Car:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.carId || ""}
                      onChange={(e) => handleCarChange(Number(e.target.value) || undefined)}
                      disabled={!formData.clientId}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 disabled:opacity-50"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">{formData.clientId ? '- Select a car -' : '- Select client first -'}</option>
                      {clientCars.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.make} {car.model} {(car.produced || car.year) ? `(${car.produced || car.year})` : ''} - {car.licensePlate}
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
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Service:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.serviceId || ""}
                      onChange={(e) => setFormData({ ...formData, serviceId: Number(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">-</option>
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
                  <div className="relative">
                    <select
                      required
                      value={formData.mechanicId || ""}
                      onChange={(e) => setFormData({ ...formData, mechanicId: Number(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">-</option>
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

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Visit date:</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.visitDate}
                      onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    />
                    <Calendar 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Start time:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.visitTime}
                      onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">-</option>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <option key={i} value={`${hour}:00`}>{hour}:00</option>
                        );
                      })}
                    </select>
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>End time:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
                      <option value="">-</option>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <option key={i} value={`${hour}:00`}>{hour}:00</option>
                        );
                      })}
                    </select>
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>
                    Duration must be 30 minutes to 2 hours
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Additional details:</label>
                  <textarea
                    value={formData.additionalDetails}
                    onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                    }}
                    placeholder="Start typing additional details"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Status:</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 capitalize"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    >
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
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                {validationError}
              </div>
            )}

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
                className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90"
                style={{ 
                  backgroundColor: 'var(--primary-600)',
                  borderColor: 'var(--primary-600)',
                  color: 'white',
                }}
              >
                Create Reservation
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
