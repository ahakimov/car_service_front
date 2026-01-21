'use client';

import { ClientDashboardLayout } from "@/modules/dashboard/ui/ClientDashboardLayout";
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { MetricCard, Notification, ClientRepairJobDetailsModal, ClientRepairJobFilterModal } from '@/modules/dashboard/components';
import { RepairJob } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';

function ClientRepairJobsContent() {
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [activeFilter, setActiveFilter] = useState<{
    dateFrom?: string;
    dateTo?: string;
    carId?: number;
    serviceId?: number;
    mechanicId?: number;
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

  const fetchRepairJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpClient.get<RepairJob[]>(API_CONFIG.ENDPOINTS.REPAIR_JOBS.LIST);
      if (response.data) {
        setRepairJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching repair jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepairJobs();
  }, [fetchRepairJobs]);

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
      case 'in progress':
        return { bg: 'var(--accent-100)', text: 'var(--accent-700)' };
      case 'completed':
        return { bg: 'var(--success-100)', text: 'var(--success-600)' };
      case 'pending':
        return { bg: 'var(--primary-100)', text: 'var(--primary-700)' };
      default:
        return { bg: 'var(--neutral-100)', text: 'var(--neutral-700)' };
    }
  };

  // Filter repair jobs based on search and active filters
  const filteredJobs = repairJobs.filter((job) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        job.service?.serviceName?.toLowerCase().includes(searchLower) ||
        job.mechanic?.name?.toLowerCase().includes(searchLower) ||
        job.status?.toLowerCase().includes(searchLower) ||
        job.client?.name?.toLowerCase().includes(searchLower)
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

      // Car filter (check if job has car associated with client)
      if (activeFilter.carId) {
        // Note: RepairJob doesn't have direct car reference, so we skip this filter
        // If needed, we'd need to check job.client?.id matches the car owner
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

      // Mechanic filter
      if (activeFilter.mechanicId && job.mechanic?.id !== activeFilter.mechanicId) return false;
    }

    return true;
  });

  // Count active filters
  const getActiveFilterCount = () => {
    if (!activeFilter) return 0;
    let count = 0;
    if (activeFilter.dateFrom && activeFilter.dateTo) count++;
    if (activeFilter.carId) count++;
    if (activeFilter.serviceId) count++;
    if (activeFilter.status) count++;
    if (activeFilter.mechanicId) count++;
    return count;
  };

  const inProgressCount = repairJobs.filter((j) => j.status?.toLowerCase().includes('progress')).length;
  const completedCount = repairJobs.filter((j) => j.status?.toLowerCase() === 'completed').length;

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ visible: true, title, message, type });
  };

  const handleDetails = (job: RepairJob) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="font-unbounded text-2xl font-medium mb-6" style={{ color: 'var(--primary-950)' }}>
        My Repair Jobs
      </h1>

      <div className="flex gap-4 mb-6">
        <MetricCard title="Total Jobs" value={repairJobs.length} variant="primary" />
        <MetricCard title="In Progress" value={inProgressCount} variant="white" />
        <MetricCard title="Completed" value={completedCount} variant="white" />
      </div>

      <div className="flex items-center justify-end gap-3 mb-6">
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
            <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>No repair jobs found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--primary-100)' }}>
                <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>ID</th>
                <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Vehicle</th>
                <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Estimated completion date</th>
                <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Service type</th>
                <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Status</th>
                <th className="px-4 py-3 text-left font-normal text-[13px]" style={{ color: 'var(--primary-950)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job, index) => {
                const statusStyle = getStatusStyle(job.status);
                const vehicleDisplay = job.client?.name || '-';
                return (
                  <tr key={job.id} style={{ backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white' }}>
                    <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {job.id}
                    </td>
                    <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {vehicleDisplay}
                    </td>
                    <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {job.endDateTime ? new Date(job.endDateTime).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-4 text-[13px]" style={{ color: 'var(--primary-950)' }}>
                      {job.service?.serviceName || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 rounded-full text-[13px] font-medium capitalize" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                        {job.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleDetails(job)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-3xl transition-colors hover:opacity-80"
                        style={{ 
                          backgroundColor: 'white',
                          borderColor: 'var(--neutral-400)' 
                        }}
                      >
                        <span 
                          className="font-medium text-[13px]"
                          style={{ color: 'var(--primary-950)' }}
                        >
                          Details
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Filter Modal */}
      <ClientRepairJobFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filter) => {
          setActiveFilter(filter);
        }}
        currentFilter={activeFilter}
      />

      {/* Details Modal */}
      <ClientRepairJobDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedJob(null);
        }}
        repairJob={selectedJob}
        onCancelled={fetchRepairJobs}
        onNotification={showNotification}
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

export default function ClientRepairJobsDashboard() {
  return (
    <ClientDashboardLayout>
      <ClientRepairJobsContent />
    </ClientDashboardLayout>
  );
}
