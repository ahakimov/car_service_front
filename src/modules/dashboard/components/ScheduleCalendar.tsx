'use client';

import { Calendar, View, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEventComponent } from './CalendarEventComponent';
import type { CalendarEvent } from '../utils/calendarTransform';

// Create localizer using date-fns (official way)
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type ScheduleCalendarProps = {
  events: CalendarEvent[];
  view: View;
  date: Date;
  onView: (view: View) => void;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  min?: Date;
  max?: Date;
};

export function ScheduleCalendar({
  events,
  view,
  date,
  onView,
  onNavigate,
  onSelectEvent,
  min,
  max,
}: ScheduleCalendarProps) {
  // Custom event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const isReservation = event.type === 'reservation';
    
    // Different colors for reservation vs repair job
    const colors = isReservation
      ? {
          bg: 'var(--primary-50)',
          border: 'var(--primary-300)',
          leftBorder: 'var(--primary-500)',
        }
      : {
          bg: 'var(--accent-50)',
          border: 'var(--accent-300)',
          leftBorder: 'var(--accent-500)',
        };

    return {
      style: {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth: '4px',
        borderLeftColor: colors.leftBorder,
        borderRadius: '6px',
        color: 'var(--primary-950)',
        padding: '2px 4px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
    };
  };

  // Custom components
  const components = {
    event: (props: any) => {
      const event = props.event as CalendarEvent;
      return <CalendarEventComponent event={event} />;
    },
  };

  return (
    <div className="h-[600px] rounded-xl border overflow-hidden" style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={onView}
        onNavigate={onNavigate}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        components={components}
        min={min}
        max={max}
        style={{ height: '100%' }}
      />
    </div>
  );
}
