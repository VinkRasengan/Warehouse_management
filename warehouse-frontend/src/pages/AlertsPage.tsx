import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrderIcon,
  Payment as PaymentIcon,
  Computer as SystemIcon,
  CheckCircle as ResolveIcon,
  CheckCircle,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { useActiveAlerts } from '../hooks/useApi';
import { Alert as AlertType, AlertType as AlertTypeEnum, AlertSeverity } from '../types';

const AlertsPage: React.FC = () => {
  const { data: alerts = [], isLoading, error, refetch } = useActiveAlerts();

  const getAlertIcon = (type: AlertTypeEnum) => {
    switch (type) {
      case 'LOW_STOCK': return <InventoryIcon color="warning" />;
      case 'OUT_OF_STOCK': return <InventoryIcon color="error" />;
      case 'ORDER_ISSUE': return <OrderIcon color="warning" />;
      case 'PAYMENT_ISSUE': return <PaymentIcon color="error" />;
      case 'SYSTEM_ERROR': return <SystemIcon color="error" />;
      default: return <WarningIcon color="warning" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'LOW': return 'info';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'LOW': return <InfoIcon color="info" />;
      case 'MEDIUM': return <WarningIcon color="warning" />;
      case 'HIGH': return <ErrorIcon color="error" />;
      case 'CRITICAL': return <ErrorIcon color="error" />;
      default: return <WarningIcon />;
    }
  };

  const handleResolve = (id: number) => {
    // TODO: Implement resolve functionality
    console.log('Resolve alert:', id);
  };

  const handleDelete = (id: number) => {
    // TODO: Implement delete functionality
    console.log('Delete alert:', id);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load alerts. Please check if the backend services are running.
      </Alert>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">System Alerts</Typography>
          <Typography variant="body2" color="text.secondary">
            {alerts.length} active alerts ({criticalAlerts} critical, {highAlerts} high priority)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Box>

      {/* Alert Summary Cards */}
      {alerts.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Alert Summary
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {criticalAlerts > 0 && (
              <Card sx={{ minWidth: 200, backgroundColor: 'error.light', color: 'error.contrastText' }}>
                <CardContent sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4">{criticalAlerts}</Typography>
                      <Typography variant="body2">Critical Alerts</Typography>
                    </Box>
                    <ErrorIcon sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            )}
            {highAlerts > 0 && (
              <Card sx={{ minWidth: 200, backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4">{highAlerts}</Typography>
                      <Typography variant="body2">High Priority</Typography>
                    </Box>
                    <WarningIcon sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main">
                No Active Alerts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All systems are running smoothly!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {alerts
                .sort((a, b) => {
                  // Sort by severity (CRITICAL > HIGH > MEDIUM > LOW)
                  const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                  return severityOrder[b.severity] - severityOrder[a.severity];
                })
                .map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <ListItem
                      sx={{
                        backgroundColor: alert.severity === 'CRITICAL' 
                          ? 'error.light' 
                          : alert.severity === 'HIGH' 
                          ? 'warning.light' 
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: 'action.selected',
                        },
                      }}
                    >
                      <ListItemIcon>
                        {getAlertIcon(alert.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {alert.title}
                            </Typography>
                            <Chip
                              label={alert.type.replace('_', ' ')}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={getSeverityIcon(alert.severity)}
                              label={alert.severity}
                              color={getSeverityColor(alert.severity)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              {alert.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Created: {format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={1}>
                          <IconButton
                            edge="end"
                            aria-label="resolve"
                            onClick={() => handleResolve(alert.id)}
                            size="small"
                            color="success"
                          >
                            <ResolveIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDelete(alert.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < alerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AlertsPage;
