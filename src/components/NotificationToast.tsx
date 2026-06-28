import React from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm animate-slide-in ${getTypeStyles(notification.type)}`}
        >
          <span className="text-xl">{getIcon(notification.type)}</span>
          <div className="flex-1">
            <h4 className="font-semibold">{notification.title}</h4>
            <p className="text-sm opacity-80">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
