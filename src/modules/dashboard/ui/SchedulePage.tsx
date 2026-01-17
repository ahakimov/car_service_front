'use client';

import { useState, useCallback, useMemo } from 'react';
import { View } from 'react-big-calendar';
import { Reservation, RepairJob, ReservationDto, RepairJobDto } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { AddEventModal, Notification, ReservationDetailsModal, RepairJobDetailsModal, ScheduleFilterModal, ScheduleHeader, ScheduleCalendar } from '../components';
import { useNotification, useModals } from '../hooks';
import { useScheduleData } from '../hooks/useScheduleData';
import { useScheduleFilters } from '../hooks/useScheduleFilters';
import { transformAllEvents } from '../utils/calendarTransform';
import type { CalendarEvent } from '../utils/calendarTransform';

type SchedulePageProps = {
  filterByMechanic?: boolean;
};

export function SchedulePage({ filterByMechanic = false }: SchedulePageProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<{
    dateRange?: { from?: Date; to?: Date };
    clientId?: number;
    mechanicId?: number;
    serviceId?: number;
  }>({});
  const [view, setView] = useState<View>('day');
  const [date, setDate] = useState(new Date());
  
  const { notification, showNotification, hideNotification } = useNotification({ autoHide: true, autoHideDelay: 3000 });
  const { modals, openModal, closeModal } = useModals({
    addEvent: { isOpen: false },
    reservationDetails: { isOpen: false, id: null },
    repairJobDetails: { isOpen: false, id: null },
    filter: { isOpen: false },
  });

  const { reservations, repairJobs, loading, fetchReservations, fetchRepairJobs } = useScheduleData({ filterByMechanic });
  
  const {
    filteredReservations,
    filteredRepairJobs,
    hasActiveFilters,
    getActiveFilterCount,
  } = useScheduleFilters({
    reservations,
    repairJobs,
    searchQuery,
    activeFilter,
  });

  // Transform ALL events (reservations + repair jobs) to calendar format
  const calendarEvents = useMemo(() => {
    return transformAllEvents(filteredReservations, filteredRepairJobs);
  }, [filteredReservations, filteredRepairJobs]);

  // Convert view mode
  const viewMode = view === 'day' ? 'day' : view === 'week' ? 'week' : 'month';

  // Date display
  const getDateDisplay = () => {
    if (view === 'day') {
      return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
    } else if (view === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(weekStart)} - ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(weekEnd)}`;
    } else {
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
    }
  };

  const handleReservationSubmit = useCallback(async (data: ReservationDto & { name?: string; phone?: string; email?: string; carModel?: string }) => {
    try {
      let clientId = undefined;
      if (data.name || data.phone || data.email) {
        const clientResponse = await httpClient.post(API_CONFIG.ENDPOINTS.CLIENTS.CREATE, {
          name: data.name,
          phone: data.phone,
          email: data.email,
        });
        if (clientResponse.data && (clientResponse.data as any).id) {
          clientId = (clientResponse.data as any).id;
        }
      }

      let carId = undefined;
      if (data.carModel && clientId) {
        const carResponse = await httpClient.post(API_CONFIG.ENDPOINTS.CARS.CREATE, {
          model: data.carModel,
          ownerId: clientId,
        });
        if (carResponse.data && (carResponse.data as any).id) {
          carId = (carResponse.data as any).id;
        }
      }

      const reservationData: ReservationDto = {
        clientId,
        carId,
        serviceId: data.serviceId,
        mechanicId: data.mechanicId,
        visitDateTime: data.visitDateTime,
        additionalDetails: data.additionalDetails,
        status: data.status,
      };

      const response = await httpClient.post(API_CONFIG.ENDPOINTS.RESERVATIONS.CREATE, reservationData);
      if (response.data) {
        showNotification('Successfully created reservation', 'Your changes have been saved', 'success');
        fetchReservations();
      } else if (response.error) {
        showNotification('Error', response.error, 'error');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      showNotification('Error', 'Failed to create reservation', 'error');
    }
  }, [showNotification, fetchReservations]);

  const handleRepairJobSubmit = useCallback(async (data: RepairJobDto) => {
    try {
      const response = await httpClient.post(API_CONFIG.ENDPOINTS.REPAIR_JOBS.CREATE, data);
      if (response.data) {
        showNotification('Successfully created repair job', 'Your changes have been saved', 'success');
        fetchRepairJobs();
      } else if (response.error) {
        showNotification('Error', response.error, 'error');
      }
    } catch (error) {
      console.error('Error creating repair job:', error);
      showNotification('Error', 'Failed to create repair job', 'error');
    }
  }, [showNotification, fetchRepairJobs]);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    if (event.type === 'reservation' && (event.resource as Reservation).id) {
      openModal('reservationDetails', (event.resource as Reservation).id!);
    } else if (event.type === 'repair-job' && (event.resource as RepairJob).id) {
      openModal('repairJobDetails', (event.resource as RepairJob).id!);
    }
  }, [openModal]);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    if (view === 'day') {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + (direction === 'prev' ? -1 : 1));
      setDate(newDate);
    } else if (view === 'week') {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + (direction === 'prev' ? -7 : 7));
      setDate(newDate);
    } else {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() + (direction === 'prev' ? -1 : 1));
      setDate(newDate);
    }
  }, [date, view]);

  const goToToday = useCallback(() => {
    setDate(new Date());
  }, []);

  // Set min/max times for day view (0:00 to 20:00)
  const minTime = useMemo(() => {
    if (view === 'day') {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return undefined;
  }, [date, view]);

  const maxTime = useMemo(() => {
    if (view === 'day') {
      const d = new Date(date);
      d.setHours(20, 0, 0, 0);
      return d;
    }
    return undefined;
  }, [date, view]);

  return (
    <div className="p-6">
      <ScheduleHeader
        viewMode={viewMode}
        onViewModeChange={(mode) => setView(mode === 'day' ? 'day' : mode === 'week' ? 'week' : 'month')}
        onAddEvent={() => openModal('addEvent')}
        onGoToToday={goToToday}
        onNavigateDate={navigateDate}
        dateDisplay={getDateDisplay()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => openModal('filter')}
        hasActiveFilters={hasActiveFilters()}
        activeFilterCount={getActiveFilterCount()}
      />

      {/* Calendar */}
      {loading ? (
        <div className="flex items-center justify-center py-32 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}>
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--neutral-600)' }}>Loading schedule...</p>
          </div>
        </div>
      ) : (
        <ScheduleCalendar
          events={calendarEvents}
          view={view}
          date={date}
          onView={handleViewChange}
          onNavigate={handleNavigate}
          onSelectEvent={handleEventClick}
          min={minTime}
          max={maxTime}
        />
      )}

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={modals.addEvent?.isOpen ?? false}
        onClose={() => closeModal('addEvent')}
        onReservationSubmit={handleReservationSubmit}
        onRepairJobSubmit={handleRepairJobSubmit}
        mechanicOnly={filterByMechanic}
      />

      {/* Reservation Details Modal - Read only for mechanics */}
      {modals.reservationDetails && 'id' in modals.reservationDetails && modals.reservationDetails.id && (
        <ReservationDetailsModal
          isOpen={modals.reservationDetails.isOpen}
          onClose={() => closeModal('reservationDetails')}
          reservationId={modals.reservationDetails.id}
          onUpdate={() => {
            fetchReservations();
            closeModal('reservationDetails');
          }}
          onNotification={(title, message, type) => {
            showNotification(title, message, type);
          }}
          readOnly={filterByMechanic}
        />
      )}

      {/* Repair Job Details Modal */}
      {modals.repairJobDetails && 'id' in modals.repairJobDetails && modals.repairJobDetails.id && (
        <RepairJobDetailsModal
          isOpen={modals.repairJobDetails.isOpen}
          onClose={() => closeModal('repairJobDetails')}
          repairJobId={modals.repairJobDetails.id}
          onUpdate={() => {
            fetchRepairJobs();
            closeModal('repairJobDetails');
          }}
          onNotification={(title, message, type) => {
            showNotification(title, message, type);
          }}
        />
      )}

      {/* Filter Modal */}
      <ScheduleFilterModal
        isOpen={modals.filter.isOpen}
        onClose={() => closeModal('filter')}
        onApply={(filter) => {
          setActiveFilter(filter);
          closeModal('filter');
        }}
        currentFilter={activeFilter}
      />

      {/* Notification */}
      <Notification
        isVisible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
}
