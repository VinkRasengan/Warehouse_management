import React, { useState } from 'react';
import { 
  Dropdown, 
  Badge, 
  Button, 
  List, 
  Typography, 
  Empty, 
  Space, 
  Tag,
  Divider,
  Tooltip
} from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined,
  SettingOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import { useSignalR } from '../../hooks/useSignalR';
import styled from 'styled-components';
import moment from 'moment';

const { Text } = Typography;

const NotificationContainer = styled.div`
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled(List.Item)`
  padding: 12px 16px !important;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  ${props => !props.read && `
    background-color: #e6f7ff;
    border-left: 3px solid #1890ff;
  `}
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: ${props => props.connected ? '#f6ffed' : '#fff2f0'};
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
`;

const NotificationCenter = () => {
  const {
    connectionState,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  } = useSignalR();

  const [visible, setVisible] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update': return '🛒';
      case 'inventory_alert': return '📦';
      case 'system_alert': return '⚠️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (notification) => {
    if (notification.Color) {
      return notification.Color;
    }
    
    switch (notification.Type) {
      case 'order_update': return 'blue';
      case 'inventory_alert': return 'orange';
      case 'system_alert': 
        return notification.Severity === 'error' ? 'red' : 
               notification.Severity === 'warning' ? 'orange' : 'green';
      default: return 'default';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const notificationContent = (
    <NotificationContainer>
      {/* Connection Status */}
      <ConnectionStatus connected={connectionState.isConnected}>
        {connectionState.isConnected ? (
          <>
            <WifiOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: '#52c41a' }}>Connected</Text>
          </>
        ) : (
          <>
            <DisconnectOutlined style={{ color: '#ff4d4f' }} />
            <Text style={{ color: '#ff4d4f' }}>
              Disconnected
              {connectionState.reconnectAttempts > 0 && 
                ` (Attempt ${connectionState.reconnectAttempts})`
              }
            </Text>
          </>
        )}
      </ConnectionStatus>

      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Notifications ({unreadCount})</Text>
          <Space>
            {unreadCount > 0 && (
              <Button 
                type="text" 
                size="small" 
                icon={<CheckOutlined />}
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              Clear
            </Button>
          </Space>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center' }}>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
          />
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <NotificationItem
              key={notification.id}
              read={notification.read}
              onClick={() => handleNotificationClick(notification)}
            >
              <List.Item.Meta
                avatar={
                  <span style={{ fontSize: '20px' }}>
                    {getNotificationIcon(notification.Type)}
                  </span>
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text strong={!notification.read} style={{ fontSize: '13px' }}>
                      {notification.Message}
                    </Text>
                    <Tag 
                      color={getNotificationColor(notification)} 
                      size="small"
                      style={{ marginLeft: '8px', fontSize: '10px' }}
                    >
                      {notification.Type?.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </div>
                }
                description={
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {moment(notification.timestamp).fromNow()}
                  </Text>
                }
              />
            </NotificationItem>
          )}
        />
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '8px 16px', textAlign: 'center' }}>
            <Button type="link" size="small" icon={<SettingOutlined />}>
              Notification Settings
            </Button>
          </div>
        </>
      )}
    </NotificationContainer>
  );

  return (
    <Dropdown
      overlay={notificationContent}
      trigger={['click']}
      placement="bottomRight"
      visible={visible}
      onVisibleChange={setVisible}
    >
      <Tooltip title="Notifications">
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ 
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </Badge>
      </Tooltip>
    </Dropdown>
  );
};

export default NotificationCenter;
