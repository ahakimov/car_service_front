'use client';

import { MechanicDashboardLayout } from "@/modules/dashboard/ui/MechanicDashboardLayout";
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, Eye, Trash2 } from 'lucide-react';
import { MetricCard, Notification, RepairJobDetailsModal, DeleteModal, CreateRepairJobModal, MechanicRepairJobFilterModal } from '@/modules/dashboard/components';
import { RepairJob } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useAuth } from '@/app/api';

function MechanicRepairJobsContent() {
  const { user } = useAuth();
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<{
    dateFrom?: string;
    dateTo?: string;
    carModel?: string;
    serviceId?: number;
    status?: string;
  } | undefined>(undefined);
  const [notification, setNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const itemsPerPage = 10;

  const fetchRepairJobs = useCallback(async () => {
    if (!user?.username) return;
    
    setLoading(true);
    try {
      const response = await httpClient.get<RepairJob[]>(API_CONFIG.ENDPOINTS.REPAIR_JOBS.LIST);
      if (response.data) {
        // Filter repair jobs assigned to this mechanic by email (username)
        // Note: User ID and Mechanic ID are different in the database
        const mechanicJobs = response.data.filter(
          job => job.mechanic?.email?.toLowerCase() === user.username?.toLowerCase()
        );
        setRepairJobs(mechanicJobs);
      }
    } catch (error) {
      console.error('Error fetching repair jobs:', error);
      showNotification('Error', 'Failed to fetch repair jobs', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchRepairJobs();
  }, [fetchRepairJobs]);

  useEffect(() => {
    fetchRepairJobs();
  }, [fetchRepairJobs]);

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ visible: true, title, message, type });
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
      case 'in progress':
        return { bg: 'var(--primary-100)', text: 'var(--primary-700)' };
      case 'finished':
      case 'completed':
        return { bg: 'var(--success-100)', text: 'var(--success-600)' };
      case 'cancelled':
        return { bg: 'var(--danger-100)', text: 'var(--danger-600)' };
      case 'upcoming':
        return { bg: 'var(--neutral-100)', text: 'var(--neutral-700)' };
      default:
        return { bg: 'var(--neutral-100)', text: 'var(--neutral-700)' };
    }
  };

  // Filter and search
  const filteredJobs = repairJobs.filter((job) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        job.service?.serviceName?.toLowerCase().includes(searchLower) ||
        job.client?.name?.toLowerCase().includes(searchLower) ||
        job.status?.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Active filter checks
    if (activeFilter) {
      // Date range filter (check startDateTime)
      if (activeFilter.dateFrom && activeFilter.dateTo && job.startDateTime) {
        const startDate = new Date(job.startDateTime);
        const fromDate = new Date(activeFilter.dateFrom);
        const toDate = new Date(activeFilter.dateTo);
        if (startDate < fromDate || startDate > toDate) return false;
      }

      // Car model filter (would need car data in repair job)
      // Note: RepairJob doesn't have direct car reference, so this is a placeholder
      if (activeFilter.carModel) {
        // Would need to check car model if available
      }

      // Service filter
      if (activeFilter.serviceId && job.service?.id !== activeFilter.serviceId) return false;

      // Status filter
      if (activeFilter.status) {
        const jobStatus = job.status?.toLowerCase();
        const filterStatus = activeFilter.status.toLowerCase();
        // Handle both "in_progress" and "in progress" variations
        if (filterStatus === 'in progress' || filterStatus === 'in_progress') {
          if (!jobStatus?.includes('progress')) return false;
        } else if (jobStatus !== filterStatus) {
          return false;
        }
      }
    }

    return true;
  });

  // Count active filters
  const getActiveFilterCount = () => {
    if (!activeFilter) return 0;
    let count = 0;
    if (activeFilter.dateFrom && activeFilter.dateTo) count++;
    if (activeFilter.carModel) count++;
    if (activeFilter.serviceId) count++;
    if (activeFilter.status) count++;
    return count;
  };

  // Calculate metrics
  const totalCount = repairJobs.length;
  const inProgressCount = repairJobs.filter((j) => 
    j.status?.toLowerCase().includes('progress')
  ).length;
  const upcomingCount = repairJobs.filter((j) => 
    j.status?.toLowerCase() === 'upcoming'
  ).length;
  const cancelledCount = repairJobs.filter((j) => 
    j.status?.toLowerCase() === 'cancelled'
  ).length;

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleDetails = (id: number) => {
    setSelectedJobId(id);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setJobToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (jobToDelete === null) return;

    try {
      const response = await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.REPAIR_JOBS.DELETE(String(jobToDelete))
      );
      
      if (response.error) {
        showNotification('Error', response.error, 'error');
      } else {
        setRepairJobs((prev) => prev.filter((j) => j.id !== jobToDelete));
        showNotification('Successfully deleted repair job', 'Your changes have been saved.', 'success');
      }
    } catch (error) {
      showNotification('Error', 'Failed to delete repair job', 'error');
    }
    
    setJobToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="font-unbounded text-2xl font-medium mb-6" style={{ color: 'var(--primary-950)' }}>
        Repair Jobs
      </h1>

      {/* Metric Cards */}
      <div className="flex gap-4 mb-6">
        <MetricCard 
          title="Total Repair Jobs" 
          value={totalCount} 
          variant="primary"
          change={7}
        />
        <MetricCard title="Repair Jobs in Progress" value={inProgressCount} variant="white" />
        <MetricCard title="Upcoming Repair Jobs" value={upcomingCount} variant="white" />
        <MetricCard 
          title="Cancelled Repair Jobs" 
          value={cancelledCount} 
          variant="white"
          change={7}
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: 'var(--primary-600)', borderColor: 'var(--primary-600)', color: 'var(--primary-50)' }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-base">Create Repair Job</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative w-[260px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--neutral-500)' }} />
            <input
              type="text"
              placeholder="Search by"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border rounded-3xl text-base focus:outline-none focus:ring-2 shadow-sm"
              style={{ backgroundColor: 'white', borderColor: 'var(--neutral-400)', color: 'var(--primary-950)' }}
            />
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2.5 border rounded-3xl transition-colors hover:opacity-80 flex items-center gap-2"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium text-base">
              Filter{getActiveFilterCount() > 0 ? ` (${getActiveFilterCount()})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Repair Jobs Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }} />
              <p style={{ color: 'var(--neutral-600)' }}>Loading repair jobs...</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="px-4 py-32 text-center">
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              Nothing to see here. Let's add new data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--primary-100)' }}>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>ID</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Client</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Car Model</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Service</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Status</th>
                  <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job, index) => {
                  const statusStyle = getStatusStyle(job.status);
                  // Note: Car model would need to be fetched separately or included in repair job response
                  // For now, showing placeholder
                  const carModel = '-';
                  return (
                    <tr key={job.id} style={{ backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white' }}>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>{job.id}</td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>{job.client?.name || '-'}</td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>{carModel}</td>
                      <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>{job.service?.serviceName || '-'}</td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 rounded-full text-[13px] font-medium capitalize" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                          {job.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDetails(job.id!)}
                            className="flex items-center gap-2 px-4 py-2 border rounded-3xl transition-colors hover:opacity-80"
                            style={{ 
                              backgroundColor: 'white',
                              borderColor: 'var(--neutral-400)' 
                            }}
                          >
                            <Eye className="w-4 h-4" style={{ color: 'var(--primary-950)' }} />
                            <span 
                              className="font-medium text-[13px]"
                              style={{ color: 'var(--primary-950)' }}
                            >
                              Details
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(job.id!)}
                            className="flex items-center gap-2 px-4 py-2 border rounded-3xl transition-colors hover:opacity-80"
                            style={{ 
                              backgroundColor: 'white',
                              borderColor: 'var(--danger-200)' 
                            }}
                          >
                            <Trash2 className="w-4 h-4" style={{ color: 'var(--danger-500)' }} />
                            <span 
                              className="font-medium text-[13px]"
                              style={{ color: 'var(--danger-500)' }}
                            >
                              Delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredJobs.length > 0 && (
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{ 
              backgroundColor: 'white',
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
          >
            Previous
          </button>
          <span className="text-sm" style={{ color: 'var(--primary-950)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{ 
              backgroundColor: 'white',
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {selectedJobId && (
        <RepairJobDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedJobId(null);
          }}
          repairJobId={selectedJobId}
          onUpdate={fetchRepairJobs}
          onNotification={showNotification}
        />
      )}

      {/* Filter Modal */}
      <MechanicRepairJobFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filter) => {
          setActiveFilter(filter);
        }}
        currentFilter={activeFilter}
      />

      {/* Create Modal */}
      <CreateRepairJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchRepairJobs();
        }}
        onNotification={showNotification}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setJobToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Do you want to delete this repair job?"
        message="Are you sure you want to delete this repair job? This action cannot be undone."
      />

      <Notification
        isVisible={notification.visible}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}

export default function MechanicRepairJobsDashboard() {
  return (
    <MechanicDashboardLayout>
      <MechanicRepairJobsContent />
    </MechanicDashboardLayout>
  );
}
