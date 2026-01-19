'use client';

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { CarDto } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";
import { useAuth } from "@/app/api";

type AddVehicleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AddVehicleModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVehicleModalProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    year: new Date().getFullYear().toString(),
    plate: '',
  });

  // Common car models
  const carModels = [
    'Toyota Corolla',
    'Volkswagen Golf',
    'BMW 3 Series',
    'Ford Focus',
    'Honda Civic',
    'Audi A4',
    'Mercedes-Benz C-Class',
    'Hyundai Elantra',
    'Mazda 3',
    'Nissan Altima',
  ];

  // Generate years from current year down to 1990
  const years = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        model: '',
        year: new Date().getFullYear().toString(),
        plate: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.userId || !formData.model || !formData.year || !formData.plate) {
      return;
    }

    setSaving(true);
    try {
      // Parse model (e.g., "Toyota Corolla" -> make: "Toyota", model: "Corolla")
      const modelParts = formData.model.split(' ');
      const make = modelParts[0] || '';
      const model = modelParts.slice(1).join(' ') || '';

      const vehicleData: CarDto = {
        make,
        model,
        year: parseInt(formData.year),
        licensePlate: formData.plate,
        ownerId: user.userId,
      };

      const response = await httpClient.post<CarDto, CarDto>(
        API_CONFIG.ENDPOINTS.CARS.CREATE,
        vehicleData
      );

      if (response.error) {
        console.error("Error creating vehicle:", response.error);
        alert(`Failed to create vehicle: ${response.error}`);
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating vehicle:", error);
      alert("Failed to create vehicle");
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[500px] z-50"
        style={{ backgroundColor: 'white' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="font-medium text-xl"
            style={{ color: 'var(--primary-950)' }}
          >
            Add New Vehicle
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:opacity-70 transition-colors"
            style={{ color: 'var(--neutral-500)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Model:</label>
              <div className="relative">
                <select
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--neutral-400)',
                    color: formData.model ? 'var(--primary-950)' : 'var(--neutral-500)',
                  }}
                >
                  <option value="">Select model</option>
                  {carModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
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
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--neutral-600)' }}>Year:</label>
              <div className="relative">
                <select
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--neutral-400)',
                    color: 'var(--primary-950)',
                  }}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
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
                required
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: 'var(--neutral-400)',
                  color: 'var(--primary-950)',
                }}
                placeholder="WA12345"
              />
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
              disabled={saving || !formData.model || !formData.year || !formData.plate}
              className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
