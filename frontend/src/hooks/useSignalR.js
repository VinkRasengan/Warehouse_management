import { useEffect, useState, useCallback } from 'react';
import signalRService from '../services/signalRService';
import { useAuth } from '../contexts/AuthContext';

export const useSignalR = () => {
  const { user } = useAuth();
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    connectionState: 'Disconnected',
    reconnectAttempts: 0
  });
  const [notifications, setNotifications] = useState([]);

  // Update connection state
  const updateConnectionState = useCallback(() => {
    setConnectionState(signalRService.getConnectionState());
  }, []);

  // Handle incoming notifications
  const handleNotification = useCallback((event) => {
    const notification = event.detail;
    setNotifications(prev => [
      {
        ...notification,
        id: Date.now() + Math.random(),
        read: false,
        timestamp: new Date(notification.Timestamp || Date.now())
      },
      ...prev.slice(0, 49) // Keep only last 50 notifications
    ]);
  }, []);

  useEffect(() => {
    if (user) {
      // Start SignalR connection when user is authenticated
      signalRService.start().then(() => {
        updateConnectionState();
      });

      // Listen for notifications
      window.addEventListener('signalr-notification', handleNotification);

      // Update connection state periodically
      const interval = setInterval(updateConnectionState, 5000);

      return () => {
        window.removeEventListener('signalr-notification', handleNotification);
        clearInterval(interval);
      };
    } else {
      // Stop connection when user logs out
      signalRService.stop();
      setNotifications([]);
      setConnectionState({
        isConnected: false,
        connectionState: 'Disconnected',
        reconnectAttempts: 0
      });
    }
  }, [user, handleNotification, updateConnectionState]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Join a group
  const joinGroup = useCallback(async (groupName) => {
    try {
      await signalRService.joinGroup(groupName);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  }, []);

  // Leave a group
  const leaveGroup = useCallback(async (groupName) => {
    try {
      await signalRService.leaveGroup(groupName);
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  }, []);

  return {
    connectionState,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    joinGroup,
    leaveGroup
  };
};
