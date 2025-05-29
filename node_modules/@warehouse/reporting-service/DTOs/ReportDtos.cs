namespace ReportingService.DTOs
{
    public class RevenueReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<DailyRevenueDto> RevenueByDay { get; set; } = new();
    }

    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
    }

    public class InventoryReportDto
    {
        public int TotalProducts { get; set; }
        public decimal TotalValue { get; set; }
        public int LowStockItems { get; set; }
        public int OutOfStockItems { get; set; }
        public List<ProductStockDto> TopProducts { get; set; } = new();
    }

    public class ProductStockDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public decimal Value { get; set; }
    }

    public class SalesReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalSales { get; set; }
        public int TotalQuantitySold { get; set; }
        public List<ProductSalesDto> TopSellingProducts { get; set; } = new();
    }

    public class ProductSalesDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
    }

    public class CustomerReportDto
    {
        public int TotalCustomers { get; set; }
        public int NewCustomers { get; set; }
        public int ActiveCustomers { get; set; }
        public Dictionary<string, int> CustomersByTier { get; set; } = new();
        public List<CustomerSummaryDto> TopCustomers { get; set; } = new();
    }

    public class CustomerSummaryDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
    }

    public class ProductPerformanceReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalProducts { get; set; }
        public int ProductsWithSales { get; set; }
        public List<ProductPerformanceDto> ProductPerformance { get; set; } = new();
    }

    public class ProductPerformanceDto
    {
        public string ProductName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public decimal Profit { get; set; }
        public decimal Margin { get; set; }
    }

    public class ReportDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Parameters { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
    }

    public class CreateReportDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Parameters { get; set; } = string.Empty;
    }

    public class ReportScheduleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public string CronExpression { get; set; } = string.Empty;
        public string Parameters { get; set; } = string.Empty;
        public List<string> Recipients { get; set; } = new();
        public bool IsActive { get; set; }
        public DateTime? NextRunTime { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateReportScheduleDto
    {
        public string Name { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public string CronExpression { get; set; } = string.Empty;
        public string Parameters { get; set; } = string.Empty;
        public List<string> Recipients { get; set; } = new();
    }
}
