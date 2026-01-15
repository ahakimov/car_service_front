'use client';

import { Eye, Trash2 } from "lucide-react";
import { Reservation } from "@/app/api/types";
import { formatDate, EMPTY_STATE_MESSAGE } from "../utils";

type ReservationTableProps = {
  reservations: Reservation[];
  onDetails: (id: number) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

// Determine display status based on start and end times
function getDisplayStatus(reservation: Reservation): string {
  // If cancelled, always show cancelled
  if (reservation.status?.toLowerCase() === 'cancelled') {
    return 'Cancelled';
  }
  
  if (!reservation.visitDateTime) {
    return reservation.status || 'Unknown';
  }

  const now = new Date();
  const startTime = new Date(reservation.visitDateTime);
  const endTime = reservation.endDateTime ? new Date(reservation.endDateTime) : null;

  // If current time is before start time → Confirmed (upcoming)
  if (now < startTime) {
    return 'Confirmed';
  }
  
  // If current time is after end time → Ended
  if (endTime && now > endTime) {
    return 'Ended';
  }
  
  // If current time is between start and end → In Progress
  if (now >= startTime && (!endTime || now <= endTime)) {
    return 'In Progress';
  }

  return reservation.status || 'Unknown';
}

// Get status style based on display status
function getStatusStyle(status?: string): { bg: string; text: string } {
  switch (status?.toLowerCase()) {
    case "unconfirmed":
    case "pending":
      return { bg: 'var(--primary-100)', text: 'var(--primary-700)' };
    case "confirmed":
      return { bg: 'var(--success-100)', text: 'var(--success-600)' };
    case "in progress":
      return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue for in progress
    case "ended":
    case "completed":
      return { bg: '#DCFCE7', text: '#166534' }; // Green for completed/ended
    case "cancelled":
      return { bg: 'var(--danger-100)', text: 'var(--danger-600)' };
    default:
      return { bg: 'var(--neutral-100)', text: 'var(--neutral-700)' };
  }
}

export function ReservationTable({
  reservations,
  onDetails,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: ReservationTableProps) {
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
              {['ID', 'Contact info', 'Mechanic', 'Date added', 'Status', 'Actions'].map((header) => (
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
                const displayStatus = getDisplayStatus(reservation);
                const statusStyle = getStatusStyle(displayStatus);
                return (
                  <tr
                    key={reservation.id}
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white' }}
                  >
                    <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {reservation.id}
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex flex-col gap-0">
                        <p className="text-[13px] leading-6" style={{ color: 'var(--primary-950)' }}>
                          {reservation.client?.name || 'Unknown'}
                        </p>
                        {reservation.client?.email && (
                          <p className="text-[13px] leading-6" style={{ color: 'var(--neutral-600)' }}>
                            {reservation.client.email}
                          </p>
                        )}
                        {reservation.client?.phone && (
                          <p className="text-[13px] leading-6" style={{ color: 'var(--neutral-600)' }}>
                            {reservation.client.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {reservation.mechanic?.name || 'Not assigned'}
                    </td>
                    <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {formatDate(reservation.dateAdded || reservation.visitDateTime)}
                    </td>
                    <td className="px-4 py-6">
                      <span
                        className="inline-block px-3 py-1 rounded-full font-medium text-[13px] capitalize"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-4 py-6">
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
                          className="flex items-center gap-2 px-4 py-2 border rounded-3xl transition-colors hover:opacity-80"
                          style={{ backgroundColor: 'white', borderColor: 'var(--danger-200)' }}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: 'var(--danger-500)' }} />
                          <span className="font-medium text-[13px]" style={{ color: 'var(--danger-500)' }}>
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
