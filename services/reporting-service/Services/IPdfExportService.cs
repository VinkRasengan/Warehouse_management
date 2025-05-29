using ReportingService.DTOs;

namespace ReportingService.Services
{
    public interface IPdfExportService
    {
        Task<byte[]> ExportRevenueReportToPdfAsync(RevenueReportDto report, DateTime startDate, DateTime endDate);
        Task<byte[]> ExportSalesReportToPdfAsync(SalesReportDto report, DateTime startDate, DateTime endDate);
        Task<byte[]> ExportInventoryReportToPdfAsync(InventoryReportDto report);
        Task<byte[]> ExportCustomerReportToPdfAsync(CustomerReportDto report);
        Task<byte[]> ExportProductPerformanceReportToPdfAsync(ProductPerformanceReportDto report, DateTime startDate, DateTime endDate);
    }
}
