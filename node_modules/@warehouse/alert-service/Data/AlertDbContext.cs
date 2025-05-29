using Microsoft.EntityFrameworkCore;
using AlertService.Models;

namespace AlertService.Data
{
    public class AlertDbContext : DbContext
    {
        public AlertDbContext(DbContextOptions<AlertDbContext> options) : base(options)
        {
        }

        public DbSet<Alert> Alerts { get; set; }
        public DbSet<AlertRule> AlertRules { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Alert entity
            modelBuilder.Entity<Alert>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Severity).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Source).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Severity);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.IsResolved);
            });

            // Configure AlertRule entity
            modelBuilder.Entity<AlertRule>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Condition).IsRequired().HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsActive);
            });

            // Seed data
            modelBuilder.Entity<AlertRule>().HasData(
                new AlertRule
                {
                    Id = 1,
                    Name = "Low Inventory Alert",
                    Type = "INVENTORY",
                    Condition = "stock_quantity < minimum_threshold",
                    Severity = "HIGH",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                },
                new AlertRule
                {
                    Id = 2,
                    Name = "Failed Payment Alert",
                    Type = "PAYMENT",
                    Condition = "payment_status = 'FAILED'",
                    Severity = "MEDIUM",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                }
            );
        }
    }
}
