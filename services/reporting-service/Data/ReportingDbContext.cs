using Microsoft.EntityFrameworkCore;
using ReportingService.Models;

namespace ReportingService.Data
{
    public class ReportingDbContext : DbContext
    {
        public ReportingDbContext(DbContextOptions<ReportingDbContext> options) : base(options)
        {
        }

        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportSchedule> ReportSchedules { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Report entity
            modelBuilder.Entity<Report>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Parameters).HasColumnType("text");
                entity.Property(e => e.Data).HasColumnType("text");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.CreatedBy);
            });

            // Configure ReportSchedule entity
            modelBuilder.Entity<ReportSchedule>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.ReportType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CronExpression).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Parameters).HasColumnType("text");
                entity.Property(e => e.Recipients).HasColumnType("text");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.NextRunTime);
                entity.HasIndex(e => e.ReportType);
            });

            // Seed data
            modelBuilder.Entity<ReportSchedule>().HasData(
                new ReportSchedule
                {
                    Id = 1,
                    Name = "Daily Sales Report",
                    ReportType = "SALES",
                    CronExpression = "0 8 * * *", // Daily at 8 AM
                    Parameters = "{\"period\":\"daily\"}",
                    Recipients = "[\"manager@warehouse.com\",\"sales@warehouse.com\"]",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System",
                    NextRunTime = DateTime.UtcNow.AddDays(1).Date.AddHours(8)
                },
                new ReportSchedule
                {
                    Id = 2,
                    Name = "Weekly Inventory Report",
                    ReportType = "INVENTORY",
                    CronExpression = "0 9 * * 1", // Weekly on Monday at 9 AM
                    Parameters = "{\"includeOutOfStock\":true}",
                    Recipients = "[\"inventory@warehouse.com\",\"manager@warehouse.com\"]",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System",
                    NextRunTime = DateTime.UtcNow.AddDays(7).Date.AddHours(9)
                }
            );
        }
    }
}
