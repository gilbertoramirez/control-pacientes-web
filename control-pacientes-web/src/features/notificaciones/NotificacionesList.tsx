import React, { useEffect, useState } from 'react';
import { useApi } from '../../infrastructure/api/ApiProvider';
import { NotificationService } from './services/NotificationService';

const NotificacionesList: React.FC = () => {
  const { notificationService } = useApi();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let notificationsData: Notification[];
      
      if (filter === 'unread') {
        notificationsData = await notificationService.getMyUnreadNotifications();
      } else {
        notificationsData = await notificationService.getMyNotifications();
      }
      
      // Sort by date (most recent first)
      notificationsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(notificationsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Error al cargar las notificaciones. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Error al marcar la notificación como leída. Por favor, inténtelo de nuevo.');
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      await notificationService.markAsUnread(id);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: false } 
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as unread:', err);
      setError('Error al marcar la notificación como no leída. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      
      // Update local state
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Error al eliminar la notificación. Por favor, inténtelo de nuevo.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Error al marcar todas las notificaciones como leídas. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar todas las notificaciones? Esta acción no se puede deshacer.')) {
      try {
        await notificationService.deleteAllNotifications();
        
        // Update local state
        setNotifications([]);
      } catch (err) {
        console.error('Error deleting all notifications:', err);
        setError('Error al eliminar todas las notificaciones. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    // Re-fetch with new filter
    setLoading(true);
    setTimeout(() => {
      fetchNotifications();
    }, 0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'treatment':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      case 'invoice':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'system':
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const priorityClasses = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    
    const priorityText = {
      'low': 'Baja',
      'normal': 'Normal',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityClasses[priority as keyof typeof priorityClasses]}`}>
        {priorityText[priority as keyof typeof priorityText]}
      </span>
    );
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} minutos`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} horas`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-MX');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => handleFilterChange('all')}
              className={`py-2 px-4 rounded-md transition duration-200 ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={`py-2 px-4 rounded-md transition duration-200 ${
                filter === 'unread' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              No leídas
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="text-lg font-medium text-gray-700">
              {notifications.length} Notificaciones
              {filter === 'unread' ? ' sin leer' : ''}
            </div>
            <div className="flex space-x-3">
              {notifications.some(n => !n.read) && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAllNotifications}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Eliminar todas
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                Todas sus notificaciones aparecerán aquí cuando estén disponibles.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(notification.priority)}
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex justify-end space-x-4">
                        {notification.read ? (
                          <button
                            onClick={() => handleMarkAsUnread(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Marcar como no leída
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Marcar como leída
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificacionesList; 