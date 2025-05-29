using ReportingService.DTOs;

namespace ReportingService.Services
{
    public interface IExcelExportService
    {
        Task<byte[]> ExportRevenueReportToExcelAsync(RevenueReportDto report, DateTime startDate, DateTime endDate);
        Task<byte[]> ExportSalesReportToExcelAsync(SalesReportDto report, DateTime startDate, DateTime endDate);
        Task<byte[]> ExportInventoryReportToExcelAsync(InventoryReportDto report);
        Task<byte[]> ExportCustomerReportToExcelAsync(CustomerReportDto report);
        Task<byte[]> ExportProductPerformanceReportToExcelAsync(ProductPerformanceReportDto report, DateTime startDate, DateTime endDate);
    }
}
