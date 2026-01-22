import { useState, useEffect, useCallback } from 'react';
import { Reservation, RepairJob } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useAuth } from '@/app/api';

type UseScheduleDataOptions = {
  filterByMechanic?: boolean;
};

export function useScheduleData(options: UseScheduleDataOptions = {}) {
  const { filterByMechanic = false } = options;
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get<Reservation[]>(API_CONFIG.ENDPOINTS.RESERVATIONS.LIST);
      if (response.data) {
        // Filter by mechanic if filterByMechanic is true
        // Note: Use email (username) to match since User ID and Mechanic ID are different
        let filtered = response.data;
        if (filterByMechanic && user?.username) {
          filtered = response.data.filter(r => r.mechanic?.email?.toLowerCase() === user.username?.toLowerCase());
        }
        setReservations(filtered);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  }, [filterByMechanic, user?.username]);

  const fetchRepairJobs = useCallback(async () => {
    try {
      const response = await httpClient.get<RepairJob[]>(API_CONFIG.ENDPOINTS.REPAIR_JOBS.LIST);
      if (response.data) {
        // Filter by mechanic if filterByMechanic is true
        // Note: Use email (username) to match since User ID and Mechanic ID are different
        let filtered = response.data;
        if (filterByMechanic && user?.username) {
          filtered = response.data.filter(job => job.mechanic?.email?.toLowerCase() === user.username?.toLowerCase());
        }
        setRepairJobs(filtered);
      }
    } catch (error) {
      console.error('Error fetching repair jobs:', error);
    }
  }, [filterByMechanic, user?.username]);

  useEffect(() => {
    fetchReservations();
    fetchRepairJobs();
  }, [fetchReservations, fetchRepairJobs]);

  return {
    reservations,
    repairJobs,
    loading,
    fetchReservations,
    fetchRepairJobs,
  };
}
