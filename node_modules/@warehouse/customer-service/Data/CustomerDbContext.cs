using Microsoft.EntityFrameworkCore;
using CustomerService.Models;

namespace CustomerService.Data;

public class CustomerDbContext : DbContext
{
    public CustomerDbContext(DbContextOptions<CustomerDbContext> options) : base(options)
    {
    }

    public DbSet<Customer> Customers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Customer entity
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Address).HasMaxLength(200);
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.PostalCode).HasMaxLength(20);
            entity.Property(e => e.Country).HasMaxLength(100);
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.CustomerType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Create unique index on Email
            entity.HasIndex(e => e.Email).IsUnique();
            
            // Create indexes for performance
            entity.HasIndex(e => e.CustomerType);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.FirstName, e.LastName });
        });

        // Seed data
        modelBuilder.Entity<Customer>().HasData(
            new Customer
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Phone = "+1234567890",
                Address = "123 Main St",
                City = "New York",
                PostalCode = "10001",
                Country = "USA",
                Gender = "Male",
                IsActive = true,
                LoyaltyPoints = 100,
                CustomerType = CustomerTypes.REGULAR,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
    }
}
