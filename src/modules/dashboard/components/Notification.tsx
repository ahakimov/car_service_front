'use client';

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type NotificationProps = {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
};

export function Notification({
  isVisible,
  onClose,
  title,
  message,
  type = "success",
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: 'var(--success-50)',
          border: 'var(--success-200)',
          iconBg: 'var(--success-100)',
          iconColor: 'var(--success-600)',
          Icon: CheckCircle,
        };
      case "error":
        return {
          bg: 'var(--danger-50)',
          border: 'var(--danger-200)',
          iconBg: 'var(--danger-100)',
          iconColor: 'var(--danger-600)',
          Icon: AlertCircle,
        };
      default:
        return {
          bg: 'var(--primary-50)',
          border: 'var(--primary-200)',
          iconBg: 'var(--primary-100)',
          iconColor: 'var(--primary-600)',
          Icon: Info,
        };
    }
  };

  const styles = getStyles();
  const IconComponent = styles.Icon;

  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className="flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-[320px] max-w-[400px]"
        style={{
          backgroundColor: styles.bg,
          borderColor: styles.border,
        }}
      >
        <div
          className="p-2 rounded-full shrink-0"
          style={{ backgroundColor: styles.iconBg }}
        >
          <IconComponent 
            className="w-5 h-5" 
            style={{ color: styles.iconColor }} 
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="font-medium text-sm"
            style={{ color: 'var(--primary-950)' }}
          >
            {title}
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--neutral-700)' }}
          >
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md transition-colors hover:opacity-70 shrink-0"
          style={{ color: 'var(--neutral-500)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
