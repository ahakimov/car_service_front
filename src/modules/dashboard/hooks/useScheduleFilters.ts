import { useMemo } from 'react';
import { Reservation, RepairJob } from '@/app/api/types';
import { isSameDay } from 'date-fns';

type ScheduleFilter = {
  dateRange?: { from?: Date; to?: Date };
  clientId?: number;
  mechanicId?: number;
  serviceId?: number;
};

type UseScheduleFiltersOptions = {
  reservations: Reservation[];
  repairJobs: RepairJob[];
  searchQuery: string;
  activeFilter: ScheduleFilter;
};

export function useScheduleFilters(options: UseScheduleFiltersOptions) {
  const { reservations, repairJobs, searchQuery, activeFilter } = options;

  // Filter reservations by search and filters
  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    // Apply search
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((r) =>
        r.client?.name?.toLowerCase().includes(searchLower) ||
        r.car?.model?.toLowerCase().includes(searchLower) ||
        r.car?.make?.toLowerCase().includes(searchLower) ||
        r.service?.serviceName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (activeFilter.dateRange?.from || activeFilter.dateRange?.to) {
      filtered = filtered.filter((r) => {
        if (!r.visitDateTime) return false;
        const date = new Date(r.visitDateTime);
        if (activeFilter.dateRange?.from && date < activeFilter.dateRange.from) return false;
        if (activeFilter.dateRange?.to && date > activeFilter.dateRange.to) return false;
        return true;
      });
    }

    // Apply client filter
    if (activeFilter.clientId) {
      filtered = filtered.filter((r) => r.client?.id === activeFilter.clientId);
    }

    // Apply mechanic filter
    if (activeFilter.mechanicId) {
      filtered = filtered.filter((r) => r.mechanic?.id === activeFilter.mechanicId);
    }

    // Apply service filter
    if (activeFilter.serviceId) {
      filtered = filtered.filter((r) => r.service?.id === activeFilter.serviceId);
    }

    return filtered;
  }, [reservations, searchQuery, activeFilter]);

  // Filter repair jobs by search and filters
  const filteredRepairJobs = useMemo(() => {
    let filtered = repairJobs;

    // Apply search
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((job) =>
        job.client?.name?.toLowerCase().includes(searchLower) ||
        job.service?.serviceName?.toLowerCase().includes(searchLower) ||
        job.mechanic?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (activeFilter.dateRange?.from || activeFilter.dateRange?.to) {
      filtered = filtered.filter((job) => {
        if (!job.startDateTime) return false;
        const date = new Date(job.startDateTime);
        if (activeFilter.dateRange?.from && date < activeFilter.dateRange.from) return false;
        if (activeFilter.dateRange?.to && date > activeFilter.dateRange.to) return false;
        return true;
      });
    }

    // Apply client filter
    if (activeFilter.clientId) {
      filtered = filtered.filter((job) => job.client?.id === activeFilter.clientId);
    }

    // Apply mechanic filter
    if (activeFilter.mechanicId) {
      filtered = filtered.filter((job) => job.mechanic?.id === activeFilter.mechanicId);
    }

    // Apply service filter
    if (activeFilter.serviceId) {
      filtered = filtered.filter((job) => job.service?.id === activeFilter.serviceId);
    }

    return filtered;
  }, [repairJobs, searchQuery, activeFilter]);

  const getEventsForDate = (date: Date) => {
    const reservationsOnDate = filteredReservations.filter((r) => {
      if (!r.visitDateTime) return false;
      return isSameDay(new Date(r.visitDateTime), date);
    });

    const repairJobsOnDate = filteredRepairJobs.filter((job) => {
      if (!job.startDateTime) return false;
      return isSameDay(new Date(job.startDateTime), date);
    });

    return { reservations: reservationsOnDate, repairJobs: repairJobsOnDate };
  };

  const getEventsForDateRange = (startDate: Date, endDate: Date) => {
    const reservationsInRange = filteredReservations.filter((r) => {
      if (!r.visitDateTime) return false;
      const visitDate = new Date(r.visitDateTime);
      return visitDate >= startDate && visitDate <= endDate;
    });

    const repairJobsInRange = filteredRepairJobs.filter((job) => {
      if (!job.startDateTime) return false;
      const jobStartDate = new Date(job.startDateTime);
      return jobStartDate >= startDate && jobStartDate <= endDate;
    });

    return { reservations: reservationsInRange, repairJobs: repairJobsInRange };
  };

  const hasActiveFilters = () => {
    return !!(
      activeFilter.dateRange?.from ||
      activeFilter.clientId ||
      activeFilter.mechanicId ||
      activeFilter.serviceId
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilter.dateRange?.from) count++;
    if (activeFilter.clientId) count++;
    if (activeFilter.mechanicId) count++;
    if (activeFilter.serviceId) count++;
    return count;
  };

  return {
    filteredReservations,
    filteredRepairJobs,
    getEventsForDate,
    getEventsForDateRange,
    hasActiveFilters,
    getActiveFilterCount,
  };
}
