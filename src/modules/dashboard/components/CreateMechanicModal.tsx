'use client';

import { useState } from "react";
import { X, Mail, Calendar, ChevronDown, Upload } from "lucide-react";
import { Mechanic } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";

type CreateMechanicModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
};

export function CreateMechanicModal({
  isOpen,
  onClose,
  onSuccess,
  onNotification,
}: CreateMechanicModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    specialty: '',
    experience: 0,
    employmentStartDate: '',
    status: 'available',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Create mechanic data WITHOUT id (backend will generate it)
      const mechanicData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        specialty: formData.specialty,
        experience: formData.experience,
        // Explicitly exclude id - backend will generate it
      };

      const response = await httpClient.post<Mechanic, typeof mechanicData>(
        API_CONFIG.ENDPOINTS.MECHANICS.CREATE,
        mechanicData
      );

      if (response.error) {
        if (onNotification) {
          onNotification('Error', `Failed to create mechanic: ${response.error}`, 'error');
        }
      } else {
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
        if (onNotification) {
          onNotification('Successfully created mechanic', 'Your changes have been saved', 'success');
        }
      }
    } catch (error) {
      console.error("Error creating mechanic:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to create mechanic', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      specialty: '',
      experience: 0,
      employmentStartDate: '',
      status: 'available',
    });
  };

  const handleClose = () => {
    resetForm();
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto z-50"
        style={{ backgroundColor: 'white' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="font-medium text-xl"
            style={{ color: 'var(--primary-950)' }}
          >
            Add new mechanic
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 rounded-md hover:opacity-70 transition-colors"
            style={{ color: 'var(--neutral-500)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Profile Picture */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2" style={{ backgroundColor: 'var(--neutral-100)', borderColor: 'var(--neutral-300)' }}>
              {/* Placeholder for profile picture */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-orange-300">
                <span className="text-2xl font-medium" style={{ color: 'var(--neutral-700)' }}>
                  {formData.name.charAt(0).toUpperCase() || 'M'}
                </span>
              </div>
              <button
                type="button"
                className="absolute top-1 right-1 p-1.5 rounded-full shadow-sm"
                style={{ backgroundColor: 'var(--primary-600)' }}
              >
                <Upload className="w-3 h-3" style={{ color: 'white' }} />
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Name:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                    }}
                    placeholder="Jan Kowalski"
                  />
                  <Mail 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--neutral-500)' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Contact Number:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                    }}
                    placeholder="48 123 456 789"
                  />
                  <Mail 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--neutral-500)' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Email:</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                    }}
                    placeholder="mechanic@example.com"
                  />
                  <Mail 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--neutral-500)' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Password:</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: 'var(--primary-950)',
                    }}
                    placeholder="Minimum 6 characters"
                  />
                  <Mail 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--neutral-500)' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>
                  Mechanic will use this password to log in
                </p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Employment start date:</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.employmentStartDate}
                    onChange={(e) => setFormData({ ...formData, employmentStartDate: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: 'var(--neutral-400)',
                      color: formData.employmentStartDate ? 'var(--primary-950)' : 'var(--neutral-500)',
                    }}
                    placeholder="Select date"
                  />
                  <Calendar 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--neutral-500)' }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Specialty:</label>
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--neutral-400)',
                    color: 'var(--primary-950)',
                  }}
                  placeholder="Oil Change"
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
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="on leave">On Leave</option>
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
          <div className="flex items-center justify-end gap-3 pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80"
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
              className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--primary-600)',
                borderColor: 'var(--primary-600)',
                color: 'white',
              }}
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
