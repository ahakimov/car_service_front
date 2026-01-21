'use client';

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { RepairJob, RepairJobDto } from "@/app/api/types";
import { httpClient } from "@/app/api/httpClient";
import { API_CONFIG } from "@/app/api/config";

type ClientRepairJobDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  repairJob: RepairJob | null;
  onCancelled?: () => void;
  onNotification?: (title: string, message: string, type: "success" | "error" | "info") => void;
};

export function ClientRepairJobDetailsModal({
  isOpen,
  onClose,
  repairJob,
  onCancelled,
  onNotification,
}: ClientRepairJobDetailsModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!isOpen || !repairJob) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "-";
    }
  };

  // Clients can only cancel repair jobs when status is "Upcoming"
  const canCancel =
    !!repairJob.status &&
    repairJob.status.toLowerCase() === "upcoming";

  const handleConfirmCancel = async () => {
    if (!repairJob?.id || !canCancel) {
      setShowCancelConfirm(false);
      return;
    }

    setIsCancelling(true);
    try {
      const payload: RepairJobDto = {
        clientId: repairJob.client?.id,
        mechanicId: repairJob.mechanic?.id,
        startDateTime: repairJob.startDateTime,
        endDateTime: repairJob.endDateTime,
        serviceId: repairJob.service?.id,
        status: "cancelled",
        additionalDetails: repairJob.additionalDetails,
      };

      const response = await httpClient.put<RepairJob, RepairJobDto>(
        API_CONFIG.ENDPOINTS.REPAIR_JOBS.UPDATE(repairJob.id),
        payload
      );

      if (response.error) {
        console.error("Error cancelling repair job:", response.error);
        onNotification?.(
          "Error",
          `Failed to cancel repair job: ${response.error}`,
          "error"
        );
      } else {
        onNotification?.(
          "Successfully cancelled repair job",
          "Your changes have been saved",
          "success"
        );
        onCancelled?.();
        onClose();
      }
    } catch (error) {
      console.error("Error cancelling repair job:", error);
      onNotification?.("Error", "Failed to cancel repair job", "error");
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto z-50"
        style={{ backgroundColor: "white" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-medium text-xl"
            style={{ color: "var(--primary-950)" }}
          >
            Repair Job details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:opacity-70 transition-colors"
            style={{ color: "var(--neutral-500)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Two-column layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left column */}
            <div className="flex flex-col gap-4">
              <div>
                <p
                  className="text-sm font-medium mb-1.5"
                  style={{ color: "var(--neutral-600)" }}
                >
                  Vehicle
                </p>
                <p className="text-sm" style={{ color: "var(--primary-950)" }}>
                  {repairJob.client?.name || "-"}
                </p>
              </div>
              <div>
                <p
                  className="text-sm font-medium mb-1.5"
                  style={{ color: "var(--neutral-600)" }}
                >
                  Service
                </p>
                <p className="text-sm" style={{ color: "var(--primary-950)" }}>
                  {repairJob.service?.serviceName || "-"}
                </p>
              </div>
              <div>
                <p
                  className="text-sm font-medium mb-1.5"
                  style={{ color: "var(--neutral-600)" }}
                >
                  Status
                </p>
                <p className="text-sm" style={{ color: "var(--primary-950)" }}>
                  {repairJob.status || "Unknown"}
                </p>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              <div>
                <p
                  className="text-sm font-medium mb-1.5"
                  style={{ color: "var(--neutral-600)" }}
                >
                  Mechanic
                </p>
                <p className="text-sm" style={{ color: "var(--primary-950)" }}>
                  {repairJob.mechanic?.name || "-"}
                </p>
              </div>
              <div>
                <p
                  className="text-sm font-medium mb-1.5"
                  style={{ color: "var(--neutral-600)" }}
                >
                  Estimated completion date
                </p>
                <p className="text-sm" style={{ color: "var(--primary-950)" }}>
                  {formatDate(repairJob.endDateTime)}
                </p>
              </div>
              <div>
                <p
                  className="text-sm font-medium mb-1.5"
                  style={{ color: "var(--neutral-600)" }}
                >
                  Estimated completion time
                </p>
                <p className="text-sm" style={{ color: "var(--primary-950)" }}>
                  {formatTime(repairJob.endDateTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Additional details */}
          <div>
            <p
              className="text-sm font-medium mb-1.5"
              style={{ color: "var(--neutral-600)" }}
            >
              Additional details
            </p>
            <p className="text-sm" style={{ color: "var(--primary-950)" }}>
              {repairJob.additionalDetails || "-"}
            </p>
          </div>

          {/* Action buttons */}
          <div
            className="flex items-center justify-between pt-6 border-t"
            style={{ borderColor: "var(--neutral-200)" }}
          >
            <button
              onClick={onClose}
              className="px-6 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-80"
              style={{
                backgroundColor: "white",
                borderColor: "var(--neutral-400)",
                color: "var(--neutral-700)",
              }}
            >
              Return
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={!canCancel}
              className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--danger-500)",
                borderColor: "var(--danger-500)",
                color: "white",
              }}
            >
              Cancel repair job
            </button>
          </div>
        </div>

        {/* Cancel confirmation modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(35, 40, 72, 0.2)" }}
              onClick={() => !isCancelling && setShowCancelConfirm(false)}
            />
            <div
              className="relative bg-white rounded-xl p-6 w-[420px] shadow-lg flex flex-col items-center gap-6"
              style={{ zIndex: 60 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--danger-100)" }}
              >
                <AlertCircle
                  className="w-8 h-8"
                  style={{ color: "var(--danger-500)" }}
                />
              </div>
              <div className="text-center space-y-2">
                <p
                  className="font-medium text-lg"
                  style={{ color: "var(--primary-950)" }}
                >
                  Do you want to cancel this repair job?
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--neutral-600)" }}
                >
                  Are you sure you want to cancel this repair job? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => !isCancelling && setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-80"
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
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--danger-500)",
                    borderColor: "var(--danger-500)",
                    color: "white",
                  }}
                >
                  {isCancelling ? "Cancelling..." : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

