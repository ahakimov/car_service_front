import { Reservation, RepairJob } from '@/app/api/types';

export type EventType = 'reservation' | 'repair-job';

export type CalendarEvent = {
  id: number;
  title: string;
  label: string; // "Reservation - Checkup" or "Repair Job - Engine Repair"
  start: Date;
  end: Date;
  type: EventType;
  status?: string;
  resource: Reservation | RepairJob;
};

/**
 * Transform reservations to calendar events
 */
export function transformReservationsToEvents(reservations: Reservation[]): CalendarEvent[] {
  return reservations
    .filter((r) => r.visitDateTime)
    .map((reservation) => {
      const start = new Date(reservation.visitDateTime!);
      
      // Use endDateTime if available, otherwise default to 1 hour duration
      let end: Date;
      if (reservation.endDateTime) {
        end = new Date(reservation.endDateTime);
      } else {
        end = new Date(start.getTime() + 60 * 60 * 1000);
      }

      const serviceName = reservation.service?.serviceName || 'Checkup';
      const clientName = reservation.client?.name || 'Unknown';
      const carInfo = reservation.car?.model || reservation.car?.make || '';
      
      // Title: "Client Name - Car Model"
      const title = carInfo ? `${clientName} - ${carInfo}` : clientName;
      
      // Label: "Reservation - Service Name"
      const label = `Reservation - ${serviceName}`;

      return {
        id: reservation.id || 0,
        title,
        label,
        start,
        end,
        type: 'reservation' as const,
        status: reservation.status,
        resource: reservation,
      };
    });
}

/**
 * Transform repair jobs to calendar events
 */
export function transformRepairJobsToEvents(repairJobs: RepairJob[]): CalendarEvent[] {
  return repairJobs
    .filter((job) => job.startDateTime)
    .map((job) => {
      const start = new Date(job.startDateTime!);
      
      // Calculate end time
      let end: Date;
      if (job.endDateTime) {
        end = new Date(job.endDateTime);
      } else if (job.service?.estimatedDuration) {
        end = new Date(start.getTime() + (job.service.estimatedDuration * 60 * 1000));
      } else {
        // Default to 2 hours for repair jobs
        end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      }

      const serviceName = job.service?.serviceName || 'Repair';
      const clientName = job.client?.name || 'Unknown';
      
      // Title: "Client Name"
      const title = clientName;
      
      // Label: "Repair Job - Service Name"
      const label = `Repair Job - ${serviceName}`;

      return {
        id: job.id || 0,
        title,
        label,
        start,
        end,
        type: 'repair-job' as const,
        status: job.status,
        resource: job,
      };
    });
}

/**
 * Transform all events (reservations + repair jobs) into unified calendar events
 */
export function transformAllEvents(
  reservations: Reservation[],
  repairJobs: RepairJob[]
): CalendarEvent[] {
  const reservationEvents = transformReservationsToEvents(reservations);
  const repairJobEvents = transformRepairJobsToEvents(repairJobs);
  
  // Combine and sort by start time
  return [...reservationEvents, ...repairJobEvents].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
}

/**
 * Get status color for an event
 */
export function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'unconfirmed':
      return '#F59E0B'; // Amber - needs attention
    case 'confirmed':
      return '#22C55E'; // Green - confirmed
    case 'scheduled':
      return 'var(--primary-500)';
    case 'in progress':
    case 'in_progress':
      return '#3B82F6'; // Blue - in progress
    case 'completed':
    case 'finished':
      return '#16A34A'; // Darker green - completed
    case 'cancelled':
    case 'canceled':
      return '#EF4444'; // Red - cancelled
    case 'pending':
      return 'var(--neutral-500)';
    case 'waiting for parts':
    case 'waiting_for_parts':
      return 'var(--accent-400)';
    default:
      return 'var(--primary-500)';
  }
}
