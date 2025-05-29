using ReportingService.DTOs;

namespace ReportingService.Services
{
    public interface IReportingService
    {
        Task<RevenueReportDto> GetRevenueReportAsync(DateTime startDate, DateTime endDate);
        Task<InventoryReportDto> GetInventoryReportAsync();
        Task<SalesReportDto> GetSalesReportAsync(DateTime startDate, DateTime endDate);
        Task<CustomerReportDto> GetCustomerReportAsync();
        Task<ProductPerformanceReportDto> GetProductPerformanceReportAsync(DateTime startDate, DateTime endDate);
        Task<byte[]> ExportReportToPdfAsync(string reportType, DateTime startDate, DateTime endDate);
        Task<byte[]> ExportReportToExcelAsync(string reportType, DateTime startDate, DateTime endDate);
    }
}
