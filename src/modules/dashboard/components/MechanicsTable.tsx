'use client';

import { Eye, Trash2 } from "lucide-react";
import { Mechanic } from "@/app/api/types";

type MechanicsTableProps = {
  mechanics: Mechanic[];
  onDetails: (id: number) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export function MechanicsTable({
  mechanics,
  onDetails,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: MechanicsTableProps) {
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

  // Helper function to get status - for now, we'll determine based on logic
  // In a real app, this would come from the backend
  const getMechanicStatus = (mechanic: Mechanic): string => {
    // For now, simulate status based on ID (can be replaced with actual status from backend)
    const statuses = ['Busy', 'Available', 'On Leave', 'Available', 'Available'];
    return statuses[(mechanic.id || 0) % statuses.length];
  };

  // Helper function to get next reservation time - placeholder for now
  const getNextReservationTime = (mechanic: Mechanic): string => {
    const times = ['09:30', '10:15', '12:45', '15:00', '15:00'];
    return times[(mechanic.id || 0) % times.length];
  };

  // Helper function to get today's reservations count - placeholder for now
  const getTodayReservations = (mechanic: Mechanic): number => {
    const counts = [8, 9, 7, 4, 4];
    return counts[(mechanic.id || 0) % counts.length];
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
            <p style={{ color: 'var(--neutral-600)' }}>Loading mechanics...</p>
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
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                ID
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Name
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Status
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Next Reservation Time
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Today's Reservations
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Specialty
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mechanics.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-32 text-center">
                  <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    Nothing to see here. Let's add new data.
                  </p>
                </td>
              </tr>
            ) : (
              mechanics.map((mechanic, index) => {
                const status = getMechanicStatus(mechanic);
                const statusStyle = getStatusStyle(status);
                return (
                  <tr
                    key={mechanic.id}
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white' }}
                  >
                    <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {mechanic.id}
                    </td>
                    <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {mechanic.name || '-'}
                    </td>
                    <td className="px-4 py-6">
                      <span
                        className="inline-block px-3 py-1 rounded-full font-medium text-sm capitalize"
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {getNextReservationTime(mechanic)}
                    </td>
                    <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {getTodayReservations(mechanic)}
                    </td>
                    <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {mechanic.specialty || '-'}
                    </td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDetails(mechanic.id!)}
                          className="flex items-center gap-2 px-4 py-2 border rounded-3xl transition-colors hover:opacity-80"
                          style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)' }}
                        >
                          <Eye className="w-4 h-4" style={{ color: 'var(--primary-950)' }} />
                          <span className="font-medium text-[13px]" style={{ color: 'var(--primary-950)' }}>
                            Details
                          </span>
                        </button>
                        <button
                          onClick={() => onDelete(mechanic.id!)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t" style={{ borderColor: 'var(--primary-100)' }}>
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
