'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { MetricCard, DeleteModal, Notification, MechanicDetailsModal, CreateMechanicModal } from '../components';
import { MechanicFilterModal } from '../components/MechanicFilterModal';
import { MechanicsTable } from '../components/MechanicsTable';
import { Mechanic } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useNotification, usePagination, useModals } from '../hooks';

type MechanicFilter = {
  dateRange?: { from?: Date; to?: Date };
  shift?: string;
  specialty?: string;
  status?: string;
};

export function MechanicsPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [allMechanics, setAllMechanics] = useState<Mechanic[]>([]); // Store all mechanics for filtering
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MechanicFilter>({});
  
  const { notification, showNotification, hideNotification } = useNotification();
  const { modals, openModal, closeModal } = useModals();

  const fetchMechanics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST);
      if (response.data) {
        setAllMechanics(response.data);
        applyFilters(response.data, activeFilter, searchQuery);
      } else if (response.error) {
        showNotification('Error', response.error, 'error');
      }
    } catch (error) {
      console.error('Error fetching mechanics:', error);
      showNotification('Error', 'Failed to fetch mechanics', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMechanics();
  }, [fetchMechanics]);

  const applyFilters = (data: Mechanic[], filter: MechanicFilter, search: string) => {
    let filtered = [...data];

    // Apply search query
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((mechanic) =>
        mechanic.name?.toLowerCase().includes(searchLower) ||
        mechanic.email?.toLowerCase().includes(searchLower) ||
        mechanic.phone?.toLowerCase().includes(searchLower) ||
        mechanic.specialty?.toLowerCase().includes(searchLower)
      );
    }

    // Apply specialty filter
    if (filter.specialty) {
      filtered = filtered.filter((m) => m.specialty?.toLowerCase() === filter.specialty?.toLowerCase());
    }

    // Apply status filter (simulated - would need backend support)
    if (filter.status) {
      // For now, this is simulated. In production, status would come from backend
      filtered = filtered.filter((m) => {
        const statuses = ['busy', 'available', 'on leave', 'available', 'available'];
        const mechanicStatus = statuses[(m.id || 0) % statuses.length];
        return mechanicStatus === filter.status?.toLowerCase();
      });
    }

    // Apply shift filter (simulated - would need backend support)
    if (filter.shift) {
      // This would need backend support for actual shift data
      // For now, we'll just pass through
    }

    // Apply date range filter (simulated - would need backend support)
    if (filter.dateRange?.from || filter.dateRange?.to) {
      // This would need backend support for filtering by date
      // For now, we'll just pass through
    }

    setMechanics(filtered);
  };

  useEffect(() => {
    applyFilters(allMechanics, activeFilter, searchQuery);
  }, [activeFilter, searchQuery, allMechanics]);

  // Filter mechanics based on search
  const filteredMechanics = mechanics;

  // Pagination
  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedMechanics } = usePagination(filteredMechanics, { itemsPerPage: 10 });

  const handleDetails = (id: number) => {
    openModal('details', id);
  };

  const handleDelete = (id: number) => {
    openModal('delete', id);
  };

  const confirmDelete = async () => {
    const mechanicToDelete = modals.delete.id;
    if (mechanicToDelete === null) return;

    try {
      const response = await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.MECHANICS.DELETE(String(mechanicToDelete))
      );
      
      if (response.error) {
        showNotification('Error', response.error, 'error');
      } else {
        setAllMechanics((prev) => prev.filter((m) => m.id !== mechanicToDelete));
        showNotification('Successfully deleted mechanic', 'Your changes have been saved', 'success');
      }
    } catch (error) {
      showNotification('Error', 'Failed to delete mechanic', 'error');
    }
    
    closeModal('delete');
  };

  const handleApplyFilter = (filters: MechanicFilter) => {
    setActiveFilter(filters);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilter = () => {
    setActiveFilter({});
    setCurrentPage(1); // Reset to first page when filter is cleared
  };

  const hasActiveFilters = () => {
    return !!(
      activeFilter.dateRange?.from ||
      activeFilter.shift ||
      activeFilter.specialty ||
      activeFilter.status
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilter.dateRange?.from) count++;
    if (activeFilter.shift) count++;
    if (activeFilter.specialty) count++;
    if (activeFilter.status) count++;
    return count;
  };

  // Get unique specialties for filter dropdown
  const specialties = Array.from(new Set(allMechanics.map(m => m.specialty).filter(Boolean)));

  return (
    <div className="p-6">
      {/* Calculate metrics */}
      {(() => {
        const totalMechanics = allMechanics.length;
        // For now, simulate status distribution (in real app, this would come from backend)
        const availableCount = Math.max(1, Math.floor(totalMechanics * 0.83));
        const busyCount = Math.max(1, Math.floor(totalMechanics * 0.08));
        const onLeaveCount = Math.max(1, Math.floor(totalMechanics * 0.08));
        
        return (
          <div className="flex gap-4 mb-6">
            <MetricCard
              title="Total mechanics"
              value={totalMechanics}
              change={7}
              variant="primary"
            />
            <MetricCard
              title="Available today"
              value={availableCount}
              change={0}
              variant="secondary"
            />
            <MetricCard
              title="Busy today"
              value={busyCount}
              change={0}
              variant="white"
            />
            <MetricCard
              title="On Leave today"
              value={onLeaveCount}
              change={0}
              variant="white"
            />
          </div>
        );
      })()}

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => openModal('create')}
          className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary-600)',
            borderColor: 'var(--primary-600)',
            color: 'var(--primary-50)',
          }}
        >
          <span className="font-medium text-base">Add New Mechanic</span>
        </button>

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
              className="w-full pl-12 pr-4 py-2.5 border rounded-3xl text-base focus:outline-none focus:ring-2 shadow-sm"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--primary-950)',
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilter}
                className="px-4 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-80 flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--primary-100)',
                  borderColor: 'var(--primary-300)',
                }}
              >
                <X className="w-4 h-4" style={{ color: 'var(--primary-700)' }} />
                <span 
                  className="font-medium text-sm"
                  style={{ color: 'var(--primary-700)' }}
                >
                  Clear
                </span>
              </button>
            )}
            <button
              onClick={() => openModal('filter')}
              className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-80 flex items-center gap-2"
              style={{
                backgroundColor: hasActiveFilters() ? 'var(--primary-600)' : 'white',
                borderColor: hasActiveFilters() ? 'var(--primary-600)' : 'var(--neutral-400)',
              }}
            >
              <Filter className="w-5 h-5" style={{ color: hasActiveFilters() ? 'white' : 'var(--neutral-700)' }} />
              <span className="font-medium text-base" style={{ color: hasActiveFilters() ? 'white' : 'var(--neutral-700)' }}>
                Filter{hasActiveFilters() ? ` (${getActiveFilterCount()})` : ''}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <MechanicsTable
        mechanics={paginatedMechanics}
        onDetails={handleDetails}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={modals.delete.isOpen}
        onClose={() => closeModal('delete')}
        onConfirm={confirmDelete}
        title="Do you want to delete this mechanic?"
        message="Are you sure you want to delete this mechanic? This action cannot be undone."
      />

      {/* Filter Modal */}
      <MechanicFilterModal
        isOpen={modals.filter.isOpen}
        onClose={() => closeModal('filter')}
        onApply={handleApplyFilter}
        currentFilter={activeFilter}
      />

      {/* Details Modal */}
      {modals.details.id && (
        <MechanicDetailsModal
          isOpen={modals.details.isOpen}
          onClose={() => closeModal('details')}
          mechanicId={modals.details.id}
          onUpdate={() => {
            fetchMechanics();
          }}
          onNotification={showNotification}
        />
      )}

      {/* Create Mechanic Modal */}
      <CreateMechanicModal
        isOpen={modals.create.isOpen}
        onClose={() => closeModal('create')}
        onSuccess={() => {
          fetchMechanics();
        }}
        onNotification={showNotification}
      />

      {/* Notification */}
      <Notification
        isVisible={notification.visible}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
