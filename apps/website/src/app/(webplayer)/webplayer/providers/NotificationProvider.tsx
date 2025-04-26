'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Define types
type NotificationType = 'info' | 'danger' | 'success' | 'warning';
type Position = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

interface NotificationOptions {
  duration?: number;
  position?: Position;
  animation?: boolean;
}

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  duration: number;
  position: Position;
  animation: boolean;
}

interface NotificationContextType {
  showInfo: (message: string, options?: NotificationOptions) => number;
  showAlert: (message: string, options?: NotificationOptions) => number;
  showSuccess: (message: string, options?: NotificationOptions) => number;
  showWarning: (message: string, options?: NotificationOptions) => number;
  removeNotification: (id: number) => void;
}

interface NotificationProps extends Notification {
  onClose: () => void;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  defaultDuration?: number;
  defaultPosition?: Position;
  defaultAnimation?: boolean;
}

const DEFAULT_DURATION = 5000;
const DEFAULT_POSITION: Position = 'bottom-end';
const DEFAULT_ANIMATION = true;

// Create context
const NotificationContext = createContext<NotificationContextType | null>(null);

// Get icon based on notification type
const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={18} />;
    case 'danger':
      return <AlertCircle size={18} />;
    case 'warning':
      return <AlertTriangle size={18} />;
    default:
      return <Info size={18} />;
  }
};

// Notification component
const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  duration,
  animation
}) => {
  return (
    <Toast
      onClose={onClose}
      className="mb-3"
      bg={type}
      autohide
      delay={duration}
      animation={animation}
    >
      <Toast.Header closeButton={false} className="justify-between">
        <div className="d-flex align-items-center">
          <span className="me-2">{getIcon(type)}</span>
          <strong>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </strong>
        </div>
        <button
          onClick={onClose}
          className="btn btn-link p-0 ms-2 text-dark"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </Toast.Header>
      <Toast.Body className={type === 'info' || type === 'danger' ? 'text-white' : ''}>
        {message}
      </Toast.Body>
    </Toast>
  );
};

// Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  defaultDuration = DEFAULT_DURATION,
  defaultPosition = DEFAULT_POSITION,
  defaultAnimation = DEFAULT_ANIMATION
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Group notifications by position
  const notificationsByPosition = notifications.reduce((acc, notification) => {
    if (!acc[notification.position]) {
      acc[notification.position] = [];
    }
    acc[notification.position].push(notification);
    return acc;
  }, {} as Record<Position, Notification[]>);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((
    message: string,
    type: NotificationType,
    options?: NotificationOptions
  ) => {
    const id = Date.now();
    const notification: Notification = {
      id,
      message,
      type,
      duration: options?.duration ?? defaultDuration,
      position: options?.position ?? defaultPosition,
      animation: options?.animation ?? defaultAnimation
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  }, [defaultDuration, defaultPosition, defaultAnimation]);

  const showInfo = useCallback((message: string, options?: NotificationOptions) => {
    return addNotification(message, 'info', options);
  }, [addNotification]);

  const showAlert = useCallback((message: string, options?: NotificationOptions) => {
    return addNotification(message, 'danger', options);
  }, [addNotification]);

  const showSuccess = useCallback((message: string, options?: NotificationOptions) => {
    return addNotification(message, 'success', options);
  }, [addNotification]);

  const showWarning = useCallback((message: string, options?: NotificationOptions) => {
    return addNotification(message, 'warning', options);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      showInfo,
      showAlert,
      showSuccess,
      showWarning,
      removeNotification
    }}>
      {children}
      {Object.entries(notificationsByPosition).map(([position, notifications]) => (
        <ToastContainer
          key={position}
          className="p-3"
          position={position as Position}
        >
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              {...notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </ToastContainer>
      ))}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};