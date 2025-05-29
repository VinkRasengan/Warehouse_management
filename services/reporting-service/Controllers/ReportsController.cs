using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ReportingService.DTOs;
using ReportingService.Services;

namespace ReportingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportingService _reportingService;
        private readonly IPdfExportService _pdfExportService;
        private readonly IExcelExportService _excelExportService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(
            IReportingService reportingService,
            IPdfExportService pdfExportService,
            IExcelExportService excelExportService,
            ILogger<ReportsController> logger)
        {
            _reportingService = reportingService;
            _pdfExportService = pdfExportService;
            _excelExportService = excelExportService;
            _logger = logger;
        }

        /// <summary>
        /// Get revenue report
        /// </summary>
        [HttpGet("revenue")]
        public async Task<ActionResult<RevenueReportDto>> GetRevenueReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetRevenueReportAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue report");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export revenue report to PDF
        /// </summary>
        [HttpGet("revenue/export/pdf")]
        public async Task<IActionResult> ExportRevenueReportToPdf(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetRevenueReportAsync(startDate, endDate);
                var pdfBytes = await _pdfExportService.ExportRevenueReportToPdfAsync(report, startDate, endDate);
                
                var fileName = $"Revenue_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting revenue report to PDF");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export revenue report to Excel
        /// </summary>
        [HttpGet("revenue/export/excel")]
        public async Task<IActionResult> ExportRevenueReportToExcel(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetRevenueReportAsync(startDate, endDate);
                var excelBytes = await _excelExportService.ExportRevenueReportToExcelAsync(report, startDate, endDate);
                
                var fileName = $"Revenue_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting revenue report to Excel");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get sales report
        /// </summary>
        [HttpGet("sales")]
        public async Task<ActionResult<SalesReportDto>> GetSalesReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetSalesReportAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sales report");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export sales report to PDF
        /// </summary>
        [HttpGet("sales/export/pdf")]
        public async Task<IActionResult> ExportSalesReportToPdf(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetSalesReportAsync(startDate, endDate);
                var pdfBytes = await _pdfExportService.ExportSalesReportToPdfAsync(report, startDate, endDate);
                
                var fileName = $"Sales_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting sales report to PDF");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export sales report to Excel
        /// </summary>
        [HttpGet("sales/export/excel")]
        public async Task<IActionResult> ExportSalesReportToExcel(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetSalesReportAsync(startDate, endDate);
                var excelBytes = await _excelExportService.ExportSalesReportToExcelAsync(report, startDate, endDate);
                
                var fileName = $"Sales_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting sales report to Excel");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get inventory report
        /// </summary>
        [HttpGet("inventory")]
        public async Task<ActionResult<InventoryReportDto>> GetInventoryReport()
        {
            try
            {
                var report = await _reportingService.GetInventoryReportAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inventory report");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export inventory report to PDF
        /// </summary>
        [HttpGet("inventory/export/pdf")]
        public async Task<IActionResult> ExportInventoryReportToPdf()
        {
            try
            {
                var report = await _reportingService.GetInventoryReportAsync();
                var pdfBytes = await _pdfExportService.ExportInventoryReportToPdfAsync(report);
                
                var fileName = $"Inventory_Report_{DateTime.Now:yyyyMMdd}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting inventory report to PDF");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export inventory report to Excel
        /// </summary>
        [HttpGet("inventory/export/excel")]
        public async Task<IActionResult> ExportInventoryReportToExcel()
        {
            try
            {
                var report = await _reportingService.GetInventoryReportAsync();
                var excelBytes = await _excelExportService.ExportInventoryReportToExcelAsync(report);
                
                var fileName = $"Inventory_Report_{DateTime.Now:yyyyMMdd}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting inventory report to Excel");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get customer report
        /// </summary>
        [HttpGet("customers")]
        public async Task<ActionResult<CustomerReportDto>> GetCustomerReport()
        {
            try
            {
                var report = await _reportingService.GetCustomerReportAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer report");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export customer report to PDF
        /// </summary>
        [HttpGet("customers/export/pdf")]
        public async Task<IActionResult> ExportCustomerReportToPdf()
        {
            try
            {
                var report = await _reportingService.GetCustomerReportAsync();
                var pdfBytes = await _pdfExportService.ExportCustomerReportToPdfAsync(report);
                
                var fileName = $"Customer_Report_{DateTime.Now:yyyyMMdd}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting customer report to PDF");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export customer report to Excel
        /// </summary>
        [HttpGet("customers/export/excel")]
        public async Task<IActionResult> ExportCustomerReportToExcel()
        {
            try
            {
                var report = await _reportingService.GetCustomerReportAsync();
                var excelBytes = await _excelExportService.ExportCustomerReportToExcelAsync(report);
                
                var fileName = $"Customer_Report_{DateTime.Now:yyyyMMdd}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting customer report to Excel");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get product performance report
        /// </summary>
        [HttpGet("product-performance")]
        public async Task<ActionResult<ProductPerformanceReportDto>> GetProductPerformanceReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetProductPerformanceReportAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product performance report");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export product performance report to PDF
        /// </summary>
        [HttpGet("product-performance/export/pdf")]
        public async Task<IActionResult> ExportProductPerformanceReportToPdf(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetProductPerformanceReportAsync(startDate, endDate);
                var pdfBytes = await _pdfExportService.ExportProductPerformanceReportToPdfAsync(report, startDate, endDate);
                
                var fileName = $"Product_Performance_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting product performance report to PDF");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Export product performance report to Excel
        /// </summary>
        [HttpGet("product-performance/export/excel")]
        public async Task<IActionResult> ExportProductPerformanceReportToExcel(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportingService.GetProductPerformanceReportAsync(startDate, endDate);
                var excelBytes = await _excelExportService.ExportProductPerformanceReportToExcelAsync(report, startDate, endDate);
                
                var fileName = $"Product_Performance_Report_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting product performance report to Excel");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
