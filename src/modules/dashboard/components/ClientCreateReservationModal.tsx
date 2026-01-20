'use client';

import { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import { Mechanic, Service, Car, ReservationDto } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { useAuth } from "@/app/api";

type ClientCreateReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function ClientCreateReservationModal({
  isOpen,
  onClose,
  onSuccess,
}: ClientCreateReservationModalProps) {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clientCars, setClientCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    carId: undefined as number | undefined,
    plate: '',
    serviceId: undefined as number | undefined,
    mechanicId: undefined as number | undefined,
    visitDate: '',
    visitTime: '09:00',
    additionalDetails: '',
  });

  const fetchData = useCallback(async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const [mechanicsRes, servicesRes, carsRes] = await Promise.all([
        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
        httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST),
        httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST),
      ]);

      if (mechanicsRes.data) setMechanics(mechanicsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (carsRes.data) {
        // Filter cars for the current client
        const filtered = carsRes.data.filter(car => car.owner?.id === user.userId);
        setClientCars(filtered);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        visitDate: today,
      }));
    } else {
      // Reset form when modal closes
      resetForm();
    }
  }, [isOpen, fetchData]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      carId: undefined,
      plate: '-',
      serviceId: undefined,
      mechanicId: undefined,
      visitDate: today,
      visitTime: '09:00',
      additionalDetails: '',
    });
  };

  const handleCarChange = (carId: number | undefined) => {
    setFormData(prev => ({
      ...prev,
      carId,
      plate: carId ? clientCars.find(c => c.id === carId)?.licensePlate || '-' : '-',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.userId || !formData.carId) {
      return;
    }

    setSaving(true);
    try {
      // Combine date and time
      const visitDateTime = formData.visitDate && formData.visitTime 
        ? `${formData.visitDate}T${formData.visitTime}:00`
        : '';

      const reservationData: ReservationDto = {
        clientId: user.userId,
        carId: formData.carId,
        serviceId: formData.serviceId,
        mechanicId: formData.mechanicId,
        visitDateTime,
        status: 'unconfirmed',
        additionalDetails: formData.additionalDetails || undefined,
        dateAdded: new Date().toISOString(),
      };

      const response = await httpClient.post<ReservationDto, ReservationDto>(
        API_CONFIG.ENDPOINTS.RESERVATIONS.CREATE,
        reservationData
      );

      if (response.error) {
        console.error("Error creating reservation:", response.error);
        alert(`Failed to create reservation: ${response.error}`);
      } else {
        resetForm();
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Failed to create reservation");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const hasVehicles = clientCars.length > 0;
  const selectedCar = formData.carId ? clientCars.find(c => c.id === formData.carId) : null;

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
        onClick={(e) => e.stopPropagation()}
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
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Car Model:</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.carId || ""}
                      onChange={(e) => handleCarChange(Number(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--neutral-400)',
                        color: hasVehicles ? 'var(--primary-950)' : 'var(--neutral-500)',
                      }}
                      disabled={!hasVehicles}
                    >
                      <option value="">
                        {hasVehicles ? '-' : 'No added vehicle'}
                      </option>
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
                  {!hasVehicles && (
                    <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>
                      Please add a vehicle first
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Plate:</label>
                  <input
                    type="text"
                    value={formData.plate || '-'}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: formData.plate && formData.plate !== '-' ? 'var(--primary-950)' : 'var(--neutral-500)',
                      backgroundColor: 'var(--neutral-50)',
                    }}
                    placeholder="-"
                  />
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
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Visit time:</label>
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
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                    <ChevronDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--neutral-500)' }}
                    />
                  </div>
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
              </div>
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
                disabled={!hasVehicles || saving}
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
