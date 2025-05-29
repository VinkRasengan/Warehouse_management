using Microsoft.EntityFrameworkCore;
using PaymentService.Models;

namespace PaymentService.Data
{
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
        {
        }

        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Payment entity
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.Property(e => e.Currency).HasMaxLength(3);
                entity.Property(e => e.PaymentProviderId).HasMaxLength(100);
                entity.Property(e => e.PaymentProviderTransactionId).HasMaxLength(200);
                entity.Property(e => e.CustomerEmail).HasMaxLength(255);
                entity.Property(e => e.CustomerPhone).HasMaxLength(20);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.FailureReason).HasMaxLength(1000);

                entity.HasIndex(e => e.TransactionId).IsUnique();
                entity.HasIndex(e => e.OrderId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure PaymentTransaction entity
            modelBuilder.Entity<PaymentTransaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.Property(e => e.ExternalTransactionId).HasMaxLength(200);
                entity.Property(e => e.Notes).HasMaxLength(1000);

                entity.HasIndex(e => e.PaymentId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);

                // Configure relationship
                entity.HasOne(e => e.Payment)
                      .WithMany(e => e.Transactions)
                      .HasForeignKey(e => e.PaymentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
