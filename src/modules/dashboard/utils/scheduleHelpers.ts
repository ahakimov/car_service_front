import { Reservation, RepairJob } from '@/app/api/types';
import { isSameDay, getHours, getMinutes, differenceInDays } from 'date-fns';

export type TabType = 'reservations' | 'repair-jobs';
export type ViewMode = 'day' | 'week' | 'month';

export const getEventTime = (event: Reservation | RepairJob, activeTab: TabType): Date | null => {
  const dateTime = activeTab === 'reservations' 
    ? (event as Reservation).visitDateTime 
    : (event as RepairJob).startDateTime;
  if (!dateTime) return null;
  return new Date(dateTime);
};

export const getEventEndTime = (event: Reservation | RepairJob, activeTab: TabType): Date | null => {
  if (activeTab === 'repair-jobs') {
    const job = event as RepairJob;
    if (job.endDateTime) return new Date(job.endDateTime);
    // Estimate end time based on service duration
    if (job.startDateTime && job.service?.estimatedDuration) {
      const start = new Date(job.startDateTime);
      return new Date(start.getTime() + (job.service.estimatedDuration * 60 * 1000));
    }
  }
  // For reservations, assume 1 hour duration
  const start = getEventTime(event, activeTab);
  if (start) {
    return new Date(start.getTime() + 60 * 60 * 1000);
  }
  return null;
};

export const getEventTitle = (event: Reservation | RepairJob, activeTab: TabType): string => {
  if (activeTab === 'reservations') {
    const reservation = event as Reservation;
    const carModel = reservation.car?.model || reservation.car?.make || 'Unknown Car';
    const service = reservation.service?.serviceName || '';
    return service ? `${carModel} / ${service}` : carModel;
  } else {
    const job = event as RepairJob;
    const carModel = job.client?.name || 'Unknown Client';
    const service = job.service?.serviceName || 'Repair Job';
    return `${carModel} / ${service}`;
  }
};

export const getEventDuration = (event: Reservation | RepairJob, activeTab: TabType): number => {
  const start = getEventTime(event, activeTab);
  const end = getEventEndTime(event, activeTab);
  if (!start || !end) return 0;
  return differenceInDays(end, start) + 1; // Duration in days
};

