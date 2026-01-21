'use client';

import { AlertCircle } from "lucide-react";

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
};

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(35, 40, 72, 0.2)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 w-[400px] z-50"
        style={{ backgroundColor: 'white' }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Icon */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--danger-500)' }}
          >
            <AlertCircle 
              className="w-8 h-8" 
              style={{ color: 'white' }} 
            />
          </div>

          {/* Title */}
          <h2 
            className="font-medium text-xl text-center"
            style={{ color: 'var(--primary-950)' }}
          >
            {title}
          </h2>

          {/* Message */}
          <p 
            className="text-sm text-center"
            style={{ color: 'var(--neutral-600)' }}
          >
            {message}
            {itemName && (
              <span 
                className="font-medium block mt-1"
                style={{ color: 'var(--primary-950)' }}
              >
                "{itemName}"
              </span>
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-80"
              style={{ 
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--neutral-700)',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 border rounded-lg font-medium text-base transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--danger-500)',
                borderColor: 'var(--danger-500)',
                color: 'white',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
