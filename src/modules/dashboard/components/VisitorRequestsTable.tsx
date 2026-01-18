'use client';

import { Eye, Trash2 } from "lucide-react";
import { VisitorRequest } from "@/app/api/types";

type VisitorRequestsTableProps = {
  requests: VisitorRequest[];
  onDetails: (id: number) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

const formatDateTime = (visitDate?: string, time?: string) => {
  if (!visitDate) return time || '-';
  try {
    const date = new Date(visitDate);
    if (isNaN(date.getTime())) return time || '-';
    return `${date.toLocaleDateString()} ${time || ''}`;
  } catch {
    return time || '-';
  }
};

export function VisitorRequestsTable({
  requests,
  onDetails,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: VisitorRequestsTableProps) {
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
            <p style={{ color: 'var(--neutral-600)' }}>Loading requests...</p>
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
                Phone
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Service
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Date & Time
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Status
              </th>
              <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-32 text-center">
                  <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    No visitor requests yet.
                  </p>
                </td>
              </tr>
            ) : (
              requests.map((request, index) => (
                <tr
                  key={request.id}
                  style={{ backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white' }}
                >
                  <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                    {request.id}
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--accent-100)' }}
                      >
                        <span className="font-medium text-sm" style={{ color: 'var(--accent-700)' }}>
                          {request.fullName?.charAt(0).toUpperCase() || 'V'}
                        </span>
                      </div>
                      <span className="text-[13px]" style={{ color: 'var(--primary-950)' }}>
                        {request.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                    {request.contactNumber || '-'}
                  </td>
                  <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                    {request.serviceName || '-'}
                  </td>
                  <td className="px-4 py-6 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                    {formatDateTime(request.visitDate, request.time)}
                  </td>
                  <td className="px-4 py-6">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: request.status === 'new' ? 'var(--accent-100)' : 'var(--neutral-100)',
                        color: request.status === 'new' ? 'var(--accent-700)' : 'var(--neutral-600)',
                      }}
                    >
                      {request.status === 'new' ? 'New' : request.status || 'New'}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDetails(request.id!)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-3xl transition-colors hover:opacity-80"
                        style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)' }}
                      >
                        <Eye className="w-4 h-4" style={{ color: 'var(--primary-950)' }} />
                        <span className="font-medium text-[13px]" style={{ color: 'var(--primary-950)' }}>
                          Details
                        </span>
                      </button>
                      <button
                        onClick={() => onDelete(request.id!)}
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
              ))
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
            className="px-4 py-2 border rounded-lg text-[13px] transition-colors disabled:opacity-50"
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
            className="px-4 py-2 border rounded-lg text-[13px] transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)', color: 'var(--neutral-700)' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
