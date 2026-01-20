'use client';

import { Eye, Trash2 } from "lucide-react";
import { Reservation } from "@/app/api/types";
import { getStatusStyle, formatDateShort, formatTime, EMPTY_STATE_MESSAGE } from "../utils";

type ClientReservationsTableProps = {
  reservations: Reservation[];
  onDetails: (id: number) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export function ClientReservationsTable({
  reservations,
  onDetails,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: ClientReservationsTableProps) {
  const getVehicleDisplay = (reservation: Reservation) => {
    if (!reservation.car) return '-';
    const { make, model, year, licensePlate } = reservation.car;
    const carInfo = `${make || ''} ${model || ''} ${year || ''}`.trim();
    return licensePlate ? `${carInfo} (${licensePlate})` : carInfo || '-';
  };

  if (loading) {
    return (
      <div 
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}
      >
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--neutral-600)' }}>Loading reservations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--primary-100)' }}>
              {['ID', 'Date & time', 'Vehicle', 'Service type', 'Status', 'Actions'].map((header) => (
                <th 
                  key={header}
                  className="px-4 py-3 text-left font-normal text-[13px]"
                  style={{ color: 'var(--primary-950)' }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-32 text-center">
                  <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    {EMPTY_STATE_MESSAGE}
                  </p>
                </td>
              </tr>
            ) : (
              reservations.map((reservation, index) => {
                const statusStyle = getStatusStyle(reservation.status);
                return (
                  <tr
                    key={reservation.id}
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white' }}
                  >
                    <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {reservation.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-0">
                        <p className="text-[13px] leading-6" style={{ color: 'var(--primary-950)' }}>
                          {formatDateShort(reservation.visitDateTime)}
                        </p>
                        <p className="text-[13px] leading-6" style={{ color: 'var(--neutral-600)' }}>
                          {formatTime(reservation.visitDateTime)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {getVehicleDisplay(reservation)}
                    </td>
                    <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {reservation.service?.serviceName || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full font-medium text-[13px] capitalize"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {reservation.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDetails(reservation.id!)}
                          className="flex items-center gap-2 px-4 py-2 border rounded-3xl transition-colors hover:opacity-80"
                          style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)' }}
                        >
                          <Eye className="w-4 h-4" style={{ color: 'var(--primary-950)' }} />
                          <span className="font-medium text-[13px]" style={{ color: 'var(--primary-950)' }}>
                            Details
                          </span>
                        </button>
                        <button
                          onClick={() => onDelete(reservation.id!)}
                          className="group flex items-center gap-2 px-4 py-2 border rounded-3xl transition-all duration-200"
                          style={{ backgroundColor: 'white', borderColor: 'var(--danger-200)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--danger-500)';
                            e.currentTarget.style.borderColor = 'var(--danger-500)';
                            e.currentTarget.querySelectorAll('svg, span').forEach((el) => {
                              (el as HTMLElement).style.color = 'white';
                            });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = 'var(--danger-200)';
                            e.currentTarget.querySelectorAll('svg, span').forEach((el) => {
                              (el as HTMLElement).style.color = 'var(--danger-500)';
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 transition-colors duration-200" style={{ color: 'var(--danger-500)' }} />
                          <span className="font-medium text-[13px] transition-colors duration-200" style={{ color: 'var(--danger-500)' }}>
                            Delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div 
          className="flex items-center justify-between px-4 py-4 border-t"
          style={{ borderColor: 'var(--primary-100)' }}
        >
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)', color: 'var(--neutral-700)' }}
          >
            Previous
          </button>
          <span className="text-[13px]" style={{ color: 'var(--neutral-700)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)', color: 'var(--neutral-700)' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
