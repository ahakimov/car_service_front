'use client';

import { useState, useEffect, useCallback } from "react";
import { X, ChevronDown, Mail, Upload } from "lucide-react";
import { Mechanic, Reservation } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";

type MechanicDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mechanicId: number;
  onUpdate?: () => void;
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
};

export function MechanicDetailsModal({
  isOpen,
  onClose,
  mechanicId,
  onUpdate,
  onNotification,
}: MechanicDetailsModalProps) {
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    status: 'available',
    employmentStartDate: '',
  });

  const fetchMechanicDetails = useCallback(async () => {
    if (!mechanicId) return;
    setLoading(true);
    try {
      const response = await httpClient.get<Mechanic>(
        API_CONFIG.ENDPOINTS.MECHANICS.GET(String(mechanicId))
      );
      if (response.data) {
        setMechanic(response.data);
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          specialty: response.data.specialty || '',
          status: 'busy', // Default status, would come from backend
          employmentStartDate: '2025-01-01', // Placeholder, would come from backend
        });
      }
    } catch (error) {
      console.error("Error fetching mechanic details:", error);
    } finally {
      setLoading(false);
    }
  }, [mechanicId]);

  const fetchMechanicReservations = useCallback(async () => {
    if (!mechanicId) return;
    try {
      const response = await httpClient.post<Reservation[], { mechanicId?: number }>(
        API_CONFIG.ENDPOINTS.RESERVATIONS.FILTER,
        { mechanicId }
      );
      if (response.data) {
        setReservations(response.data);
      }
    } catch (error) {
      console.error("Error fetching mechanic reservations:", error);
    }
  }, [mechanicId]);

  useEffect(() => {
    if (isOpen && mechanicId) {
      fetchMechanicDetails();
      fetchMechanicReservations();
      setIsEditing(false);
    } else {
      setMechanic(null);
      setIsEditing(false);
    }
  }, [isOpen, mechanicId, fetchMechanicDetails, fetchMechanicReservations]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      return `${date.toISOString().split('T')[0]} (${monthsDiff} months ago)`;
    } catch {
      return dateString;
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "busy":
        return {
          bg: 'var(--primary-100)',
          text: 'var(--primary-700)',
        };
      case "available":
        return {
          bg: 'var(--success-100)',
          text: 'var(--success-600)',
        };
      case "on leave":
      case "onleave":
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
    if (!mechanic) return;
    setSaving(true);
    try {
      const updateData: Mechanic = {
        id: mechanic.id,
        name: formData.name,
        phone: formData.phone,
        specialty: formData.specialty,
      };

      const response = await httpClient.put<Mechanic, Mechanic>(
        API_CONFIG.ENDPOINTS.MECHANICS.UPDATE,
        updateData
      );

      if (response.error) {
        if (onNotification) {
          onNotification('Error', `Failed to update mechanic: ${response.error}`, 'error');
        }
      } else {
        setIsEditing(false);
        fetchMechanicDetails();
        if (onUpdate) onUpdate();
        if (onNotification) {
          onNotification('Successfully updated mechanic', 'Your changes have been saved', 'success');
        }
      }
    } catch (error) {
      console.error("Error saving mechanic:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to save mechanic', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (mechanic) {
      setFormData({
        name: mechanic.name || '',
        phone: mechanic.phone || '',
        specialty: mechanic.specialty || '',
        status: 'busy',
        employmentStartDate: '2025-01-01',
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Calculate statistics
  const assignedReservationsThisMonth = reservations.length; // Simplified - would filter by current month
  const completedJobsThisMonth = reservations.filter(r => r.status?.toLowerCase() === 'completed' || r.status?.toLowerCase() === 'confirmed').length;

  const statusStyle = getStatusStyle(formData.status);

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
            Mechanic details
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
        ) : mechanic ? (
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2" style={{ backgroundColor: 'var(--neutral-100)', borderColor: 'var(--neutral-300)' }}>
                {/* Placeholder for profile picture */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-300">
                  <span className="text-2xl font-medium" style={{ color: 'var(--neutral-700)' }}>
                    {mechanic.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    className="absolute top-1 right-1 p-1.5 rounded-full shadow-sm"
                    style={{ backgroundColor: 'var(--primary-600)' }}
                  >
                    <Upload className="w-3 h-3" style={{ color: 'white' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Name:</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      />
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--neutral-500)' }}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        className="w-full px-3 py-2 pl-10 border rounded-lg text-sm"
                        style={{
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                          backgroundColor: 'var(--neutral-50)',
                        }}
                      >
                        {mechanic.name || '-'}
                      </div>
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--neutral-500)' }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Employment start date:</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.employmentStartDate}
                      onChange={(e) => setFormData({ ...formData, employmentStartDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    />
                  ) : (
                    <p className="text-sm px-3 py-2" style={{ color: 'var(--primary-950)' }}>
                      {formatDate(formData.employmentStartDate)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Assigned reservations this month:</label>
                  <p className="text-sm px-3 py-2" style={{ color: 'var(--primary-950)' }}>
                    {assignedReservationsThisMonth}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Status:</label>
                  {isEditing ? (
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
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="on leave">On Leave</option>
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
                        {formData.status}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Contact Number:</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                        }}
                      />
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--neutral-500)' }}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        className="w-full px-3 py-2 pl-10 border rounded-lg text-sm"
                        style={{
                          borderColor: 'var(--neutral-400)',
                          color: 'var(--primary-950)',
                          backgroundColor: 'var(--neutral-50)',
                        }}
                      >
                        {mechanic.phone || '-'}
                      </div>
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--neutral-500)' }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Specialty:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--neutral-400)',
                        color: 'var(--primary-950)',
                      }}
                    />
                  ) : (
                    <p className="text-sm px-3 py-2" style={{ color: 'var(--primary-950)' }}>
                      {mechanic.specialty || '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Completed jobs this month:</label>
                  <p className="text-sm px-3 py-2" style={{ color: 'var(--primary-950)' }}>
                    {completedJobsThisMonth}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>ID:</label>
                  <p className="text-sm px-3 py-2" style={{ color: 'var(--primary-950)' }}>
                    {String(mechanic.id || '-').padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
              <button
                className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--neutral-400)',
                  color: 'var(--primary-700)',
                }}
              >
                Check schedule
              </button>
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
              Mechanic not found
            </p>
          </div>
        )}
      </div>
    </>
  );
}
