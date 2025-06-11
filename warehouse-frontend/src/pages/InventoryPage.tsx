import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';

import {
  useInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useAdjustStock,
} from '../hooks/useApi';
import { InventoryItem, CreateInventoryItem, UpdateInventoryItem, StockAdjustment } from '../types';

// Validation schemas
const createItemSchema = yup.object({
  productId: yup.number().required('Product ID is required').positive(),
  sku: yup.string().required('SKU is required'),
  quantity: yup.number().required('Quantity is required').min(0),
  minimumStock: yup.number().required('Minimum stock is required').min(0),
  maximumStock: yup.number().required('Maximum stock is required').min(1),
  location: yup.string().required('Location is required'),
});

const adjustStockSchema = yup.object({
  adjustmentType: yup.string().required('Adjustment type is required'),
  quantity: yup.number().required('Quantity is required').positive(),
  reason: yup.string().required('Reason is required'),
  notes: yup.string(),
});

const InventoryPage: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    lowStock: false,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [adjustStockDialogOpen, setAdjustStockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // API hooks
  const { data: inventory = [], isLoading, error, refetch } = useInventory(filters);
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const adjustStockMutation = useAdjustStock();

  // Forms
  const createForm = useForm<CreateInventoryItem>({
    resolver: yupResolver(createItemSchema),
    defaultValues: {
      productId: 0,
      sku: '',
      quantity: 0,
      minimumStock: 0,
      maximumStock: 100,
      location: '',
    },
  });

  const editForm = useForm<UpdateInventoryItem>({
    resolver: yupResolver(createItemSchema.omit(['productId', 'sku'])),
  });

  const adjustStockForm = useForm<Omit<StockAdjustment, 'inventoryItemId'>>({
    resolver: yupResolver(adjustStockSchema),
    defaultValues: {
      adjustmentType: 'IN',
      quantity: 0,
      reason: '',
      notes: '',
    },
  });

  // Handlers
  const handleCreateItem = async (data: CreateInventoryItem) => {
    try {
      await createMutation.mutateAsync(data);
      setCreateDialogOpen(false);
      createForm.reset();
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleEditItem = async (data: UpdateInventoryItem) => {
    if (!selectedItem) return;
    
    try {
      await updateMutation.mutateAsync({ id: selectedItem.id, item: data });
      setEditDialogOpen(false);
      setSelectedItem(null);
      editForm.reset();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleAdjustStock = async (data: Omit<StockAdjustment, 'inventoryItemId'>) => {
    if (!selectedItem) return;
    
    try {
      await adjustStockMutation.mutateAsync({
        ...data,
        inventoryItemId: selectedItem.id,
      });
      setAdjustStockDialogOpen(false);
      setSelectedItem(null);
      adjustStockForm.reset();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    editForm.reset({
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock,
      location: item.location,
    });
    setEditDialogOpen(true);
  };

  const openAdjustStockDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    adjustStockForm.reset();
    setAdjustStockDialogOpen(true);
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'productId', headerName: 'Product ID', width: 100 },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 100,
      renderCell: (params) => {
        const isLowStock = params.row.quantity <= params.row.minimumStock;
        return (
          <Box display="flex" alignItems="center">
            {isLowStock && <WarningIcon color="warning" sx={{ mr: 1, fontSize: 16 }} />}
            <span style={{ color: isLowStock ? '#ff9800' : 'inherit' }}>
              {params.value}
            </span>
          </Box>
        );
      },
    },
    { field: 'reservedQuantity', headerName: 'Reserved', width: 100 },
    { field: 'minimumStock', headerName: 'Min Stock', width: 100 },
    { field: 'maximumStock', headerName: 'Max Stock', width: 100 },
    { field: 'location', headerName: 'Location', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const item = params.row as InventoryItem;
        const isLowStock = item.quantity <= item.minimumStock;
        const isOutOfStock = item.quantity === 0;
        
        if (isOutOfStock) {
          return <Chip label="Out of Stock" color="error" size="small" />;
        } else if (isLowStock) {
          return <Chip label="Low Stock" color="warning" size="small" />;
        } else {
          return <Chip label="In Stock" color="success" size="small" />;
        }
      },
    },
    {
      field: 'lastUpdated',
      headerName: 'Last Updated',
      width: 150,
      renderCell: (params) => format(new Date(params.value), 'MMM dd, yyyy HH:mm'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => openEditDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<RefreshIcon />}
          label="Adjust Stock"
          onClick={() => openAdjustStockDialog(params.row)}
        />,
      ],
    },
  ];

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load inventory data. Please check if the backend services are running.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Item
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search SKU or Location"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filters.lowStock ? 'lowStock' : 'all'}
                  onChange={(e) => setFilters({ ...filters, lowStock: e.target.value === 'lowStock' })}
                  label="Filter"
                >
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="lowStock">Low Stock Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={inventory}
              columns={columns}
              loading={isLoading}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create Item Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={createForm.handleSubmit(handleCreateItem)}>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="productId"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Product ID"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="sku"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="SKU"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="quantity"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Quantity"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="minimumStock"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Minimum Stock"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="maximumStock"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Maximum Stock"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="location"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Location"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <CircularProgress size={20} /> : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={editForm.handleSubmit(handleEditItem)}>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="quantity"
                  control={editForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Quantity"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="minimumStock"
                  control={editForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Minimum Stock"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="maximumStock"
                  control={editForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Maximum Stock"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="location"
                  control={editForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Location"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustStockDialogOpen} onClose={() => setAdjustStockDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={adjustStockForm.handleSubmit(handleAdjustStock)}>
          <DialogTitle>Adjust Stock - {selectedItem?.sku}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="adjustmentType"
                  control={adjustStockForm.control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Adjustment Type</InputLabel>
                      <Select {...field} label="Adjustment Type">
                        <MenuItem value="IN">Stock In</MenuItem>
                        <MenuItem value="OUT">Stock Out</MenuItem>
                        <MenuItem value="ADJUSTMENT">Adjustment</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="quantity"
                  control={adjustStockForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Quantity"
                      type="number"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="reason"
                  control={adjustStockForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Reason"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={adjustStockForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes (Optional)"
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustStockDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={adjustStockMutation.isPending}
            >
              {adjustStockMutation.isPending ? <CircularProgress size={20} /> : 'Adjust Stock'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InventoryPage;
