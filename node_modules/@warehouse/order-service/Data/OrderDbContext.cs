using Microsoft.EntityFrameworkCore;
using OrderService.Models;

namespace OrderService.Data;

public class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options)
    {
    }

    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Order entity
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TaxAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ShippingAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Notes).HasMaxLength(500);
            
            // Shipping address
            entity.Property(e => e.ShippingAddress).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ShippingCity).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ShippingPostalCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ShippingCountry).IsRequired().HasMaxLength(100);
            
            // Billing address
            entity.Property(e => e.BillingAddress).IsRequired().HasMaxLength(200);
            entity.Property(e => e.BillingCity).IsRequired().HasMaxLength(100);
            entity.Property(e => e.BillingPostalCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.BillingCountry).IsRequired().HasMaxLength(100);
            
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Create unique index on OrderNumber
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            
            // Create indexes for performance
            entity.HasIndex(e => e.CustomerId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.OrderDate);
            entity.HasIndex(e => e.CreatedAt);
        });

        // Configure OrderItem entity
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SKU).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
            
            // Configure relationship
            entity.HasOne(e => e.Order)
                  .WithMany(o => o.OrderItems)
                  .HasForeignKey(e => e.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Create indexes
            entity.HasIndex(e => e.ProductId);
            entity.HasIndex(e => e.SKU);
        });

        // Seed data
        modelBuilder.Entity<Order>().HasData(
            new Order
            {
                Id = 1,
                OrderNumber = "ORD-001",
                CustomerId = 1,
                Status = OrderStatus.PENDING,
                TotalAmount = 129.99m,
                SubTotal = 99.99m,
                TaxAmount = 10.00m,
                ShippingAmount = 20.00m,
                DiscountAmount = 0.00m,
                ShippingAddress = "123 Main St",
                ShippingCity = "New York",
                ShippingPostalCode = "10001",
                ShippingCountry = "USA",
                BillingAddress = "123 Main St",
                BillingCity = "New York",
                BillingPostalCode = "10001",
                BillingCountry = "USA",
                OrderDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        modelBuilder.Entity<OrderItem>().HasData(
            new OrderItem
            {
                Id = 1,
                OrderId = 1,
                ProductId = 1,
                SKU = "SAMPLE-001",
                ProductName = "Sample Product",
                Quantity = 1,
                UnitPrice = 99.99m,
                DiscountAmount = 0.00m,
                TotalPrice = 99.99m
            }
        );
    }
}
