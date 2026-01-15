'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { MetricCard, ReservationTable, CreateReservationModal, DeleteModal, Notification, ReservationFilterModal, ReservationDetailsModal } from '../components';
import { Reservation, ReservationDto, ReservationFilter } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useNotification, usePagination, useModals } from '../hooks';

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ReservationFilter | undefined>(undefined);
  
  const { notification, showNotification, hideNotification } = useNotification();
  const { modals, openModal, closeModal } = useModals();

  const fetchReservations = useCallback(async (filter?: ReservationFilter) => {
    setLoading(true);
    try {
      let response;
      
      if (filter && Object.keys(filter).some(key => filter[key as keyof ReservationFilter])) {
        // Use filter endpoint
        response = await httpClient.post<Reservation[], ReservationFilter>(
          API_CONFIG.ENDPOINTS.RESERVATIONS.FILTER,
          filter
        );
      } else {
        // Use regular list endpoint
        response = await httpClient.get<Reservation[]>(API_CONFIG.ENDPOINTS.RESERVATIONS.LIST);
      }

      if (response.data) {
        setReservations(response.data);
      } else if (response.error) {
        showNotification('Error', response.error, 'error');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showNotification('Error', 'Failed to fetch reservations', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations(activeFilter);
  }, [fetchReservations, activeFilter]);

  // Filter reservations based on search
  const filteredReservations = reservations.filter((reservation) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      reservation.client?.name?.toLowerCase().includes(searchLower) ||
      reservation.client?.email?.toLowerCase().includes(searchLower) ||
      reservation.client?.phone?.toLowerCase().includes(searchLower) ||
      reservation.mechanic?.name?.toLowerCase().includes(searchLower) ||
      reservation.status?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedReservations } = usePagination(filteredReservations, { itemsPerPage: 10 });

  // Calculate metrics
  const totalCount = reservations.length;
  const unconfirmedCount = reservations.filter((r) => r.status?.toLowerCase() === 'unconfirmed' || r.status?.toLowerCase() === 'pending').length;
  const confirmedCount = reservations.filter((r) => r.status?.toLowerCase() === 'confirmed' || r.status?.toLowerCase() === 'completed').length;
  const cancelledCount = reservations.filter((r) => r.status?.toLowerCase() === 'cancelled').length;

  const handleDetails = (id: number) => {
    openModal('details', id);
  };

  const handleDelete = (id: number) => {
    openModal('delete', id);
  };

  const confirmDelete = async () => {
    const reservationToDelete = modals.delete.id;
    if (reservationToDelete === null) return;

    try {
      const response = await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.RESERVATIONS.DELETE(String(reservationToDelete))
      );
      
      if (response.error) {
        showNotification('Error', response.error, 'error');
      } else {
        setReservations((prev) => prev.filter((r) => r.id !== reservationToDelete));
        showNotification('Success', 'Reservation deleted successfully', 'success');
      }
    } catch (error) {
      showNotification('Error', 'Failed to delete reservation', 'error');
    }
    
    closeModal('delete');
  };

  const handleCreateReservation = async (data: ReservationDto & { name?: string; phone?: string; email?: string; carModel?: string }) => {
    try {
      // For now, we'll need clientId and carId from existing records
      // If backend supports creating client/car on the fly, we can add that logic here
      // For now, extract just the reservation data
      const reservationData: ReservationDto = {
        clientId: (data as any).clientId,
        carId: (data as any).carId,
        mechanicId: data.mechanicId,
        serviceId: data.serviceId,
        visitDateTime: data.visitDateTime,
        status: data.status,
        additionalDetails: data.additionalDetails,
        dateAdded: data.dateAdded,
      };

      // If name/phone/carModel are provided, we might need to create client/car first
      // This would require backend endpoints for creating clients and cars
      // For now, assume clientId and carId are required and will be set by selecting existing records
      
      const response = await httpClient.post<Reservation, ReservationDto>(
        API_CONFIG.ENDPOINTS.RESERVATIONS.CREATE,
        reservationData
      );

      if (response.data) {
        setReservations((prev) => [response.data!, ...prev]);
        showNotification('Successfully created reservation', 'Your changes have been saved', 'success');
        closeModal('create');
      } else if (response.error) {
        showNotification('Error', response.error, 'error');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      showNotification('Error', 'Failed to create reservation', 'error');
    }
  };

  const handleApplyFilter = (filter: ReservationFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilter = () => {
    setActiveFilter(undefined);
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return activeFilter && Object.values(activeFilter).some(v => v !== undefined && v !== '');
  };

  const getActiveFilterCount = () => {
    if (!activeFilter) return 0;
    return Object.values(activeFilter).filter(v => v !== undefined && v !== '').length;
  };

  return (
    <div className="p-6">
      {/* Metric Cards */}
      <div className="flex gap-4 mb-6">
        <MetricCard
          title="Reservations this month"
          value={totalCount}
          change={7}
          variant="primary"
        />
        <MetricCard
          title="Unconfirmed"
          value={unconfirmedCount}
          change={3}
          variant="secondary"
        />
        <MetricCard
          title="Confirmed"
          value={confirmedCount}
          change={5}
          variant="white"
        />
        <MetricCard
          title="Cancelled"
          value={cancelledCount}
          change={-2}
          variant="white"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => openModal('create')}
          className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary-600)',
            borderColor: 'var(--primary-600)',
            color: 'var(--primary-50)',
          }}
        >
          <span className="font-medium text-base">
            Create New Reservation
          </span>
        </button>

        <div className="flex items-center gap-4">
          <div className="relative w-[260px]">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--neutral-500)' }}
            />
            <input
              type="text"
              placeholder="Search by"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
              className="w-full pl-12 pr-4 py-2.5 border rounded-3xl text-base focus:outline-none focus:ring-2 shadow-sm"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--primary-950)',
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilter}
                className="px-4 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-80 flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--primary-100)',
                  borderColor: 'var(--primary-300)',
                }}
              >
                <X className="w-4 h-4" style={{ color: 'var(--primary-700)' }} />
                <span 
                  className="font-medium text-sm"
                  style={{ color: 'var(--primary-700)' }}
                >
                  Clear
                </span>
              </button>
            )}
            <button
              onClick={() => openModal('filter')}
              className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-80 flex items-center gap-2"
              style={{
                backgroundColor: hasActiveFilters() ? 'var(--primary-600)' : 'white',
                borderColor: hasActiveFilters() ? 'var(--primary-600)' : 'var(--neutral-400)',
              }}
            >
              <Filter className="w-5 h-5" style={{ color: hasActiveFilters() ? 'white' : 'var(--neutral-700)' }} />
              <span 
                className="font-medium text-base"
                style={{ color: hasActiveFilters() ? 'white' : 'var(--neutral-700)' }}
              >
                Filter{hasActiveFilters() ? ` (${getActiveFilterCount()})` : ''}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <ReservationTable
        reservations={paginatedReservations}
        onDetails={handleDetails}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {/* Create Modal */}
      <CreateReservationModal
        isOpen={modals.create.isOpen}
        onClose={() => closeModal('create')}
        onSubmit={handleCreateReservation}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={modals.delete.isOpen}
        onClose={() => closeModal('delete')}
        onConfirm={confirmDelete}
        title="Delete Reservation"
        message="Are you sure you want to delete this reservation? This action cannot be undone."
      />

      {/* Filter Modal */}
      <ReservationFilterModal
        isOpen={modals.filter.isOpen}
        onClose={() => closeModal('filter')}
        onApply={handleApplyFilter}
        currentFilter={activeFilter}
      />

      {/* Details Modal */}
      {modals.details.id && (
        <ReservationDetailsModal
          isOpen={modals.details.isOpen}
          onClose={() => closeModal('details')}
          reservationId={modals.details.id}
          onUpdate={() => {
            fetchReservations(activeFilter);
          }}
          onNotification={showNotification}
        />
      )}

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
