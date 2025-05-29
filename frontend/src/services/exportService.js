import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5007/api';

// Create axios instance for reporting service
const reportingApi = axios.create({
  baseURL: API_BASE_URL.replace('5004', '5007'), // Reporting service port
  timeout: 30000, // 30 seconds for export operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
reportingApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
reportingApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const exportService = {
  // Download file helper
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Export revenue report to PDF
  exportRevenueReportToPdf: async (startDate, endDate) => {
    try {
      const response = await reportingApi.get('/reports/revenue/export/pdf', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      const filename = `Revenue_Report_${startDate}_${endDate}.pdf`;
      exportService.downloadFile(response.data, filename);
      message.success('Revenue report exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting revenue report to PDF:', error);
      message.error('Failed to export revenue report to PDF');
      throw error;
    }
  },

  // Export revenue report to Excel
  exportRevenueReportToExcel: async (startDate, endDate) => {
    try {
      const response = await reportingApi.get('/reports/revenue/export/excel', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      const filename = `Revenue_Report_${startDate}_${endDate}.xlsx`;
      exportService.downloadFile(response.data, filename);
      message.success('Revenue report exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting revenue report to Excel:', error);
      message.error('Failed to export revenue report to Excel');
      throw error;
    }
  },

  // Export sales report to PDF
  exportSalesReportToPdf: async (startDate, endDate) => {
    try {
      const response = await reportingApi.get('/reports/sales/export/pdf', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      const filename = `Sales_Report_${startDate}_${endDate}.pdf`;
      exportService.downloadFile(response.data, filename);
      message.success('Sales report exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting sales report to PDF:', error);
      message.error('Failed to export sales report to PDF');
      throw error;
    }
  },

  // Export sales report to Excel
  exportSalesReportToExcel: async (startDate, endDate) => {
    try {
      const response = await reportingApi.get('/reports/sales/export/excel', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      const filename = `Sales_Report_${startDate}_${endDate}.xlsx`;
      exportService.downloadFile(response.data, filename);
      message.success('Sales report exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting sales report to Excel:', error);
      message.error('Failed to export sales report to Excel');
      throw error;
    }
  },

  // Export inventory report to PDF
  exportInventoryReportToPdf: async () => {
    try {
      const response = await reportingApi.get('/reports/inventory/export/pdf', {
        responseType: 'blob'
      });
      
      const filename = `Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      exportService.downloadFile(response.data, filename);
      message.success('Inventory report exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting inventory report to PDF:', error);
      message.error('Failed to export inventory report to PDF');
      throw error;
    }
  },

  // Export inventory report to Excel
  exportInventoryReportToExcel: async () => {
    try {
      const response = await reportingApi.get('/reports/inventory/export/excel', {
        responseType: 'blob'
      });
      
      const filename = `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      exportService.downloadFile(response.data, filename);
      message.success('Inventory report exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting inventory report to Excel:', error);
      message.error('Failed to export inventory report to Excel');
      throw error;
    }
  },

  // Export customer report to PDF
  exportCustomerReportToPdf: async () => {
    try {
      const response = await reportingApi.get('/reports/customers/export/pdf', {
        responseType: 'blob'
      });
      
      const filename = `Customer_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      exportService.downloadFile(response.data, filename);
      message.success('Customer report exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting customer report to PDF:', error);
      message.error('Failed to export customer report to PDF');
      throw error;
    }
  },

  // Export customer report to Excel
  exportCustomerReportToExcel: async () => {
    try {
      const response = await reportingApi.get('/reports/customers/export/excel', {
        responseType: 'blob'
      });
      
      const filename = `Customer_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      exportService.downloadFile(response.data, filename);
      message.success('Customer report exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting customer report to Excel:', error);
      message.error('Failed to export customer report to Excel');
      throw error;
    }
  },

  // Export product performance report to PDF
  exportProductPerformanceReportToPdf: async (startDate, endDate) => {
    try {
      const response = await reportingApi.get('/reports/product-performance/export/pdf', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      const filename = `Product_Performance_Report_${startDate}_${endDate}.pdf`;
      exportService.downloadFile(response.data, filename);
      message.success('Product performance report exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting product performance report to PDF:', error);
      message.error('Failed to export product performance report to PDF');
      throw error;
    }
  },

  // Export product performance report to Excel
  exportProductPerformanceReportToExcel: async (startDate, endDate) => {
    try {
      const response = await reportingApi.get('/reports/product-performance/export/excel', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      
      const filename = `Product_Performance_Report_${startDate}_${endDate}.xlsx`;
      exportService.downloadFile(response.data, filename);
      message.success('Product performance report exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting product performance report to Excel:', error);
      message.error('Failed to export product performance report to Excel');
      throw error;
    }
  },

  // Export data to CSV (client-side)
  exportToCSV: (data, filename) => {
    try {
      const csvContent = exportService.convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      exportService.downloadFile(blob, `${filename}.csv`);
      message.success('Data exported to CSV successfully!');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      message.error('Failed to export data to CSV');
      throw error;
    }
  },

  // Convert array of objects to CSV
  convertToCSV: (data) => {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  },

  // Print functionality
  printReport: (elementId) => {
    try {
      const printContent = document.getElementById(elementId);
      if (!printContent) {
        message.error('Print content not found');
        return;
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      
      message.success('Report sent to printer successfully!');
    } catch (error) {
      console.error('Error printing report:', error);
      message.error('Failed to print report');
      throw error;
    }
  }
};

export default exportService;
