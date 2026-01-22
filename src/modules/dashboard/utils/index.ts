// Dashboard Utilities

// Status color styles
export type StatusStyle = {
  bg: string;
  text: string;
};

export function getStatusStyle(status?: string): StatusStyle {
  switch (status?.toLowerCase()) {
    case 'unconfirmed':
      return { bg: '#FEF3C7', text: '#B45309' }; // Amber - needs attention
    case 'pending':
      return { bg: 'var(--primary-100)', text: 'var(--primary-700)' };
    case 'confirmed':
      return { bg: 'var(--success-100)', text: 'var(--success-600)' };
    case 'completed':
    case 'finished':
      return { bg: '#DCFCE7', text: '#166534' }; // Darker green for completed
    case 'cancelled':
    case 'canceled':
      return { bg: 'var(--danger-100)', text: 'var(--danger-600)' };
    case 'upcoming':
      return { bg: 'var(--accent-100)', text: 'var(--accent-700)' };
    case 'in progress':
    case 'in_progress':
    case 'in-progress':
      return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue for in progress
    case 'available':
      return { bg: 'var(--success-100)', text: 'var(--success-600)' };
    case 'busy':
      return { bg: 'var(--warning-100)', text: 'var(--warning-700)' };
    case 'on leave':
    case 'on_leave':
      return { bg: 'var(--neutral-100)', text: 'var(--neutral-700)' };
    default:
      return { bg: 'var(--neutral-100)', text: 'var(--neutral-700)' };
  }
}

// Date formatting
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateLong(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

// Common UI styles
export const inputStyles = {
  base: "w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2",
  border: { borderColor: 'var(--neutral-400)' },
  text: { color: 'var(--primary-950)' },
  placeholder: { color: 'var(--neutral-500)' },
};

export const buttonStyles = {
  primary: {
    backgroundColor: 'var(--primary-600)',
    borderColor: 'var(--primary-600)',
    color: 'white',
  },
  secondary: {
    backgroundColor: 'white',
    borderColor: 'var(--neutral-400)',
    color: 'var(--neutral-700)',
  },
  danger: {
    backgroundColor: 'var(--danger-600)',
    borderColor: 'var(--danger-600)',
    color: 'white',
  },
};

export const labelStyles = {
  default: { color: 'var(--neutral-900)' },
  small: { color: 'var(--neutral-600)' },
};

// Modal styles
export const modalStyles = {
  overlay: { backgroundColor: 'rgba(35, 40, 72, 0.2)' },
  container: { backgroundColor: 'white' },
  header: { color: 'var(--primary-950)' },
  border: { borderColor: 'var(--neutral-200)' },
};

// Pagination helpers
export function getPaginationRange(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    
    if (currentPage > 3) pages.push('ellipsis');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) pages.push(i);
    
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    
    pages.push(totalPages);
  }

  return pages;
}

// Empty state message
export const EMPTY_STATE_MESSAGE = "Nothing to see here. Let's add new data.";
