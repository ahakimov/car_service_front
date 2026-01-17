import { Plus, Search, Filter, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { ViewMode } from '../utils/scheduleHelpers';

type ScheduleHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddEvent: () => void;
  onGoToToday: () => void;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  dateDisplay: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
};

export function ScheduleHeader({
  viewMode,
  onViewModeChange,
  onAddEvent,
  onGoToToday,
  onNavigateDate,
  dateDisplay,
  searchQuery,
  onSearchChange,
  onFilterClick,
  hasActiveFilters,
  activeFilterCount,
}: ScheduleHeaderProps) {
  return (
    <>
      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 pb-4 border-b" style={{ borderColor: 'var(--neutral-200)' }}>
        <span className="font-medium text-lg" style={{ color: 'var(--primary-950)' }}>Schedule</span>
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--primary-500)' }} />
            <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Reservation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--accent-500)' }} />
            <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>Repair Job</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onAddEvent}
            className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--primary-600)',
              borderColor: 'var(--primary-600)',
              color: 'white',
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium text-base">Add Event</span>
          </button>
          <button
            onClick={onGoToToday}
            className="px-4 py-2.5 rounded-lg border transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--neutral-400)',
              color: 'var(--neutral-700)',
            }}
          >
            Today
          </button>
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
              className="px-4 py-2.5 border rounded-lg text-base appearance-none focus:outline-none focus:ring-2 capitalize pr-10"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--primary-950)',
              }}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
            <ChevronDown 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--neutral-500)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateDate('prev')}
              className="p-2 rounded-lg border transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
              }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: 'var(--neutral-700)' }} />
            </button>
            <button
              onClick={() => onNavigateDate('next')}
              className="p-2 rounded-lg border transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
              }}
            >
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--neutral-700)' }} />
            </button>
            <span 
              className="font-medium text-base min-w-[200px] text-center"
              style={{ color: 'var(--primary-950)' }}
            >
              {dateDisplay}
            </span>
          </div>
        </div>
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border rounded-3xl text-base focus:outline-none focus:ring-2 shadow-sm"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--primary-950)',
              }}
            />
          </div>
          <button
            onClick={onFilterClick}
            className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-80 flex items-center gap-2"
            style={{
              backgroundColor: hasActiveFilters ? 'var(--primary-600)' : 'white',
              borderColor: hasActiveFilters ? 'var(--primary-600)' : 'var(--neutral-400)',
            }}
          >
            <Filter className="w-5 h-5" style={{ color: hasActiveFilters ? 'white' : 'var(--neutral-700)' }} />
            <span className="font-medium text-base" style={{ color: hasActiveFilters ? 'white' : 'var(--neutral-700)' }}>
              Filter{hasActiveFilters ? ` (${activeFilterCount})` : ''}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
