'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import { MetricCard, DeleteModal, Notification, VehicleHistoryModal, AddVehicleModal } from '../components';
import { Car } from '@/app/api/types';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useAuth } from '@/app/api';
import { useNotification, useModals } from '../hooks';

export function ClientVehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { notification, showNotification, hideNotification } = useNotification();
  const { modals, openModal, closeModal } = useModals({
    delete: { isOpen: false, id: null },
    history: { isOpen: false, id: null },
    add: { isOpen: false },
  });

  const fetchVehicles = useCallback(async () => {
    if (!user?.userId) return;

    setLoading(true);
    try {
      const response = await httpClient.get<Car[]>(API_CONFIG.ENDPOINTS.CARS.LIST);
      if (response.data) {
        // Filter vehicles for the current client
        const clientVehicles = response.data.filter(car => car.owner?.id === user.userId);
        setVehicles(clientVehicles);
      } else if (response.error) {
        showNotification('Error', response.error, 'error');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showNotification('Error', 'Failed to fetch vehicles', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vehicle.make?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = (id: number) => {
    openModal('delete', id);
  };

  const confirmDelete = async () => {
    const vehicleToDelete = modals.delete.id;
    if (vehicleToDelete === null) return;

    try {
      const response = await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.CARS.DELETE(String(vehicleToDelete))
      );

      if (response.error) {
        showNotification('Error', response.error, 'error');
      } else {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete));
        showNotification(
          'Successfully deleted vehicle',
          'Your changes have been saved.',
          'success'
        );
      }
    } catch (error) {
      showNotification('Error', 'Failed to delete vehicle', 'error');
    }

    closeModal('delete');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h1
        className="font-unbounded text-2xl font-medium mb-6"
        style={{ color: 'var(--primary-950)' }}
      >
        My Vehicles
      </h1>

      {/* Metric Cards */}
      <div className="flex gap-4 mb-6">
        <MetricCard
          title="Total Vehicles"
          value={vehicles.length}
          variant="primary"
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => openModal('add')}
          className="px-5 py-2.5 rounded-3xl border shadow-sm transition-colors hover:opacity-90 flex items-center gap-2"
          style={{
            backgroundColor: 'var(--primary-600)',
            borderColor: 'var(--primary-600)',
            color: 'var(--primary-50)',
          }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-base">Add New Vehicle</span>
        </button>

        <div className="relative w-[260px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'var(--neutral-500)' }}
          />
          <input
            type="text"
            placeholder="Search by"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border rounded-3xl text-base focus:outline-none focus:ring-2 shadow-sm"
            style={{
              backgroundColor: 'white',
              borderColor: 'var(--neutral-400)',
              color: 'var(--primary-950)',
            }}
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}
              />
              <p style={{ color: 'var(--neutral-600)' }}>Loading vehicles...</p>
            </div>
          </div>
        ) : filteredVehicles.length === 0 ? (
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
                  <th
                    className="px-4 py-3 text-left font-normal text-[13px]"
                    style={{ color: 'var(--primary-950)' }}
                  >
                    ID
                  </th>
                  <th
                    className="px-4 py-3 text-left font-normal text-[13px]"
                    style={{ color: 'var(--primary-950)' }}
                  >
                    Model
                  </th>
                  <th
                    className="px-4 py-3 text-left font-normal text-[13px]"
                    style={{ color: 'var(--primary-950)' }}
                  >
                    Year
                  </th>
                  <th
                    className="px-4 py-3 text-left font-normal text-[13px]"
                    style={{ color: 'var(--primary-950)' }}
                  >
                    Plate
                  </th>
                  <th
                    className="px-4 py-3 text-left font-normal text-[13px]"
                    style={{ color: 'var(--primary-950)' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, index) => (
                  <tr
                    key={vehicle.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'var(--neutral-50)' : 'white'
                    }}
                  >
                    <td
                      className="px-4 py-4 text-[13px]"
                      style={{ color: 'var(--primary-950)' }}
                    >
                      {vehicle.id}
                    </td>
                    <td
                      className="px-4 py-4 text-[13px]"
                      style={{ color: 'var(--primary-950)' }}
                    >
                      {vehicle.make} {vehicle.model}
                    </td>
                    <td
                      className="px-4 py-4 text-[13px]"
                      style={{ color: 'var(--primary-950)' }}
                    >
                      {vehicle.year || '-'}
                    </td>
                    <td
                      className="px-4 py-4 text-[13px]"
                      style={{ color: 'var(--primary-950)' }}
                    >
                      {vehicle.licensePlate || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('history', vehicle.id!)}
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
                            View History
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id!)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={modals.add?.isOpen ?? false}
        onClose={() => closeModal('add')}
        onSuccess={() => {
          showNotification('Successfully added vehicle', 'Your changes have been saved.', 'success');
          fetchVehicles();
        }}
      />

      {/* History Modal */}
      {modals.history?.id && (
        <VehicleHistoryModal
          isOpen={modals.history?.isOpen ?? false}
          onClose={() => closeModal('history')}
          vehicleId={modals.history.id}
          vehicleName={vehicles.find(v => v.id === modals.history?.id) ?
            `${vehicles.find(v => v.id === modals.history?.id)?.make} ${vehicles.find(v => v.id === modals.history?.id)?.model}` :
            undefined}
        />
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={modals.delete.isOpen}
        onClose={() => closeModal('delete')}
        onConfirm={confirmDelete}
        title="Do you want to delete this vehicle?"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        itemName={modals.delete.id ? vehicles.find(v => v.id === modals.delete.id) ?
          `${vehicles.find(v => v.id === modals.delete.id)?.make} ${vehicles.find(v => v.id === modals.delete.id)?.model}` :
          undefined : undefined}
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
