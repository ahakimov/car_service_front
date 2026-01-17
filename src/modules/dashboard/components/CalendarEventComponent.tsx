import { Reservation, RepairJob } from '@/app/api/types';
import type { CalendarEvent } from '../utils/calendarTransform';

type CalendarEventComponentProps = {
  event: CalendarEvent;
};

export function CalendarEventComponent({ event }: CalendarEventComponentProps) {
  const isReservation = event.type === 'reservation';
  const resource = event.resource;

  // Get initial for avatar
  const getInitial = () => {
    if (isReservation) {
      const reservation = resource as Reservation;
      return reservation.client?.name?.charAt(0) || reservation.car?.model?.charAt(0) || 'R';
    } else {
      const job = resource as RepairJob;
      return job.client?.name?.charAt(0) || 'J';
    }
  };

  // Get badge color based on type
  const getBadgeColors = () => {
    if (isReservation) {
      return {
        bg: 'var(--primary-100)',
        text: 'var(--primary-700)',
        border: 'var(--primary-200)',
      };
    } else {
      return {
        bg: 'var(--accent-100)',
        text: 'var(--accent-700)',
        border: 'var(--accent-200)',
      };
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    const status = event.status?.toLowerCase();
    switch (status) {
      case 'unconfirmed':
        return { label: 'Unconfirmed', color: '#F59E0B' }; // Amber
      case 'confirmed':
        return { label: 'Confirmed', color: '#22C55E' }; // Green
      case 'scheduled':
        return { label: 'Scheduled', color: 'var(--primary-500)' };
      case 'in progress':
      case 'in_progress':
        return { label: 'In Progress', color: '#3B82F6' }; // Blue
      case 'completed':
      case 'finished':
        return { label: 'Completed', color: '#16A34A' }; // Darker green
      case 'cancelled':
      case 'canceled':
        return { label: 'Cancelled', color: '#EF4444' }; // Red
      case 'pending':
        return { label: 'Pending', color: 'var(--neutral-500)' };
      case 'waiting for parts':
      case 'waiting_for_parts':
        return { label: 'Waiting', color: 'var(--accent-400)' };
      default:
        return null;
    }
  };

  const colors = getBadgeColors();
  const statusBadge = getStatusBadge();

  return (
    <div className="flex items-center gap-2 h-full w-full px-2 py-1">
      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {getInitial()}
      </div>
      
      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* Label (type) */}
        <span 
          className="text-[10px] font-medium truncate leading-tight"
          style={{ color: colors.text }}
        >
          {event.label}
        </span>
        
        {/* Title (client/car) */}
        <span 
          className="text-xs font-medium truncate leading-tight"
          style={{ color: 'var(--primary-950)' }}
        >
          {event.title}
        </span>
      </div>

      {/* Status indicator dot */}
      {statusBadge && (
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: statusBadge.color }}
          title={statusBadge.label}
        />
      )}
    </div>
  );
}
