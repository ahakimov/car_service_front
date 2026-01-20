'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { MetricCard, ClientReservationsTable, Notification, ReservationDetailsModal, DeleteModal, ClientCreateReservationModal, ClientReservationFilterModal } from '../components';
import { Reservation } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useAuth } from '@/app/api';
import { useNotification, usePagination, useModals } from '../hooks';

export function ClientReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<{
    dateFrom?: string;
    dateTo?: string;
    carId?: number;
    serviceId?: number;
    mechanicId?: number;
    status?: string;
  } | undefined>(undefined);
  
  const { notification, showNotification, hideNotification } = useNotification();
  const { modals, openModal, closeModal } = useModals();

  const fetchReservations = useCallback(async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      // Fetch reservations for the current client
      const response = await httpClient.get<Reservation[]>(
        API_CONFIG.ENDPOINTS.CLIENTS.RESERVATIONS(user.userId)
      );
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
  }, [user?.userId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Filter reservations based on search and active filters
  const filteredReservations = reservations.filter((reservation) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const vehicleDisplay = reservation.car 
        ? `${reservation.car.make || ''} ${reservation.car.model || ''} ${reservation.car.year || ''}`.trim() + 
          (reservation.car.licensePlate ? ` ${reservation.car.licensePlate}` : '')
        : '';
      const matchesSearch = (
        reservation.service?.serviceName?.toLowerCase().includes(searchLower) ||
        reservation.mechanic?.name?.toLowerCase().includes(searchLower) ||
        reservation.status?.toLowerCase().includes(searchLower) ||
        vehicleDisplay.toLowerCase().includes(searchLower) ||
        (reservation.visitDateTime && new Date(reservation.visitDateTime).toLocaleDateString().toLowerCase().includes(searchLower))
      );
      if (!matchesSearch) return false;
    }

    // Active filter checks
    if (activeFilter) {
      // Date range filter
      if (activeFilter.dateFrom && activeFilter.dateTo && reservation.visitDateTime) {
        const visitDate = new Date(reservation.visitDateTime);
        const fromDate = new Date(activeFilter.dateFrom);
        const toDate = new Date(activeFilter.dateTo);
        if (visitDate < fromDate || visitDate > toDate) return false;
      }

      // Car filter
      if (activeFilter.carId && reservation.car?.id !== activeFilter.carId) return false;

      // Service filter
      if (activeFilter.serviceId && reservation.service?.id !== activeFilter.serviceId) return false;

      // Status filter
      if (activeFilter.status && reservation.status?.toLowerCase() !== activeFilter.status.toLowerCase()) return false;

      // Mechanic filter
      if (activeFilter.mechanicId && reservation.mechanic?.id !== activeFilter.mechanicId) return false;
    }

    return true;
  });

  // Count active filters
  const getActiveFilterCount = () => {
    if (!activeFilter) return 0;
    let count = 0;
    if (activeFilter.dateFrom && activeFilter.dateTo) count++;
    if (activeFilter.carId) count++;
    if (activeFilter.serviceId) count++;
    if (activeFilter.status) count++;
    if (activeFilter.mechanicId) count++;
    return count;
  };

  // Pagination
  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedReservations } = usePagination(filteredReservations, { itemsPerPage: 10 });

  // Calculate metrics
  const totalCount = reservations.length;
  const upcomingCount = reservations.filter((r) => {
    if (!r.visitDateTime) return false;
    return new Date(r.visitDateTime) > new Date();
  }).length;
  const completedCount = reservations.filter((r) => r.status?.toLowerCase() === 'completed').length;

  const handleDetails = (id: number) => {
    openModal('details', id);
  };

  const handleDelete = (id: number) => {
    openModal('delete', id);
  };

  const confirmDelete = async () => {
    const reservationToDelete = modals.delete.id;
    if (!reservationToDelete) return;
    
    try {
      const response = await httpClient.delete(
        API_CONFIG.ENDPOINTS.RESERVATIONS.DELETE(String(reservationToDelete))
      );

      if (response.error) {
        showNotification('Error', `Failed to delete reservation: ${response.error}`, 'error');
      } else {
        showNotification('Successfully deleted reservation', 'Your changes have been saved.', 'success');
        fetchReservations();
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      showNotification('Error', 'Failed to delete reservation', 'error');
    } finally {
      closeModal('delete');
    }
  };

  const getReservationDisplayName = (id: number) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return `Reservation #${id}`;
    const vehicle = reservation.car 
      ? `${reservation.car.make || ''} ${reservation.car.model || ''}`.trim()
      : 'Unknown Vehicle';
    const service = reservation.service?.serviceName || 'Unknown Service';
    return `${vehicle} - ${service}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h1 
        className="font-unbounded text-2xl font-medium mb-6"
        style={{ color: 'var(--primary-950)' }}
      >
        My Reservations
      </h1>

      {/* Metric Cards */}
      <div className="flex gap-4 mb-6">
        <MetricCard
          title="Total Reservations"
          value={totalCount}
          variant="primary"
        />
        <MetricCard
          title="Upcoming"
          value={upcomingCount}
          variant="white"
        />
        <MetricCard
          title="Completed"
          value={completedCount}
          variant="white"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => openModal('create')}
          className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-90 flex items-center gap-2"
          style={{
            backgroundColor: 'var(--primary-600)',
            borderColor: 'var(--primary-600)',
            color: 'var(--primary-50)',
          }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-base">Create New Reservation</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative w-[260px]">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--neutral-500)' }}
            />
            <input
              type="text"
              placeholder="Search by"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border rounded-3xl text-base focus:outline-none focus:ring-2 shadow-sm"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--primary-950)',
              }}
            />
          </div>
          <button
            onClick={() => openModal('filter')}
            className="px-4 py-2.5 border rounded-3xl transition-colors hover:opacity-80 flex items-center gap-2"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium text-base">
              Filter{getActiveFilterCount() > 0 ? ` (${getActiveFilterCount()})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <ClientReservationsTable
        reservations={paginatedReservations}
        onDetails={handleDetails}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {/* Details Modal */}
      {modals.details.id && (
        <ReservationDetailsModal
          isOpen={modals.details.isOpen}
          onClose={() => closeModal('details')}
          reservationId={modals.details.id}
          onUpdate={fetchReservations}
          onNotification={(title, message, type) => {
            showNotification(title, message, type);
          }}
          isClientView={true}
        />
      )}

      {/* Filter Modal */}
      <ClientReservationFilterModal
        isOpen={modals.filter.isOpen}
        onClose={() => closeModal('filter')}
        onApply={(filter) => {
          setActiveFilter(filter);
          setCurrentPage(1); // Reset to first page when filter changes
        }}
        currentFilter={activeFilter}
      />

      {/* Create Reservation Modal */}
      <ClientCreateReservationModal
        isOpen={modals.create.isOpen}
        onClose={() => closeModal('create')}
        onSuccess={() => {
          showNotification('Successfully created reservation', 'Your changes have been saved.', 'success');
          fetchReservations();
        }}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={modals.delete.isOpen}
        onClose={() => closeModal('delete')}
        onConfirm={confirmDelete}
        title="Delete Reservation"
        message="Are you sure you want to delete this reservation? This action cannot be undone."
        itemName={modals.delete.id ? getReservationDisplayName(modals.delete.id) : undefined}
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
