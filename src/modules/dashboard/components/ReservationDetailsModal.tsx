'use client';

import { useState, useEffect, useCallback } from "react";
import { X, ChevronDown, Calendar, ExternalLink, Trash2, XCircle } from "lucide-react";
import { Reservation, ReservationDto, Service, Mechanic, Car } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { useAuth } from "@/app/api";
import { DeleteModal } from "./DeleteModal";

type ReservationDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number;
  onUpdate?: () => void;
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  isClientView?: boolean;
  readOnly?: boolean; // If true, hide all edit/delete/cancel actions (for mechanic view)
};

export function ReservationDetailsModal({
  isOpen,
  onClose,
  reservationId,
  onUpdate,
  onNotification,
  isClientView = false,
  readOnly = false,
}: ReservationDetailsModalProps) {
  const { user } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [clientCars, setClientCars] = useState<Car[]>([]);
  const [saving, setSaving] = useState(false);
  const [plateValue, setPlateValue] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<ReservationDto>({
    clientId: undefined,
    carId: undefined,
    mechanicId: undefined,
    serviceId: undefined,
    visitDateTime: "",
    endDateTime: "",
    status: "unconfirmed",
    additionalDetails: "",
  });

  const fetchReservationDetails = useCallback(async () => {
    if (!reservationId) return;
    setLoading(true);
    try {
      const response = await httpClient.get<Reservation>(
        API_CONFIG.ENDPOINTS.RESERVATIONS.GET(String(reservationId))
      );
      if (response.data) {
        setReservation(response.data);
        // Populate form data
        const visitDate = response.data.visitDateTime
          ? new Date(response.data.visitDateTime).toISOString().slice(0, 16)
          : '';
        const endDate = response.data.endDateTime
          ? new Date(response.data.endDateTime).toISOString().slice(0, 16)
          : '';
        setFormData({
          clientId: response.data.client?.id,
          carId: response.data.car?.id,
          mechanicId: response.data.mechanic?.id,
          serviceId: response.data.service?.id,
          visitDateTime: visitDate,
          endDateTime: endDate,
          status: response.data.status || "unconfirmed",
          additionalDetails: response.data.additionalDetails || "",
        });
        setPlateValue(response.data.car?.licensePlate || '');
      }
    } catch (error) {
      console.error("Error fetching reservation details:", error);
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  const fetchServicesAndMechanics = useCallback(async () => {
    try {
      const [servicesRes, mechanicsRes] = await Promise.all([
        httpClient.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST),
        httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST),
      ]);
      if (servicesRes.data) setServices(servicesRes.data);
      if (mechanicsRes.data) setMechanics(mechanicsRes.data);
    } catch (error) {
      console.error("Error fetching services and mechanics:", error);
    }
  }, []);

  const fetchClientCars = useCallback(async () => {
    if (!isClientView || !user?.userId) return;
    try {
      // Fetch client's cars - we'll need to get them from reservations or a cars endpoint
      const response = await httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST);
      if (response.data) {
        // Filter cars for the current client
        const filtered = response.data.filter(car => car.owner?.id === user.userId);
        setClientCars(filtered);
      }
    } catch (error) {
      console.error("Error fetching client cars:", error);
    }
  }, [isClientView, user?.userId]);

  useEffect(() => {
    if (isOpen && reservationId) {
      fetchReservationDetails();
      fetchServicesAndMechanics();
      if (isClientView) {
        fetchClientCars();
      }
      setIsEditing(false);
    } else {
      setReservation(null);
      setIsEditing(false);
    }
  }, [isOpen, reservationId, fetchReservationDetails, fetchServicesAndMechanics, isClientView, fetchClientCars]);

  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return '-';
    }
  };

  const getDateValue = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const getTimeValue = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toTimeString().slice(0, 5);
    } catch {
      return '';
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "unconfirmed":
      case "pending":
        return {
          bg: 'var(--primary-100)',
          text: 'var(--primary-700)',
        };
      case "confirmed":
      case "completed":
        return {
          bg: 'var(--success-100)',
          text: 'var(--success-600)',
        };
      case "cancelled":
        return {
          bg: 'var(--danger-100)',
          text: 'var(--danger-600)',
        };
      default:
        return {
          bg: 'var(--neutral-100)',
          text: 'var(--neutral-700)',
        };
    }
  };

  const handleSave = async () => {
    if (!reservation) return;
    setSaving(true);
    try {
      // If client view and plate changed, update the car's license plate
      if (isClientView && formData.carId && plateValue && plateValue !== reservation.car?.licensePlate) {
        try {
          const carUpdateResponse = await httpClient.put<Car, { licensePlate?: string }>(
            API_CONFIG.ENDPOINTS.CARS.UPDATE(formData.carId),
            { licensePlate: plateValue }
          );
          if (carUpdateResponse.error) {
            console.error("Error updating car plate:", carUpdateResponse.error);
            // Continue with reservation update even if car update fails
          }
        } catch (error) {
          console.error("Error updating car plate:", error);
          // Continue with reservation update even if car update fails
        }
      }

      // Combine date and time if both are available
      let visitDateTime = formData.visitDateTime;
      if (visitDateTime && !visitDateTime.includes('T')) {
        // If it's just a date, we need to preserve the time from original
        const originalDate = reservation.visitDateTime ? new Date(reservation.visitDateTime) : new Date();
        const [datePart] = visitDateTime.split('T');
        visitDateTime = `${datePart}T${originalDate.toTimeString().slice(0, 5)}:00`;
      }

      const finalVisitDateTime = visitDateTime || reservation.visitDateTime;
      const finalEndDateTime = formData.endDateTime || reservation.endDateTime;

      // Validate duration: 30 minutes to 2 hours (only if both times are set)
      if (finalVisitDateTime && finalEndDateTime) {
        const start = new Date(finalVisitDateTime);
        const end = new Date(finalEndDateTime);
        const durationMs = end.getTime() - start.getTime();
        const durationMinutes = durationMs / (1000 * 60);

        if (durationMinutes < 30) {
          if (onNotification) {
            onNotification('Validation Error', 'Reservation duration must be at least 30 minutes', 'error');
          } else {
            alert('Reservation duration must be at least 30 minutes');
          }
          setSaving(false);
          return;
        }
        if (durationMinutes > 120) {
          if (onNotification) {
            onNotification('Validation Error', 'Reservation duration cannot exceed 2 hours', 'error');
          } else {
            alert('Reservation duration cannot exceed 2 hours');
          }
          setSaving(false);
          return;
        }
        if (end <= start) {
          if (onNotification) {
            onNotification('Validation Error', 'End time must be after start time', 'error');
          } else {
            alert('End time must be after start time');
          }
          setSaving(false);
          return;
        }
      }

      const updateData: ReservationDto = {
        ...formData,
        visitDateTime: finalVisitDateTime,
        endDateTime: finalEndDateTime,
        dateAdded: reservation.dateAdded,
      };

      const response = await httpClient.put<Reservation, ReservationDto>(
        API_CONFIG.ENDPOINTS.RESERVATIONS.UPDATE(reservation.id!),
        updateData
      );

      if (response.error) {
        console.error("Error updating reservation:", response.error);
        if (onNotification) {
          onNotification('Error', `Failed to update reservation: ${response.error}`, 'error');
        } else {
          alert("Failed to update reservation: " + response.error);
        }
      } else {
        setIsEditing(false);
        fetchReservationDetails();
        if (onUpdate) onUpdate();
        if (onNotification) {
          onNotification('Successfully updated reservation', 'Your changes have been saved.', 'success');
        }
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to save reservation', 'error');
      } else {
        alert("Failed to save reservation");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original reservation
    if (reservation) {
      const visitDate = reservation.visitDateTime
        ? new Date(reservation.visitDateTime).toISOString().slice(0, 16)
        : '';
      const endDate = reservation.endDateTime
        ? new Date(reservation.endDateTime).toISOString().slice(0, 16)
        : '';
      setFormData({
        clientId: reservation.client?.id,
        carId: reservation.car?.id,
        mechanicId: reservation.mechanic?.id,
        serviceId: reservation.service?.id,
        visitDateTime: visitDate,
        endDateTime: endDate,
        status: reservation.status || "unconfirmed",
        additionalDetails: reservation.additionalDetails || "",
      });
      setPlateValue(reservation.car?.licensePlate || '');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!reservation?.id) return;
    setDeleting(true);
    try {
      const response = await httpClient.delete(
        API_CONFIG.ENDPOINTS.RESERVATIONS.DELETE(String(reservation.id))
      );
      if (response.error) {
        if (onNotification) {
          onNotification('Error', `Failed to delete reservation: ${response.error}`, 'error');
        }
      } else {
        setIsDeleteModalOpen(false);
        onClose();
        if (onNotification) {
          onNotification('Successfully deleted reservation', 'The reservation has been removed.', 'success');
        }
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to delete reservation', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!reservation?.id) return;
    setSaving(true);
    try {
      const updateData: ReservationDto = {
        clientId: reservation.client?.id,
        carId: reservation.car?.id,
        mechanicId: reservation.mechanic?.id,
        serviceId: reservation.service?.id,
        visitDateTime: reservation.visitDateTime,
        endDateTime: reservation.endDateTime,
        status: 'cancelled',
        additionalDetails: reservation.additionalDetails,
        dateAdded: reservation.dateAdded,
      };

      const response = await httpClient.put<Reservation, ReservationDto>(
        API_CONFIG.ENDPOINTS.RESERVATIONS.UPDATE(reservation.id),
        updateData
      );

      if (response.error) {
        if (onNotification) {
          onNotification('Error', `Failed to cancel reservation: ${response.error}`, 'error');
        }
      } else {
        fetchReservationDetails();
        if (onNotification) {
          onNotification('Reservation cancelled', 'The reservation has been cancelled.', 'success');
        }
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to cancel reservation', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const statusStyle = getStatusStyle(reservation?.status || formData.status);

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
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-medium text-xl"
            style={{ color: 'var(--primary-950)' }}
          >
            Reservation details
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
        ) : reservation ? (
          <div className="space-y-6">
            {/* Two-column layout for details */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                {!isClientView && (
                  <>
                    <div>
                      <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Name:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={reservation.client?.name || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'var(--neutral-400)',
                            color: 'var(--primary-950)',
                            backgroundColor: 'var(--neutral-50)',
                          }}
                        />
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                          {reservation.client?.name || '-'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Contact Number:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={reservation.client?.phone || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'var(--neutral-400)',
                            color: 'var(--primary-950)',
                            backgroundColor: 'var(--neutral-50)',
                          }}
                        />
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                          {reservation.client?.phone || '-'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Email:</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={reservation.client?.email || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                          style={{
                            borderColor: 'var(--neutral-400)',
                            color: 'var(--primary-950)',
                            backgroundColor: 'var(--neutral-50)',
                          }}
                        />
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                          {reservation.client?.email || '-'}
                        </p>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Car Model:</label>
                  {isEditing && isClientView ? (
                    <div className="relative">
                      <select
                        value={formData.carId || ""}
                        onChange={(e) => {
                          const carId = Number(e.target.value) || undefined;
                          const selectedCar = clientCars.find(c => c.id === carId);
                          setFormData({ ...formData, carId });
                          setPlateValue(selectedCar?.licensePlate || '');
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      >
                        <option value="">-</option>
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
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {reservation.car ? `${reservation.car.make || ''} ${reservation.car.model || ''} ${reservation.car.year || ''}`.trim() || '-' : '-'}
                    </p>
                  )}
                </div>
                {isClientView && (
                  <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Plate:</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={plateValue}
                        onChange={(e) => setPlateValue(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      />
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                        {reservation.car?.licensePlate || '-'}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Service:</label>
                  {isEditing ? (
                    <div className="relative">
                      <select
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
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {reservation.service?.serviceName || '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Mechanic:</label>
                  {isEditing ? (
                    <div className="relative">
                      <select
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
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {reservation.mechanic?.name || '-'}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Visit date:</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="date"
                        value={getDateValue(formData.visitDateTime || reservation.visitDateTime)}
                        onChange={(e) => {
                          const time = getTimeValue(formData.visitDateTime || reservation.visitDateTime);
                          const newDateTime = e.target.value ? `${e.target.value}T${time || '10:00'}` : '';
                          setFormData({ ...formData, visitDateTime: newDateTime });
                        }}
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
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {formatDate(reservation.visitDateTime)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Visit time:</label>
                  {isEditing && isClientView ? (
                    <div className="relative">
                      <select
                        value={getTimeValue(formData.visitDateTime || reservation.visitDateTime)}
                        onChange={(e) => {
                          const date = getDateValue(formData.visitDateTime || reservation.visitDateTime);
                          const newDateTime = date ? `${date}T${e.target.value}` : '';
                          setFormData({ ...formData, visitDateTime: newDateTime });
                        }}
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
                  ) : isEditing ? (
                    <div className="relative">
                      <input
                        type="time"
                        value={getTimeValue(formData.visitDateTime || reservation.visitDateTime)}
                        onChange={(e) => {
                          const date = getDateValue(formData.visitDateTime || reservation.visitDateTime);
                          const newDateTime = date ? `${date}T${e.target.value}` : '';
                          setFormData({ ...formData, visitDateTime: newDateTime });
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      />
                      <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--neutral-500)' }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {formatTime(reservation.visitDateTime)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>End time:</label>
                  {isEditing && !isClientView ? (
                    <div className="relative">
                      <input
                        type="time"
                        value={getTimeValue(formData.endDateTime || reservation.endDateTime)}
                        onChange={(e) => {
                          const date = getDateValue(formData.visitDateTime || reservation.visitDateTime);
                          const newDateTime = date ? `${date}T${e.target.value}` : '';
                          setFormData({ ...formData, endDateTime: newDateTime });
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {reservation.endDateTime ? formatTime(reservation.endDateTime) : '-'}
                    </p>
                  )}
                  {isEditing && !isClientView && (
                    <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>
                      Duration must be 30 minutes to 2 hours
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Additional details:</label>
                  {isEditing ? (
                    <textarea
                      value={formData.additionalDetails}
                      onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                      style={{
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    />
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                      {reservation.additionalDetails || '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Status:</label>
                  {isEditing && !isClientView ? (
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
                  ) : (
                    <p className="mt-1">
                      <span
                        className="inline-block px-3 py-1 rounded-full font-medium text-sm capitalize"
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {reservation.status || 'Unknown'}
                      </span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>ID:</label>
                  <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                    {String(reservation.id || '-').padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Date added:</label>
                  <p className="text-sm" style={{ color: 'var(--primary-950)' }}>
                    {formatDate(reservation.dateAdded)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
              {/* Left side actions - hidden for client view and read-only mode */}
              {!isClientView && !readOnly && (
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <button
                      className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80 flex items-center gap-2"
                      style={{
                        backgroundColor: 'white',
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--neutral-700)',
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Create Repair Job
                    </button>
                  ) : (
                    <>
                      {reservation?.status?.toLowerCase() !== 'cancelled' && (
                        <button
                          onClick={handleCancelReservation}
                          disabled={saving}
                          className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80 flex items-center gap-2 disabled:opacity-50"
                          style={{
                            backgroundColor: 'white',
                            borderColor: 'var(--warning-300)',
                            color: 'var(--warning-700)',
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                          {saving ? 'Cancelling...' : 'Cancel Reservation'}
                        </button>
                      )}
                      <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80 flex items-center gap-2"
                        style={{
                          backgroundColor: 'white',
                          borderColor: 'var(--danger-300)',
                          color: 'var(--danger-600)',
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
              {/* Right side actions */}
              <div className={`flex items-center gap-3 ${(isClientView || readOnly) ? 'ml-auto' : ''}`}>
                {isEditing && !readOnly ? (
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
                      className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-80 disabled:opacity-50"
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
                    {/* Hide Edit button in read-only mode */}
                    {!readOnly && (
                      <button
                        onClick={handleEdit}
                        className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--primary-600)',
                          borderColor: 'var(--primary-600)',
                          color: 'white',
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              Reservation not found
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Do you want to delete this reservation?"
        message="Are you sure you want to delete this reservation? This action cannot be undone."
      />
    </>
  );
}
