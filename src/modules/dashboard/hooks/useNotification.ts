import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

type NotificationState = {
  visible: boolean;
  title: string;
  message: string;
  type: NotificationType;
};

type UseNotificationOptions = {
  autoHide?: boolean;
  autoHideDelay?: number; // in milliseconds
};

export function useNotification(options: UseNotificationOptions = {}) {
  const { autoHide = false, autoHideDelay = 3000 } = options;

  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showNotification = useCallback(
    (title: string, message: string, type: NotificationType = 'success') => {
      setNotification({ visible: true, title, message, type });

      if (autoHide) {
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, visible: false }));
        }, autoHideDelay);
      }
    },
    [autoHide, autoHideDelay]
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
}
