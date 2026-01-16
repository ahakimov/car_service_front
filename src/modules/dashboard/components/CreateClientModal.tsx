'use client';

import { useState } from "react";
import { X, Mail } from "lucide-react";
import { Client } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";

type CreateClientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onNotification?: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
};

export function CreateClientModal({
  isOpen,
  onClose,
  onSuccess,
  onNotification,
}: CreateClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    additionalDetails: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const clientData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
      };

      const response = await httpClient.post<Client, typeof clientData>(
        API_CONFIG.ENDPOINTS.CLIENTS.CREATE,
        clientData
      );

      if (response.error) {
        if (onNotification) {
          onNotification('Error', `Failed to create client: ${response.error}`, 'error');
        }
      } else {
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
        if (onNotification) {
          onNotification('Successfully added client', 'Your changes have been saved', 'success');
        }
      }
    } catch (error) {
      console.error("Error creating client:", error);
      if (onNotification) {
        onNotification('Error', 'Failed to create client', 'error');
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
      additionalDetails: '',
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
            Add new client
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
          {/* Contact information */}
          <div className="flex flex-col gap-4">
            <h3 
              className="font-medium text-base"
              style={{ color: 'var(--primary-950)' }}
            >
              Contact information
            </h3>
            <div className="grid grid-cols-3 gap-4">
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
                    placeholder="John Doe"
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
                    placeholder="example@example.com"
                  />
                  <Mail 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--neutral-500)' }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
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
                Client will use this password to log in
              </p>
            </div>
          </div>

          {/* Additional details */}
          <div className="flex flex-col gap-4">
            <h3 
              className="font-medium text-base"
              style={{ color: 'var(--primary-950)' }}
            >
              Additional details
            </h3>
            <textarea
              value={formData.additionalDetails}
              onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ 
                borderColor: 'var(--neutral-400)',
                color: 'var(--primary-950)',
                minHeight: '100px',
              }}
              placeholder="Start typing additional details"
            />
          </div>

          {/* Registered vehicles */}
          <div className="flex flex-col gap-4">
            <h3 
              className="font-medium text-base"
              style={{ color: 'var(--primary-950)' }}
            >
              Registered vehicles
            </h3>
            <button
              type="button"
              className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:opacity-80 self-start"
              style={{ 
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--primary-700)',
              }}
            >
              Add new vehicle
            </button>
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--neutral-200)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--neutral-200)', backgroundColor: 'var(--neutral-50)' }}>
                    <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      Model
                    </th>
                    <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      Year
                    </th>
                    <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      Plate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="px-4 py-32 text-center">
                      <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                        Nothing to see here. Let's add new data.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
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
