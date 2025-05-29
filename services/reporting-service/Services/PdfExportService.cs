using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ReportingService.DTOs;

namespace ReportingService.Services
{
    public class PdfExportService : IPdfExportService
    {
        public async Task<byte[]> ExportRevenueReportToPdfAsync(RevenueReportDto report, DateTime startDate, DateTime endDate)
        {
            return await Task.Run(() =>
            {
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header()
                            .Text("Revenue Report")
                            .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                        page.Content()
                            .PaddingVertical(1, Unit.Centimetre)
                            .Column(x =>
                            {
                                x.Spacing(20);

                                // Report period
                                x.Item().Text($"Period: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}")
                                    .FontSize(14).SemiBold();

                                // Summary statistics
                                x.Item().Row(row =>
                                {
                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("Total Revenue").SemiBold();
                                        col.Item().Text($"{report.TotalRevenue:C}").FontSize(16).FontColor(Colors.Green.Medium);
                                    });

                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("Total Orders").SemiBold();
                                        col.Item().Text($"{report.TotalOrders}").FontSize(16);
                                    });

                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("Average Order Value").SemiBold();
                                        col.Item().Text($"{report.AverageOrderValue:C}").FontSize(16);
                                    });
                                });

                                // Daily revenue table
                                if (report.DailyRevenue?.Any() == true)
                                {
                                    x.Item().Text("Daily Revenue Breakdown").SemiBold().FontSize(16);
                                    x.Item().Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn();
                                            columns.RelativeColumn();
                                            columns.RelativeColumn();
                                        });

                                        table.Header(header =>
                                        {
                                            header.Cell().Element(CellStyle).Text("Date").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Revenue").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Orders").SemiBold();
                                        });

                                        foreach (var daily in report.DailyRevenue)
                                        {
                                            table.Cell().Element(CellStyle).Text(daily.Date.ToString("dd/MM/yyyy"));
                                            table.Cell().Element(CellStyle).Text($"{daily.Revenue:C}");
                                            table.Cell().Element(CellStyle).Text(daily.OrderCount.ToString());
                                        }
                                    });
                                }
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text(x =>
                            {
                                x.Span("Generated on ");
                                x.Span($"{DateTime.Now:dd/MM/yyyy HH:mm}").SemiBold();
                            });
                    });
                });

                return document.GeneratePdf();
            });
        }

        public async Task<byte[]> ExportSalesReportToPdfAsync(SalesReportDto report, DateTime startDate, DateTime endDate)
        {
            return await Task.Run(() =>
            {
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header()
                            .Text("Sales Report")
                            .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                        page.Content()
                            .PaddingVertical(1, Unit.Centimetre)
                            .Column(x =>
                            {
                                x.Spacing(20);

                                x.Item().Text($"Period: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}")
                                    .FontSize(14).SemiBold();

                                // Top products table
                                if (report.TopProducts?.Any() == true)
                                {
                                    x.Item().Text("Top Selling Products").SemiBold().FontSize(16);
                                    x.Item().Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(3);
                                            columns.RelativeColumn();
                                            columns.RelativeColumn();
                                        });

                                        table.Header(header =>
                                        {
                                            header.Cell().Element(CellStyle).Text("Product").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Quantity Sold").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Revenue").SemiBold();
                                        });

                                        foreach (var product in report.TopProducts.Take(10))
                                        {
                                            table.Cell().Element(CellStyle).Text(product.ProductName);
                                            table.Cell().Element(CellStyle).Text(product.QuantitySold.ToString());
                                            table.Cell().Element(CellStyle).Text($"{product.Revenue:C}");
                                        }
                                    });
                                }
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text($"Generated on {DateTime.Now:dd/MM/yyyy HH:mm}");
                    });
                });

                return document.GeneratePdf();
            });
        }

        public async Task<byte[]> ExportInventoryReportToPdfAsync(InventoryReportDto report)
        {
            return await Task.Run(() =>
            {
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header()
                            .Text("Inventory Report")
                            .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                        page.Content()
                            .PaddingVertical(1, Unit.Centimetre)
                            .Column(x =>
                            {
                                x.Spacing(20);

                                x.Item().Text($"Generated on: {DateTime.Now:dd/MM/yyyy HH:mm}")
                                    .FontSize(14).SemiBold();

                                // Summary
                                x.Item().Row(row =>
                                {
                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("Total Products").SemiBold();
                                        col.Item().Text($"{report.TotalProducts}").FontSize(16);
                                    });

                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("Total Stock Value").SemiBold();
                                        col.Item().Text($"{report.TotalStockValue:C}").FontSize(16).FontColor(Colors.Green.Medium);
                                    });

                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("Low Stock Items").SemiBold();
                                        col.Item().Text($"{report.LowStockItems}").FontSize(16).FontColor(Colors.Red.Medium);
                                    });
                                });

                                // Low stock products
                                if (report.LowStockProducts?.Any() == true)
                                {
                                    x.Item().Text("Low Stock Products").SemiBold().FontSize(16);
                                    x.Item().Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(3);
                                            columns.RelativeColumn();
                                            columns.RelativeColumn();
                                        });

                                        table.Header(header =>
                                        {
                                            header.Cell().Element(CellStyle).Text("Product").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Current Stock").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Min Stock").SemiBold();
                                        });

                                        foreach (var product in report.LowStockProducts)
                                        {
                                            table.Cell().Element(CellStyle).Text(product.ProductName);
                                            table.Cell().Element(CellStyle).Text(product.CurrentStock.ToString());
                                            table.Cell().Element(CellStyle).Text(product.MinStock.ToString());
                                        }
                                    });
                                }
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text($"Generated on {DateTime.Now:dd/MM/yyyy HH:mm}");
                    });
                });

                return document.GeneratePdf();
            });
        }

        public async Task<byte[]> ExportCustomerReportToPdfAsync(CustomerReportDto report)
        {
            return await Task.Run(() =>
            {
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header()
                            .Text("Customer Report")
                            .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                        page.Content()
                            .PaddingVertical(1, Unit.Centimetre)
                            .Column(x =>
                            {
                                x.Spacing(20);

                                // Summary
                                x.Item().Row(row =>
                                {
                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("Total Customers").SemiBold();
                                        col.Item().Text($"{report.TotalCustomers}").FontSize(16);
                                    });

                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("New Customers").SemiBold();
                                        col.Item().Text($"{report.NewCustomers}").FontSize(16).FontColor(Colors.Green.Medium);
                                    });

                                    row.RelativeItem().Column(col =>
                                    {
                                        col.Item().Text("VIP Customers").SemiBold();
                                        col.Item().Text($"{report.VipCustomers}").FontSize(16).FontColor(Colors.Orange.Medium);
                                    });
                                });

                                // Top customers
                                if (report.TopCustomers?.Any() == true)
                                {
                                    x.Item().Text("Top Customers by Revenue").SemiBold().FontSize(16);
                                    x.Item().Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(3);
                                            columns.RelativeColumn();
                                            columns.RelativeColumn();
                                        });

                                        table.Header(header =>
                                        {
                                            header.Cell().Element(CellStyle).Text("Customer").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Total Orders").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Total Spent").SemiBold();
                                        });

                                        foreach (var customer in report.TopCustomers.Take(10))
                                        {
                                            table.Cell().Element(CellStyle).Text(customer.CustomerName);
                                            table.Cell().Element(CellStyle).Text(customer.TotalOrders.ToString());
                                            table.Cell().Element(CellStyle).Text($"{customer.TotalSpent:C}");
                                        }
                                    });
                                }
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text($"Generated on {DateTime.Now:dd/MM/yyyy HH:mm}");
                    });
                });

                return document.GeneratePdf();
            });
        }

        public async Task<byte[]> ExportProductPerformanceReportToPdfAsync(ProductPerformanceReportDto report, DateTime startDate, DateTime endDate)
        {
            return await Task.Run(() =>
            {
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header()
                            .Text("Product Performance Report")
                            .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                        page.Content()
                            .PaddingVertical(1, Unit.Centimetre)
                            .Column(x =>
                            {
                                x.Spacing(20);

                                x.Item().Text($"Period: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}")
                                    .FontSize(14).SemiBold();

                                // Product performance table
                                if (report.ProductPerformances?.Any() == true)
                                {
                                    x.Item().Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(3);
                                            columns.RelativeColumn();
                                            columns.RelativeColumn();
                                            columns.RelativeColumn();
                                        });

                                        table.Header(header =>
                                        {
                                            header.Cell().Element(CellStyle).Text("Product").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Units Sold").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Revenue").SemiBold();
                                            header.Cell().Element(CellStyle).Text("Profit Margin").SemiBold();
                                        });

                                        foreach (var product in report.ProductPerformances)
                                        {
                                            table.Cell().Element(CellStyle).Text(product.ProductName);
                                            table.Cell().Element(CellStyle).Text(product.UnitsSold.ToString());
                                            table.Cell().Element(CellStyle).Text($"{product.Revenue:C}");
                                            table.Cell().Element(CellStyle).Text($"{product.ProfitMargin:P}");
                                        }
                                    });
                                }
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text($"Generated on {DateTime.Now:dd/MM/yyyy HH:mm}");
                    });
                });

                return document.GeneratePdf();
            });
        }

        private static IContainer CellStyle(IContainer container)
        {
            return container.DefaultTextStyle(x => x.FontSize(10)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
        }
    }
}
