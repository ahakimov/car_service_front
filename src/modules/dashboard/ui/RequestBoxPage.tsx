'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { VisitorRequestsTable } from '../components/VisitorRequestsTable';
import { VisitorRequestDetailsModal } from '../components/VisitorRequestDetailsModal';
import { DeleteModal, Notification } from '../components';
import { useNotification, usePagination, useModals } from '../hooks';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import type { VisitorRequest } from '@/app/api/types';

export function RequestBoxPage() {
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, hideNotification } = useNotification();
  const { modals, openModal, closeModal } = useModals();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get<VisitorRequest[]>(API_CONFIG.ENDPOINTS.VISITOR_REQUESTS.LIST);

      if (response.error) {
        // Show detailed error message
        let errorMsg = response.error;
        if (response.status === 403) {
          errorMsg = 'Access denied. You need admin permissions to view visitor requests.';
        } else if (response.status === 401) {
          errorMsg = 'Authentication required. Please log in again.';
        }
        showNotification('Error', errorMsg, 'error');
        setRequests([]); // Clear requests on error
        console.error('Error fetching visitor requests:', response);
      } else if (response.data) {
        // Success - set the requests (even if empty array)
        setRequests(response.data || []);
      } else {
        // No data and no error - might be empty response
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching visitor requests:', error);
      showNotification('Error', 'Failed to fetch visitor requests. Please check your connection.', 'error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Pagination
  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedRequests } = usePagination(requests, { itemsPerPage: 10 });

  const handleDetails = (id: number) => {
    openModal('details', id);
  };

  const handleDelete = (id: number) => {
    openModal('delete', id);
  };

  const confirmDelete = async () => {
    const requestToDelete = modals.delete.id;
    if (requestToDelete === null) return;

    try {
      const response = await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.VISITOR_REQUESTS.DELETE(String(requestToDelete))
      );

      if (response.error) {
        showNotification('Error', response.error, 'error');
      } else {
        setRequests((prev) => prev.filter((r) => r.id !== requestToDelete));
        showNotification('Success', 'Request deleted successfully', 'success');
      }
    } catch (error) {
      showNotification('Error', 'Failed to delete request', 'error');
    }

    closeModal('delete');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--primary-900)' }}>
            Request Box
          </h2>
          <p className="text-base mt-1" style={{ color: 'var(--neutral-600)' }}>
            New visitor requests waiting for confirmation. Contact them to verify and create client accounts.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-80 disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: 'var(--neutral-400)',
          }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--neutral-700)' }} />
          <span className="font-medium text-base" style={{ color: 'var(--neutral-700)' }}>
            Refresh
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div
          className="flex-1 rounded-xl p-5"
          style={{ backgroundColor: 'var(--primary-600)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--primary-100)' }}>
            Total Requests
          </p>
          <p className="text-3xl font-semibold mt-1" style={{ color: 'white' }}>
            {requests.length}
          </p>
        </div>
        <div
          className="flex-1 rounded-xl p-5 border"
          style={{ backgroundColor: 'white', borderColor: 'var(--neutral-200)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--neutral-600)' }}>
            New Requests
          </p>
          <p className="text-3xl font-semibold mt-1" style={{ color: 'var(--primary-950)' }}>
            {requests.filter(r => r.status === 'new').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <VisitorRequestsTable
        requests={paginatedRequests}
        onDetails={handleDetails}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {/* Details Modal */}
      {modals.details.id && (
        <VisitorRequestDetailsModal
          isOpen={modals.details.isOpen}
          onClose={() => closeModal('details')}
          requestId={modals.details.id}
          onUpdate={fetchRequests}
          onDelete={fetchRequests}
          onNotification={showNotification}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={modals.delete.isOpen}
        onClose={() => closeModal('delete')}
        onConfirm={confirmDelete}
        title="Delete Request"
        message="Are you sure you want to delete this visitor request? This action cannot be undone."
      />

      {/* Notification */}
      <Notification
        isVisible={notification.visible}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
