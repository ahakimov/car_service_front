'use client';

import { MechanicDashboardLayout } from "@/modules/dashboard/ui/MechanicDashboardLayout";
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { MetricCard, Notification, ReservationDetailsModal, MechanicReservationFilterModal } from '@/modules/dashboard/components';
import { Reservation } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useAuth } from '@/app/api';

function MechanicReservationsContent() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<{
    dateFrom?: string;
    dateTo?: string;
    carModel?: string;
    serviceId?: number;
    status?: string;
  } | undefined>(undefined);
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const itemsPerPage = 10;

  const fetchReservations = useCallback(async () => {
    if (!user?.username) return;

    setLoading(true);
    try {
      const response = await httpClient.get<Reservation[]>(API_CONFIG.ENDPOINTS.RESERVATIONS.LIST);
      if (response.data) {
        // Filter reservations assigned to this mechanic by email (username)
        // Note: User ID and Mechanic ID are different in the database
        const mechanicReservations = response.data.filter(
          reservation => reservation.mechanic?.email?.toLowerCase() === user.username?.toLowerCase()
        );
        setReservations(mechanicReservations);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showNotification('Error', 'Failed to fetch reservations', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ visible: true, title, message, type });
  };

  // Filter reservations based on search and active filters
  const filteredReservations = reservations.filter((reservation) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        reservation.client?.name?.toLowerCase().includes(searchLower) ||
        reservation.client?.email?.toLowerCase().includes(searchLower) ||
        reservation.client?.phone?.toLowerCase().includes(searchLower) ||
        reservation.service?.serviceName?.toLowerCase().includes(searchLower) ||
        reservation.status?.toLowerCase().includes(searchLower) ||
        (reservation.car && `${reservation.car.make || ''} ${reservation.car.model || ''} ${reservation.car.year || ''}`.trim().toLowerCase().includes(searchLower))
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

      // Car model filter
      if (activeFilter.carModel) {
        const carModel = reservation.car
          ? `${reservation.car.make || ''} ${reservation.car.model || ''}`.trim().toLowerCase()
          : '';
        if (!carModel.includes(activeFilter.carModel.toLowerCase())) return false;
      }

      // Service filter
      if (activeFilter.serviceId && reservation.service?.id !== activeFilter.serviceId) return false;

      // Status filter
      if (activeFilter.status && reservation.status?.toLowerCase() !== activeFilter.status.toLowerCase()) return false;
    }

    return true;
  });

  // Count active filters
  const getActiveFilterCount = () => {
    if (!activeFilter) return 0;
    let count = 0;
    if (activeFilter.dateFrom && activeFilter.dateTo) count++;
    if (activeFilter.carModel) count++;
    if (activeFilter.serviceId) count++;
    if (activeFilter.status) count++;
    return count;
  };

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);

  // Calculate metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const reservationsThisMonth = reservations.filter((r) => {
    if (!r.visitDateTime) return false;
    const visitDate = new Date(r.visitDateTime);
    return visitDate.getMonth() === currentMonth && visitDate.getFullYear() === currentYear;
  }).length;

  const todayCount = reservations.filter((r) => {
    if (!r.visitDateTime) return false;
    const visitDate = new Date(r.visitDateTime);
    const today = new Date();
    return visitDate.toDateString() === today.toDateString();
  }).length;

  const upcomingCount = reservations.filter((r) => {
    if (!r.visitDateTime) return false;
    return new Date(r.visitDateTime) > new Date();
  }).length;

  const cancelledCount = reservations.filter((r) => r.status?.toLowerCase() === 'cancelled').length;

  const handleDetails = (id: number) => {
    setSelectedReservationId(id);
    setIsDetailsModalOpen(true);
  };

  // Determine display status based on start and end times
  const getDisplayStatus = (reservation: Reservation): string => {
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
  };

  const getStatusStyle = (status?: string) => {
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
  };

  return (
    <div className="p-6">
      <h1 className="font-unbounded text-2xl font-medium mb-6" style={{ color: 'var(--primary-950)' }}>
        Reservations
      </h1>

      {/* Metric Cards */}
      <div className="flex gap-4 mb-6">
        <MetricCard
          title="Reservations this month"
          value={reservationsThisMonth}
          variant="primary"
          change={7}
        />
        <MetricCard title="Today's reservations" value={todayCount} variant="white" />
        <MetricCard title="Upcoming reservations" value={upcomingCount} variant="white" />
        <MetricCard
          title="Cancelled reservations"
          value={cancelledCount}
          variant="white"
          change={7}
        />
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <div className="relative w-[260px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--neutral-500)' }} />
          <input
            type="text"
            placeholder="Search by"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border rounded-3xl text-base focus:outline-none focus:ring-2 shadow-sm"
            style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)', color: 'var(--primary-950)' }}
          />
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
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

      {/* Reservations Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}
              />
              <p style={{ color: 'var(--neutral-600)' }}>Loading reservations...</p>
            </div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="px-4 py-32 text-center">
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              Nothing to see here. Let's add new data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--primary-100)' }}>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>ID</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Contact info</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Car Model</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Service</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Status</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReservations.map((reservation, index) => {
                  const displayStatus = getDisplayStatus(reservation);
                  const statusStyle = getStatusStyle(displayStatus);
                  return (
                    <tr
                      key={reservation.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white'
                      }}
                    >
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                        {reservation.id}
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                        <div className="flex flex-col">
                          <span>{reservation.client?.name || '-'}</span>
                          {reservation.client?.email && (
                            <span style={{ color: 'var(--neutral-600)' }}>{reservation.client.email}</span>
                          )}
                          {reservation.client?.phone && (
                            <span style={{ color: 'var(--neutral-600)' }}>{reservation.client.phone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                        {reservation.car
                          ? `${reservation.car.make || ''} ${reservation.car.model || ''} ${reservation.car.year || ''}`.trim()
                          : '-'}
                      </td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                        {reservation.service?.serviceName || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-[13px] font-medium capitalize"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDetails(reservation.id!)}
                          className="flex items-center gap-2 px-4 py-2 border rounded-3xl transition-colors hover:opacity-80"
                          style={{
                            backgroundColor: 'white',
                            borderColor: 'var(--neutral-400)'
                          }}
                        >
                          <Eye className="w-4 h-4" style={{ color: 'var(--primary-950)' }} />
                          <span
                            className="font-medium text-[13px]"
                            style={{ color: 'var(--primary-950)' }}
                          >
                            Details
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredReservations.length > 0 && (
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
          >
            Previous
          </button>
          <span className="text-sm" style={{ color: 'var(--primary-950)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Filter Modal */}
      <MechanicReservationFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filter) => {
          setActiveFilter(filter);
        }}
        currentFilter={activeFilter}
      />

      {/* Details Modal - Read only for mechanics */}
      {selectedReservationId && (
        <ReservationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedReservationId(null);
          }}
          reservationId={selectedReservationId}
          onUpdate={fetchReservations}
          onNotification={showNotification}
          readOnly={true}
        />
      )}

      <Notification
        isVisible={notification.visible}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}

export default function MechanicDashboard() {
  return (
    <MechanicDashboardLayout>
      <MechanicReservationsContent />
    </MechanicDashboardLayout>
  );
}
