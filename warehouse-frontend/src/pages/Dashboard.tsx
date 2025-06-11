import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  TrendingUp as RevenueIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useDashboardStats, useLowStockItems, useActiveAlerts } from '../hooks/useApi';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: lowStockItems = [], isLoading: lowStockLoading } = useLowStockItems();
  const { data: activeAlerts = [], isLoading: alertsLoading } = useActiveAlerts();

  // Mock data for charts (replace with real API data)
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
  ];

  const orderStatusData = [
    { name: 'Pending', value: 30, color: '#ff9800' },
    { name: 'Processing', value: 45, color: '#2196f3' },
    { name: 'Shipped', value: 60, color: '#4caf50' },
    { name: 'Delivered', value: 85, color: '#8bc34a' },
  ];

  const inventoryData = [
    { name: 'Electronics', stock: 120 },
    { name: 'Clothing', stock: 80 },
    { name: 'Books', stock: 200 },
    { name: 'Home & Garden', stock: 150 },
  ];

  if (statsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load dashboard data. Please check if the backend services are running.
      </Alert>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
  }> = ({ title, value, icon, color, loading }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { 
              sx: { color: 'white', fontSize: 24 } 
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Inventory Items"
            value={stats?.totalInventoryItems || 0}
            icon={<InventoryIcon />}
            color="#2196f3"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={<OrdersIcon />}
            color="#4caf50"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={<CustomersIcon />}
            color="#ff9800"
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${stats?.totalRevenue?.toLocaleString() || '0'}`}
            icon={<RevenueIcon />}
            color="#9c27b0"
            loading={statsLoading}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                    dot={{ fill: '#2196f3' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Inventory by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory by Category
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {/* Low Stock Alerts */}
                {lowStockLoading ? (
                  <ListItem>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <ListItemText primary="Loading low stock items..." />
                  </ListItem>
                ) : (
                  lowStockItems.slice(0, 3).map((item) => (
                    <ListItem key={item.id}>
                      <WarningIcon color="warning" sx={{ mr: 2 }} />
                      <ListItemText
                        primary={`Low stock: ${item.sku}`}
                        secondary={`Only ${item.quantity} items left`}
                      />
                      <Chip label="Low Stock" color="warning" size="small" />
                    </ListItem>
                  ))
                )}

                {/* Active Alerts */}
                {alertsLoading ? (
                  <ListItem>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <ListItemText primary="Loading alerts..." />
                  </ListItem>
                ) : (
                  activeAlerts.slice(0, 2).map((alert) => (
                    <ListItem key={alert.id}>
                      <WarningIcon color="error" sx={{ mr: 2 }} />
                      <ListItemText
                        primary={alert.title}
                        secondary={format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}
                      />
                      <Chip 
                        label={alert.severity} 
                        color={alert.severity === 'HIGH' ? 'error' : 'warning'} 
                        size="small" 
                      />
                    </ListItem>
                  ))
                )}

                {/* Recent Orders */}
                {stats?.recentOrders?.slice(0, 2).map((order) => (
                  <ListItem key={order.id}>
                    <CheckIcon color="success" sx={{ mr: 2 }} />
                    <ListItemText
                      primary={`Order ${order.orderNumber}`}
                      secondary={`$${order.totalAmount} - ${order.status}`}
                    />
                    <Chip 
                      label={order.status} 
                      color={order.status === 'DELIVERED' ? 'success' : 'primary'} 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
