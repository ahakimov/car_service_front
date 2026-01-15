'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { MetricCard, DeleteModal, Notification, ClientDetailsModal, CreateClientModal } from '../components';
import { ClientFilterModal } from '../components/ClientFilterModal';
import { ClientsTable } from '../components/ClientsTable';
import { Client } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useNotification, usePagination, useModals } from '../hooks';

type ClientFilter = {
  dateRange?: { from?: Date; to?: Date };
  carModel?: string;
  minReservations?: number;
  maxReservations?: number;
};

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]); // Store all clients for filtering
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ClientFilter>({});
  
  const { notification, showNotification, hideNotification } = useNotification();
  const { modals, openModal, closeModal } = useModals();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get<Client[]>(API_CONFIG.ENDPOINTS.CLIENTS.LIST);
      if (response.data) {
        setAllClients(response.data);
        applyFilters(response.data, activeFilter, searchQuery);
      } else if (response.error) {
        // Provide more helpful error message for 403 Forbidden
        if (response.status === 403) {
          showNotification('Access Denied', 'You do not have permission to view clients. Please log in with an admin account.', 'error');
        } else {
          showNotification('Error', response.error, 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      showNotification('Error', 'Failed to fetch clients', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const applyFilters = (data: Client[], filter: ClientFilter, search: string) => {
    let filtered = [...data];

    // Apply search query
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((client) =>
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Apply car model filter (would need backend support for actual car data)
    if (filter.carModel) {
      // This would need backend support - for now, we'll just pass through
      // In production, this would filter by client's cars
    }

    // Apply min/max reservations filter (would need backend support)
    if (filter.minReservations !== undefined || filter.maxReservations !== undefined) {
      // This would need backend support - for now, we'll just pass through
      // In production, this would filter by reservation count
    }

    // Apply date range filter (would need backend support)
    if (filter.dateRange?.from || filter.dateRange?.to) {
      // This would need backend support for filtering by last visit date
      // For now, we'll just pass through
    }

    setClients(filtered);
  };

  useEffect(() => {
    applyFilters(allClients, activeFilter, searchQuery);
  }, [activeFilter, searchQuery, allClients]);

  // Filter clients based on search
  const filteredClients = clients;

  // Pagination
  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedClients } = usePagination(filteredClients, { itemsPerPage: 10 });

  const handleDetails = (id: number) => {
    openModal('details', id);
  };

  const handleDelete = (id: number) => {
    openModal('delete', id);
  };

  const confirmDelete = async () => {
    const clientToDelete = modals.delete.id;
    if (clientToDelete === null) return;

    try {
      const response = await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.CLIENTS.DELETE(String(clientToDelete))
      );
      
      if (response.error) {
        showNotification('Error', response.error, 'error');
      } else {
        setAllClients((prev) => prev.filter((c) => c.id !== clientToDelete));
        showNotification('Success', 'Client deleted successfully', 'success');
      }
    } catch (error) {
      showNotification('Error', 'Failed to delete client', 'error');
    }
    
    closeModal('delete');
  };

  const handleApplyFilter = (filters: ClientFilter) => {
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
      activeFilter.carModel ||
      activeFilter.minReservations !== undefined ||
      activeFilter.maxReservations !== undefined
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilter.dateRange?.from) count++;
    if (activeFilter.carModel) count++;
    if (activeFilter.minReservations !== undefined && activeFilter.minReservations > 0) count++;
    if (activeFilter.maxReservations !== undefined && activeFilter.maxReservations < 100) count++;
    return count;
  };

  return (
    <div className="p-6">
      {/* Metric Cards */}
      <div className="flex gap-4 mb-6">
        <MetricCard
          title="Total Clients"
          value={clients.length}
          change={12}
          variant="primary"
        />
        <MetricCard
          title="New This Month"
          value={Math.ceil(clients.length * 0.3)}
          change={5}
          variant="white"
        />
        <MetricCard
          title="Returning"
          value={Math.ceil(clients.length * 0.5)}
          change={3}
          variant="white"
        />
        <MetricCard
          title="Inactive (6+ months)"
          value={Math.floor(clients.length * 0.2)}
          change={-1}
          variant="white"
        />
      </div>

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
          <span className="font-medium text-base">Add New Client</span>
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
      <ClientsTable
        clients={paginatedClients}
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
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
      />

      {/* Filter Modal */}
      <ClientFilterModal
        isOpen={modals.filter.isOpen}
        onClose={() => closeModal('filter')}
        onApply={handleApplyFilter}
        currentFilter={activeFilter}
      />

      {/* Details Modal */}
      {modals.details.id && (
        <ClientDetailsModal
          isOpen={modals.details.isOpen}
          onClose={() => closeModal('details')}
          clientId={modals.details.id}
          onUpdate={() => {
            fetchClients();
          }}
          onNotification={showNotification}
        />
      )}

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={modals.create.isOpen}
        onClose={() => closeModal('create')}
        onSuccess={() => {
          fetchClients();
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
