import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import toast from 'react-hot-toast';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
  }

  async start() {
    if (this.connection) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found for SignalR connection');
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_NOTIFICATION_URL || 'http://localhost:5006'}/notificationHub`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    // Set up event handlers
    this.setupEventHandlers();

    try {
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('SignalR Connected');
      
      // Join user-specific group
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        await this.connection.invoke('JoinGroup', `user_${user.id}`);
      }
      
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      this.scheduleReconnect();
    }
  }

  setupEventHandlers() {
    if (!this.connection) return;

    // Handle incoming notifications
    this.connection.on('ReceiveNotification', (notification) => {
      this.handleNotification(notification);
    });

    // Handle connection events
    this.connection.onreconnecting(() => {
      console.log('SignalR Reconnecting...');
      this.isConnected = false;
    });

    this.connection.onreconnected(() => {
      console.log('SignalR Reconnected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.connection.onclose(() => {
      console.log('SignalR Connection Closed');
      this.isConnected = false;
      this.scheduleReconnect();
    });
  }

  handleNotification(notification) {
    console.log('Received notification:', notification);

    // Show toast notification
    const toastOptions = {
      duration: 5000,
      position: 'top-right',
    };

    switch (notification.Type) {
      case 'order_update':
        toast.success(notification.Message, {
          ...toastOptions,
          icon: '🛒',
        });
        break;

      case 'inventory_alert':
        toast.error(notification.Message, {
          ...toastOptions,
          icon: '⚠️',
        });
        break;

      case 'system_alert':
        const toastType = notification.Severity === 'error' ? 'error' : 
                         notification.Severity === 'warning' ? 'error' : 
                         notification.Severity === 'success' ? 'success' : 'info';
        
        toast[toastType](notification.Message, {
          ...toastOptions,
          icon: this.getNotificationIcon(notification.Severity),
        });
        break;

      default:
        toast(notification.Message || 'New notification', toastOptions);
    }

    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('signalr-notification', {
      detail: notification
    }));
  }

  getNotificationIcon(severity) {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  }

  async scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    setTimeout(() => {
      this.start();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  async stop() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        this.isConnected = false;
        console.log('SignalR Disconnected');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  async joinGroup(groupName) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('JoinGroup', groupName);
        console.log(`Joined group: ${groupName}`);
      } catch (error) {
        console.error(`Error joining group ${groupName}:`, error);
      }
    }
  }

  async leaveGroup(groupName) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke('LeaveGroup', groupName);
        console.log(`Left group: ${groupName}`);
      } catch (error) {
        console.error(`Error leaving group ${groupName}:`, error);
      }
    }
  }

  // Method to send custom messages (if needed)
  async sendMessage(method, ...args) {
    if (this.connection && this.isConnected) {
      try {
        return await this.connection.invoke(method, ...args);
      } catch (error) {
        console.error(`Error invoking ${method}:`, error);
        throw error;
      }
    } else {
      throw new Error('SignalR connection not established');
    }
  }

  // Get connection status
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      connectionState: this.connection?.connectionState || 'Disconnected',
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const signalRService = new SignalRService();

export default signalRService;
