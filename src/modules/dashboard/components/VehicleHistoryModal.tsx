'use client';

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Reservation, RepairJob } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";

type VehicleHistoryItem = {
  id: number;
  date: string;
  type: "Reservation" | "Repair Job";
  servicePerformed: string;
  status: string;
  mechanic: string;
};

type VehicleHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehicleName?: string;
};

export function VehicleHistoryModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
}: VehicleHistoryModalProps) {
  const [history, setHistory] = useState<VehicleHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!vehicleId) return;
    
    setLoading(true);
    try {
      // Fetch reservations and repair jobs for this vehicle
      const [reservationsRes, repairJobsRes] = await Promise.all([
        httpClient.get<Reservation[]>(API_CONFIG.ENDPOINTS.RESERVATIONS.LIST),
        httpClient.get<RepairJob[]>(API_CONFIG.ENDPOINTS.REPAIR_JOBS.LIST),
      ]);

      const historyItems: VehicleHistoryItem[] = [];

      // Process reservations
      if (reservationsRes.data) {
        reservationsRes.data
          .filter((reservation) => reservation.car?.id === vehicleId)
          .forEach((reservation) => {
            historyItems.push({
              id: reservation.id || 0,
              date: reservation.visitDateTime || reservation.dateAdded || '',
              type: "Reservation",
              servicePerformed: reservation.service?.serviceName || '-',
              status: reservation.status || '-',
              mechanic: reservation.mechanic?.name || '-',
            });
          });
      }

      // Process repair jobs
      // Note: RepairJob doesn't have direct car reference in the current schema
      // We'll include repair jobs, but ideally this should be filtered by vehicle on the backend
      if (repairJobsRes.data) {
        repairJobsRes.data.forEach((job) => {
          historyItems.push({
            id: job.id || 0,
            date: job.startDateTime || '',
            type: "Repair Job",
            servicePerformed: job.service?.serviceName || '-',
            status: job.status || '-',
            mechanic: job.mechanic?.name || '-',
          });
        });
      }

      // Sort by date (newest first)
      historyItems.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      setHistory(historyItems);
    } catch (error) {
      console.error("Error fetching vehicle history:", error);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    if (isOpen && vehicleId) {
      fetchHistory();
    }
  }, [isOpen, vehicleId, fetchHistory]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto z-50"
        style={{ backgroundColor: 'white' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="font-medium text-xl"
            style={{ color: 'var(--primary-950)' }}
          >
            Vehicle history
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
          <div className="space-y-6">
            {/* History Table */}
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--primary-100)' }}>
                      <th 
                        className="px-4 py-3 text-left font-normal text-[13px]"
                        style={{ color: 'var(--primary-950)' }}
                      >
                        Date
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-normal text-[13px]"
                        style={{ color: 'var(--primary-950)' }}
                      >
                        Type
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-normal text-[13px]"
                        style={{ color: 'var(--primary-950)' }}
                      >
                        Service Performed
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-normal text-[13px]"
                        style={{ color: 'var(--primary-950)' }}
                      >
                        Status
                      </th>
                      <th 
                        className="px-4 py-3 text-left font-normal text-[13px]"
                        style={{ color: 'var(--primary-950)' }}
                      >
                        Mechanic
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-32 text-center">
                          <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                            No history found for this vehicle.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      history.map((item, index) => (
                        <tr
                          key={`${item.type}-${item.id}`}
                          style={{ 
                            backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white' 
                          }}
                        >
                          <td 
                            className="px-4 py-4 text-[13px]"
                            style={{ color: 'var(--primary-950)' }}
                          >
                            {formatDate(item.date)}
                          </td>
                          <td 
                            className="px-4 py-4 text-[13px]"
                            style={{ color: 'var(--primary-950)' }}
                          >
                            {item.type}
                          </td>
                          <td 
                            className="px-4 py-4 text-[13px]"
                            style={{ color: 'var(--primary-950)' }}
                          >
                            {item.servicePerformed}
                          </td>
                          <td 
                            className="px-4 py-4 text-[13px] capitalize"
                            style={{ color: 'var(--primary-950)' }}
                          >
                            {item.status}
                          </td>
                          <td 
                            className="px-4 py-4 text-[13px]"
                            style={{ color: 'var(--primary-950)' }}
                          >
                            {item.mechanic}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Return Button */}
            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
              <button
                onClick={onClose}
                className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-80"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: 'var(--neutral-400)',
                  color: 'var(--neutral-700)',
                }}
              >
                Return
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
