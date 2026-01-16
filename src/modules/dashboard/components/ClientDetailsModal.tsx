'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, User, Mail, Phone, Calendar, ArrowUpRight } from "lucide-react";
import { Client, Reservation, Car } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";

type ClientDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  onUpdate?: () => void;
  onNotification?: (title: string, message: string, type: "success" | "error" | "info") => void;
};

export function ClientDetailsModal({
  isOpen,
  onClose,
  clientId,
  onUpdate,
  onNotification,
}: ClientDetailsModalProps) {
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const fetchClientDetails = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const response = await httpClient.get<Client>(
        API_CONFIG.ENDPOINTS.CLIENTS.GET(String(clientId))
      );
      if (response.data) {
        setClient(response.data);
        setFormData({
          name: response.data.name || "",
          phone: response.data.phone || "",
          email: response.data.email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching client details:", error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const fetchClientReservations = useCallback(async () => {
    if (!clientId) return;
    try {
      const response = await httpClient.get<Reservation[]>(
        API_CONFIG.ENDPOINTS.CLIENTS.RESERVATIONS(clientId)
      );
      if (response.data) {
        setReservations(response.data);

        // Derive registered vehicles from reservations (unique by car id or licensePlate)
        const cars: Car[] = [];
        const seen = new Set<string>();

        response.data.forEach((reservation) => {
          const car = reservation.car;
          if (!car) return;
          const key = String(car.id ?? car.licensePlate ?? Math.random());
          if (!seen.has(key)) {
            seen.add(key);
            cars.push(car);
          }
        });
        setVehicles(cars);
      }
    } catch (error) {
      console.error("Error fetching client reservations:", error);
    }
  }, [clientId]);

  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientDetails();
      fetchClientReservations();
      setIsEditing(false);
      setAdditionalDetails("");
    } else {
      setClient(null);
      setReservations([]);
      setVehicles([]);
      setIsEditing(false);
      setAdditionalDetails("");
    }
  }, [isOpen, clientId, fetchClientDetails, fetchClientReservations]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!client) return;
    setSaving(true);
    try {
      const payload: Client = {
        id: client.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      };

      const response = await httpClient.put<Client, Client>(
        API_CONFIG.ENDPOINTS.CLIENTS.UPDATE,
        payload
      );

      if (response.error) {
        if (onNotification) {
          onNotification("Error", `Failed to update client: ${response.error}`, "error");
        }
      } else {
        setIsEditing(false);
        await fetchClientDetails();
        if (onUpdate) onUpdate();
        if (onNotification) {
          onNotification("Successfully updated client", "Your changes have been saved", "success");
        }
      }
    } catch (error) {
      console.error("Error saving client:", error);
      if (onNotification) {
        onNotification("Error", "Failed to save client", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (client) {
      setFormData({
        name: client.name || "",
        phone: client.phone || "",
        email: client.email || "",
      });
    }
    setIsEditing(false);
  };

  const handleCreateRepairJob = () => {
    // Navigate to dashboard reservations where a new repair job can be created.
    router.push("/dashboard");
    onClose();
  };

  const getDateAdded = () => {
    const dates = reservations
      .map((r) => r.dateAdded || r.visitDateTime)
      .filter(Boolean) as string[];

    if (dates.length === 0) return "-";

    const earliest = dates.sort()[0];
    try {
      return new Date(earliest).toISOString().split("T")[0];
    } catch {
      return earliest;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(35, 40, 72, 0.2)" }}
        onClick={!isEditing ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[720px] max-h-[90vh] overflow-y-auto z-50"
        style={{ backgroundColor: "white" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-xl" style={{ color: "var(--primary-950)" }}>
            Client details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:opacity-70 transition-colors"
            style={{ color: "var(--neutral-500)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--primary-600)", borderTopColor: "transparent" }}
            />
          </div>
        ) : client ? (
          <div className="space-y-8">
            {/* Contact information */}
            <div>
              <h3 className="font-medium text-sm mb-4" style={{ color: "var(--neutral-900)" }}>
                Contact information
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs" style={{ color: "var(--neutral-600)" }}>
                    Name
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "var(--neutral-400)",
                        color: "var(--primary-950)",
                      }}
                    />
                  ) : (
                    <p className="px-1 text-sm" style={{ color: "var(--primary-950)" }}>
                      {client.name || "-"}
                    </p>
                  )}
                </div>

                {/* Contact Number */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs" style={{ color: "var(--neutral-600)" }}>
                    Contact Number
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "var(--neutral-400)",
                        color: "var(--primary-950)",
                      }}
                    />
                  ) : (
                    <p className="px-1 text-sm" style={{ color: "var(--primary-950)" }}>
                      {client.phone || "-"}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs" style={{ color: "var(--neutral-600)" }}>
                    Email
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "var(--neutral-400)",
                        color: "var(--primary-950)",
                      }}
                    />
                  ) : (
                    <p className="px-1 text-sm" style={{ color: "var(--primary-950)" }}>
                      {client.email || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional details */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--neutral-600)" }}>
                Additional details
              </span>
              {isEditing ? (
                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm min-h-[72px] resize-none focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--neutral-400)",
                    color: "var(--primary-950)",
                  }}
                  placeholder="Add notes about this client"
                />
              ) : (
                <p className="px-1 text-sm" style={{ color: "var(--primary-950)" }}>
                  {additionalDetails || "Complained about delay last time"}
                </p>
              )}
            </div>

            {/* Registered vehicles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm" style={{ color: "var(--neutral-900)" }}>
                  Registered vehicles
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    className="px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: "white",
                      borderColor: "var(--neutral-400)",
                      color: "var(--primary-700)",
                    }}
                    disabled
                  >
                    Add new vehicle
                  </button>
                )}
              </div>

              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--neutral-200)" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--neutral-50)" }}>
                      <th className="px-4 py-3 text-left font-normal" style={{ color: "var(--primary-950)" }}>
                        Model
                      </th>
                      <th className="px-4 py-3 text-left font-normal" style={{ color: "var(--primary-950)" }}>
                        Year
                      </th>
                      <th className="px-4 py-3 text-left font-normal" style={{ color: "var(--primary-950)" }}>
                        Plate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center">
                          <p className="text-sm" style={{ color: "var(--neutral-500)" }}>
                            Nothing to see here. Let's add new data.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      vehicles.map((car, index) => (
                        <tr
                          key={car.id ?? index}
                          style={{ backgroundColor: index % 2 === 0 ? "white" : "var(--neutral-50)" }}
                        >
                          <td className="px-4 py-4" style={{ color: "var(--primary-950)" }}>
                            {car.model || "-"}
                          </td>
                          <td className="px-4 py-4" style={{ color: "var(--primary-950)" }}>
                            {car.year ?? "-"}
                          </td>
                          <td className="px-4 py-4" style={{ color: "var(--primary-950)" }}>
                            {car.licensePlate || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technical data */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm" style={{ color: "var(--neutral-900)" }}>
                Technical data
              </h3>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <span className="block text-xs mb-1" style={{ color: "var(--neutral-600)" }}>
                    ID
                  </span>
                  <span style={{ color: "var(--primary-950)" }}>
                    {String(client.id ?? "").padStart(2, "0") || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs mb-1" style={{ color: "var(--neutral-600)" }}>
                    Date added
                  </span>
                  <span style={{ color: "var(--primary-950)" }}>{getDateAdded()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="flex items-center justify-between pt-6 border-t mt-4"
              style={{ borderColor: "var(--neutral-200)" }}
            >
              <button
                type="button"
                onClick={handleCreateRepairJob}
                className="px-6 py-2.5 rounded-lg border font-medium text-base flex items-center gap-2 transition-colors hover:opacity-80"
                style={{
                  backgroundColor: "white",
                  borderColor: "var(--neutral-400)",
                  color: "var(--primary-700)",
                }}
              >
                <span>Create Repair Job</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80 disabled:opacity-50"
                      style={{
                        backgroundColor: "white",
                        borderColor: "var(--neutral-400)",
                        color: "var(--neutral-700)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--primary-600)",
                        borderColor: "var(--primary-600)",
                        color: "white",
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: "white",
                        borderColor: "var(--neutral-400)",
                        color: "var(--neutral-700)",
                      }}
                    >
                      Return
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: "var(--primary-600)",
                        borderColor: "var(--primary-600)",
                        color: "white",
                      }}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: "var(--neutral-500)" }}>
              Client not found
            </p>
          </div>
        )}
      </div>
    </>
  );
}
