using Microsoft.EntityFrameworkCore;
using NotificationService.Models;

namespace NotificationService.Data
{
    public class NotificationDbContext : DbContext
    {
        public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
        {
        }

        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotificationTemplate> NotificationTemplates { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Notification entity
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Recipient).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Message).IsRequired();
                entity.Property(e => e.TemplateId).HasMaxLength(100);
                entity.Property(e => e.ExternalId).HasMaxLength(200);
                entity.Property(e => e.RelatedEntityType).HasMaxLength(100);
                entity.Property(e => e.ErrorMessage).HasMaxLength(1000);

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ScheduledAt);
                entity.HasIndex(e => e.Priority);
                entity.HasIndex(e => new { e.RelatedEntityType, e.RelatedEntityId });
            });

            // Configure NotificationTemplate entity
            modelBuilder.Entity<NotificationTemplate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Body).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(1000);

                entity.HasIndex(e => e.Code).IsUnique();
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsActive);
            });

            // Seed default templates
            modelBuilder.Entity<NotificationTemplate>().HasData(
                new NotificationTemplate
                {
                    Id = 1,
                    Name = "Order Confirmation",
                    Code = "ORDER_CONFIRMATION",
                    Type = NotificationType.Email,
                    Subject = "Order Confirmation - #{OrderId}",
                    Body = "Dear {CustomerName},\n\nYour order #{OrderId} has been confirmed.\nTotal Amount: {TotalAmount}\n\nThank you for your business!",
                    Description = "Email sent when an order is confirmed",
                    Variables = "[\"CustomerName\", \"OrderId\", \"TotalAmount\"]"
                },
                new NotificationTemplate
                {
                    Id = 2,
                    Name = "Low Inventory Alert",
                    Code = "LOW_INVENTORY_ALERT",
                    Type = NotificationType.Email,
                    Subject = "Low Inventory Alert - {ProductName}",
                    Body = "Alert: Product {ProductName} (SKU: {ProductSku}) is running low.\nCurrent Stock: {CurrentStock}\nMinimum Threshold: {MinimumThreshold}",
                    Description = "Email sent when inventory is below threshold",
                    Variables = "[\"ProductName\", \"ProductSku\", \"CurrentStock\", \"MinimumThreshold\"]"
                },
                new NotificationTemplate
                {
                    Id = 3,
                    Name = "Order Shipped",
                    Code = "ORDER_SHIPPED",
                    Type = NotificationType.SMS,
                    Subject = "Order Shipped",
                    Body = "Your order #{OrderId} has been shipped. Tracking: {TrackingNumber}",
                    Description = "SMS sent when an order is shipped",
                    Variables = "[\"OrderId\", \"TrackingNumber\"]"
                }
            );
        }
    }
}
