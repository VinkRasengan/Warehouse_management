using Microsoft.EntityFrameworkCore;
using InventoryService.Models;

namespace InventoryService.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options)
    {
    }

    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<StockMovement> StockMovements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure InventoryItem entity
        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SKU).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.LastUpdated).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Create unique index on ProductId
            entity.HasIndex(e => e.ProductId).IsUnique();
            
            // Create index on SKU
            entity.HasIndex(e => e.SKU);
            
            // Create index on Location
            entity.HasIndex(e => e.Location);
        });

        // Configure StockMovement entity
        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MovementType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Reason).HasMaxLength(200);
            entity.Property(e => e.Reference).HasMaxLength(50);
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            // Configure relationship
            entity.HasOne(e => e.InventoryItem)
                  .WithMany(i => i.StockMovements)
                  .HasForeignKey(e => e.InventoryItemId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            // Create index on MovementType
            entity.HasIndex(e => e.MovementType);
            
            // Create index on CreatedAt for performance
            entity.HasIndex(e => e.CreatedAt);
            
            // Create index on Reference
            entity.HasIndex(e => e.Reference);
        });

        // Seed data
        modelBuilder.Entity<InventoryItem>().HasData(
            new InventoryItem
            {
                Id = 1,
                ProductId = 1,
                SKU = "SAMPLE-001",
                Quantity = 100,
                ReservedQuantity = 0,
                MinimumStock = 10,
                MaximumStock = 500,
                Location = "A1-B2-C3",
                CreatedAt = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow
            }
        );

        modelBuilder.Entity<StockMovement>().HasData(
            new StockMovement
            {
                Id = 1,
                InventoryItemId = 1,
                MovementType = MovementTypes.IN,
                Quantity = 100,
                PreviousQuantity = 0,
                NewQuantity = 100,
                Reason = "Initial stock",
                Reference = "INIT-001",
                CreatedBy = "System",
                CreatedAt = DateTime.UtcNow
            }
        );
    }
}
