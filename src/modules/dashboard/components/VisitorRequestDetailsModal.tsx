'use client';

import { useState, useEffect, useCallback } from "react";
import { X, User, Phone, Mail, Calendar, FileText, Wrench, Trash2 } from "lucide-react";
import { VisitorRequest, Client } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";

type VisitorRequestDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  requestId: number;
  onUpdate?: () => void;
  onDelete?: () => void;
  onNotification?: (title: string, message: string, type: "success" | "error" | "info") => void;
};

const formatDateTime = (visitDate?: string, time?: string) => {
  if (!visitDate) return time || '-';
  try {
    const date = new Date(visitDate);
    if (isNaN(date.getTime())) return time || '-';
    return `${date.toLocaleDateString()} at ${time || ''}`;
  } catch {
    return time || '-';
  }
};

export function VisitorRequestDetailsModal({
  isOpen,
  onClose,
  requestId,
  onUpdate,
  onDelete,
  onNotification,
}: VisitorRequestDetailsModalProps) {
  const [request, setRequest] = useState<VisitorRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const response = await httpClient.get<VisitorRequest>(
        API_CONFIG.ENDPOINTS.VISITOR_REQUESTS.GET(String(requestId))
      );
      if (response.data) {
        setRequest(response.data);
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestDetails();
      setPassword('');
      setConfirmPassword('');
    } else {
      setRequest(null);
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, requestId, fetchRequestDetails]);

  if (!isOpen) return null;

  const handleCreateClient = async () => {
    if (!request) return;
    
    if (!password.trim()) {
      if (onNotification) {
        onNotification("Error", "Please enter a password", "error");
      }
      return;
    }

    if (password !== confirmPassword) {
      if (onNotification) {
        onNotification("Error", "Passwords do not match", "error");
      }
      return;
    }

    if (password.length < 4) {
      if (onNotification) {
        onNotification("Error", "Password must be at least 4 characters", "error");
      }
      return;
    }

    setCreating(true);
    try {
      const clientData = {
        name: request.fullName,
        phone: request.contactNumber,
        email: request.email,
        password: password.trim(),
      };

      const createResponse = await httpClient.post<Client, typeof clientData>(
        API_CONFIG.ENDPOINTS.CLIENTS.CREATE,
        clientData
      );

      if (createResponse.error) {
        if (onNotification) {
          onNotification("Error", createResponse.error, "error");
        }
        return;
      }

      await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.VISITOR_REQUESTS.DELETE(String(request.id))
      );

      if (onNotification) {
        onNotification("Success", `Client "${request.fullName}" created. You can now create a reservation for them.`, "success");
      }

      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Error creating client:", error);
      if (onNotification) {
        onNotification("Error", "Failed to create client", "error");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;

    setDeleting(true);
    try {
      const response = await httpClient.delete<string>(
        API_CONFIG.ENDPOINTS.VISITOR_REQUESTS.DELETE(String(request.id))
      );

      if (response.error) {
        if (onNotification) {
          onNotification("Error", response.error, "error");
        }
      } else {
        if (onNotification) {
          onNotification("Deleted", "Visitor request has been deleted", "info");
        }
        if (onDelete) onDelete();
        onClose();
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      if (onNotification) {
        onNotification("Error", "Failed to delete request", "error");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(35, 40, 72, 0.2)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[600px] max-h-[90vh] overflow-y-auto z-50"
        style={{ backgroundColor: "white" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-medium text-xl" style={{ color: "var(--primary-950)" }}>
            Visitor Request Details
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
        ) : request ? (
          <div className="space-y-6">
            {/* Contact information */}
            <div>
              <h3 className="font-medium text-sm mb-4" style={{ color: "var(--neutral-900)" }}>
                Contact Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <User className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs" style={{ color: "var(--neutral-600)" }}>Full Name</span>
                    <p className="text-sm font-medium" style={{ color: "var(--primary-950)" }}>
                      {request.fullName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <Phone className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs" style={{ color: "var(--neutral-600)" }}>Contact Number</span>
                    <p className="text-sm font-medium" style={{ color: "var(--primary-950)" }}>
                      {request.contactNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <Mail className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs" style={{ color: "var(--neutral-600)" }}>Email</span>
                    <p className="text-sm font-medium" style={{ color: "var(--primary-950)" }}>
                      {request.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <Wrench className="w-5 h-5" style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs" style={{ color: "var(--neutral-600)" }}>Requested Service</span>
                    <p className="text-sm font-medium" style={{ color: "var(--primary-950)" }}>
                      {request.serviceName || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Details */}
            <div>
              <h3 className="font-medium text-sm mb-4" style={{ color: "var(--neutral-900)" }}>
                Visit Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--accent-100)' }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: 'var(--accent-600)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs" style={{ color: "var(--neutral-600)" }}>Preferred Date & Time</span>
                    <p className="text-sm font-medium" style={{ color: "var(--primary-950)" }}>
                      {formatDateTime(request.visitDate, request.time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--neutral-100)' }}
                  >
                    <FileText className="w-5 h-5" style={{ color: 'var(--neutral-600)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs" style={{ color: "var(--neutral-600)" }}>Request Submitted</span>
                    <p className="text-sm font-medium" style={{ color: "var(--primary-950)" }}>
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <div>
                <h3 className="font-medium text-sm mb-2" style={{ color: "var(--neutral-900)" }}>
                  Problem Description
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-50)' }}>
                  <p className="text-sm" style={{ color: "var(--primary-950)" }}>
                    {request.description}
                  </p>
                </div>
              </div>
            )}

            {/* Password Section - Always visible */}
            <div 
              className="p-4 rounded-xl border"
              style={{ borderColor: 'var(--primary-200)', backgroundColor: 'var(--primary-50)' }}
            >
              <h3 className="font-medium text-sm mb-3" style={{ color: "var(--primary-900)" }}>
                Set Password for Client Account
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--neutral-700)" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "var(--neutral-400)", color: "var(--primary-950)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--neutral-700)" }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "var(--neutral-400)", color: "var(--primary-950)" }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="flex items-center justify-between pt-4 border-t"
              style={{ borderColor: "var(--neutral-200)" }}
            >
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-colors hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "white", borderColor: "var(--danger-200)", color: "var(--danger-500)" }}
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting..." : "Delete"}
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg border font-medium text-sm transition-colors hover:opacity-80"
                  style={{ backgroundColor: "white", borderColor: "var(--neutral-400)", color: "var(--neutral-700)" }}
                >
                  Return
                </button>
                <button
                  type="button"
                  onClick={handleCreateClient}
                  disabled={creating || !password.trim()}
                  className="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary-600)", color: "white" }}
                >
                  {creating ? "Creating..." : "Create Client"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: "var(--neutral-500)" }}>
              Request not found
            </p>
          </div>
        )}
      </div>
    </>
  );
}
