using OfficeOpenXml;
using OfficeOpenXml.Style;
using ReportingService.DTOs;
using System.Drawing;

namespace ReportingService.Services
{
    public class ExcelExportService : IExcelExportService
    {
        public async Task<byte[]> ExportRevenueReportToExcelAsync(RevenueReportDto report, DateTime startDate, DateTime endDate)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Revenue Report");

                // Header
                worksheet.Cells[1, 1].Value = "Revenue Report";
                worksheet.Cells[1, 1].Style.Font.Size = 16;
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1, 1, 4].Merge = true;

                worksheet.Cells[2, 1].Value = $"Period: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";
                worksheet.Cells[2, 1, 2, 4].Merge = true;

                // Summary
                worksheet.Cells[4, 1].Value = "Summary";
                worksheet.Cells[4, 1].Style.Font.Bold = true;

                worksheet.Cells[5, 1].Value = "Total Revenue:";
                worksheet.Cells[5, 2].Value = report.TotalRevenue;
                worksheet.Cells[5, 2].Style.Numberformat.Format = "#,##0.00";

                worksheet.Cells[6, 1].Value = "Total Orders:";
                worksheet.Cells[6, 2].Value = report.TotalOrders;

                worksheet.Cells[7, 1].Value = "Average Order Value:";
                worksheet.Cells[7, 2].Value = report.AverageOrderValue;
                worksheet.Cells[7, 2].Style.Numberformat.Format = "#,##0.00";

                // Daily revenue table
                if (report.DailyRevenue?.Any() == true)
                {
                    int startRow = 9;
                    worksheet.Cells[startRow, 1].Value = "Daily Revenue";
                    worksheet.Cells[startRow, 1].Style.Font.Bold = true;

                    startRow++;
                    worksheet.Cells[startRow, 1].Value = "Date";
                    worksheet.Cells[startRow, 2].Value = "Revenue";
                    worksheet.Cells[startRow, 3].Value = "Orders";
                    
                    // Header styling
                    using (var range = worksheet.Cells[startRow, 1, startRow, 3])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    }

                    startRow++;
                    foreach (var daily in report.DailyRevenue)
                    {
                        worksheet.Cells[startRow, 1].Value = daily.Date.ToString("dd/MM/yyyy");
                        worksheet.Cells[startRow, 2].Value = daily.Revenue;
                        worksheet.Cells[startRow, 2].Style.Numberformat.Format = "#,##0.00";
                        worksheet.Cells[startRow, 3].Value = daily.OrderCount;
                        startRow++;
                    }
                }

                // Auto-fit columns
                worksheet.Cells.AutoFitColumns();

                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportSalesReportToExcelAsync(SalesReportDto report, DateTime startDate, DateTime endDate)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Sales Report");

                // Header
                worksheet.Cells[1, 1].Value = "Sales Report";
                worksheet.Cells[1, 1].Style.Font.Size = 16;
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1, 1, 4].Merge = true;

                worksheet.Cells[2, 1].Value = $"Period: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";
                worksheet.Cells[2, 1, 2, 4].Merge = true;

                // Top products table
                if (report.TopProducts?.Any() == true)
                {
                    int startRow = 4;
                    worksheet.Cells[startRow, 1].Value = "Top Selling Products";
                    worksheet.Cells[startRow, 1].Style.Font.Bold = true;

                    startRow++;
                    worksheet.Cells[startRow, 1].Value = "Product Name";
                    worksheet.Cells[startRow, 2].Value = "Quantity Sold";
                    worksheet.Cells[startRow, 3].Value = "Revenue";
                    
                    // Header styling
                    using (var range = worksheet.Cells[startRow, 1, startRow, 3])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    }

                    startRow++;
                    foreach (var product in report.TopProducts)
                    {
                        worksheet.Cells[startRow, 1].Value = product.ProductName;
                        worksheet.Cells[startRow, 2].Value = product.QuantitySold;
                        worksheet.Cells[startRow, 3].Value = product.Revenue;
                        worksheet.Cells[startRow, 3].Style.Numberformat.Format = "#,##0.00";
                        startRow++;
                    }
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportInventoryReportToExcelAsync(InventoryReportDto report)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Inventory Report");

                // Header
                worksheet.Cells[1, 1].Value = "Inventory Report";
                worksheet.Cells[1, 1].Style.Font.Size = 16;
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1, 1, 4].Merge = true;

                worksheet.Cells[2, 1].Value = $"Generated on: {DateTime.Now:dd/MM/yyyy HH:mm}";
                worksheet.Cells[2, 1, 2, 4].Merge = true;

                // Summary
                worksheet.Cells[4, 1].Value = "Summary";
                worksheet.Cells[4, 1].Style.Font.Bold = true;

                worksheet.Cells[5, 1].Value = "Total Products:";
                worksheet.Cells[5, 2].Value = report.TotalProducts;

                worksheet.Cells[6, 1].Value = "Total Stock Value:";
                worksheet.Cells[6, 2].Value = report.TotalStockValue;
                worksheet.Cells[6, 2].Style.Numberformat.Format = "#,##0.00";

                worksheet.Cells[7, 1].Value = "Low Stock Items:";
                worksheet.Cells[7, 2].Value = report.LowStockItems;

                // Low stock products
                if (report.LowStockProducts?.Any() == true)
                {
                    int startRow = 9;
                    worksheet.Cells[startRow, 1].Value = "Low Stock Products";
                    worksheet.Cells[startRow, 1].Style.Font.Bold = true;

                    startRow++;
                    worksheet.Cells[startRow, 1].Value = "Product Name";
                    worksheet.Cells[startRow, 2].Value = "Current Stock";
                    worksheet.Cells[startRow, 3].Value = "Min Stock";
                    
                    using (var range = worksheet.Cells[startRow, 1, startRow, 3])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    }

                    startRow++;
                    foreach (var product in report.LowStockProducts)
                    {
                        worksheet.Cells[startRow, 1].Value = product.ProductName;
                        worksheet.Cells[startRow, 2].Value = product.CurrentStock;
                        worksheet.Cells[startRow, 3].Value = product.MinStock;
                        startRow++;
                    }
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportCustomerReportToExcelAsync(CustomerReportDto report)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Customer Report");

                // Header
                worksheet.Cells[1, 1].Value = "Customer Report";
                worksheet.Cells[1, 1].Style.Font.Size = 16;
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1, 1, 4].Merge = true;

                // Summary
                worksheet.Cells[3, 1].Value = "Summary";
                worksheet.Cells[3, 1].Style.Font.Bold = true;

                worksheet.Cells[4, 1].Value = "Total Customers:";
                worksheet.Cells[4, 2].Value = report.TotalCustomers;

                worksheet.Cells[5, 1].Value = "New Customers:";
                worksheet.Cells[5, 2].Value = report.NewCustomers;

                worksheet.Cells[6, 1].Value = "VIP Customers:";
                worksheet.Cells[6, 2].Value = report.VipCustomers;

                // Top customers
                if (report.TopCustomers?.Any() == true)
                {
                    int startRow = 8;
                    worksheet.Cells[startRow, 1].Value = "Top Customers by Revenue";
                    worksheet.Cells[startRow, 1].Style.Font.Bold = true;

                    startRow++;
                    worksheet.Cells[startRow, 1].Value = "Customer Name";
                    worksheet.Cells[startRow, 2].Value = "Total Orders";
                    worksheet.Cells[startRow, 3].Value = "Total Spent";
                    
                    using (var range = worksheet.Cells[startRow, 1, startRow, 3])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    }

                    startRow++;
                    foreach (var customer in report.TopCustomers)
                    {
                        worksheet.Cells[startRow, 1].Value = customer.CustomerName;
                        worksheet.Cells[startRow, 2].Value = customer.TotalOrders;
                        worksheet.Cells[startRow, 3].Value = customer.TotalSpent;
                        worksheet.Cells[startRow, 3].Style.Numberformat.Format = "#,##0.00";
                        startRow++;
                    }
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            });
        }

        public async Task<byte[]> ExportProductPerformanceReportToExcelAsync(ProductPerformanceReportDto report, DateTime startDate, DateTime endDate)
        {
            return await Task.Run(() =>
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Product Performance");

                // Header
                worksheet.Cells[1, 1].Value = "Product Performance Report";
                worksheet.Cells[1, 1].Style.Font.Size = 16;
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1, 1, 5].Merge = true;

                worksheet.Cells[2, 1].Value = $"Period: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}";
                worksheet.Cells[2, 1, 2, 5].Merge = true;

                // Product performance table
                if (report.ProductPerformances?.Any() == true)
                {
                    int startRow = 4;
                    worksheet.Cells[startRow, 1].Value = "Product Name";
                    worksheet.Cells[startRow, 2].Value = "Units Sold";
                    worksheet.Cells[startRow, 3].Value = "Revenue";
                    worksheet.Cells[startRow, 4].Value = "Profit Margin";
                    
                    using (var range = worksheet.Cells[startRow, 1, startRow, 4])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    }

                    startRow++;
                    foreach (var product in report.ProductPerformances)
                    {
                        worksheet.Cells[startRow, 1].Value = product.ProductName;
                        worksheet.Cells[startRow, 2].Value = product.UnitsSold;
                        worksheet.Cells[startRow, 3].Value = product.Revenue;
                        worksheet.Cells[startRow, 3].Style.Numberformat.Format = "#,##0.00";
                        worksheet.Cells[startRow, 4].Value = product.ProfitMargin;
                        worksheet.Cells[startRow, 4].Style.Numberformat.Format = "0.00%";
                        startRow++;
                    }
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            });
        }
    }
}
