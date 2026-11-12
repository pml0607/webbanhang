using Microsoft.EntityFrameworkCore;

namespace WebBanHang.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed initial data
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Wireless headphones", Category = "Electronics", Price = 1250000, Stock = 12, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 2, Name = "Mechanical keyboard", Category = "Accessories", Price = 890000, Stock = 4, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 3, Name = "USB-C cable", Category = "Accessories", Price = 120000, Stock = 0, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 4, Name = "Gaming Mouse Wireless", Category = "Accessories", Price = 650000, Stock = 15, CreatedAt = new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 5, Name = "Monitor 27 inch 2K IPS", Category = "Electronics", Price = 4990000, Stock = 6, CreatedAt = new DateTime(2026, 1, 3, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Customer>().HasData(
            new Customer { Id = 1, Name = "Nguyen Minh Anh", Email = "minhanh@example.com", Phone = "0901234567", City = "Ho Chi Minh City", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Customer { Id = 2, Name = "Tran Quoc Bao", Email = "quocbao@example.com", Phone = "0912345678", City = "Da Nang", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Customer { Id = 3, Name = "Le Thi Mai", Email = "maile@example.com", Phone = "0987654321", City = "Ha Noi", CreatedAt = new DateTime(2026, 1, 2, 0, 0, 0, DateTimeKind.Utc) },
            new Customer { Id = 4, Name = "Hoang Van Nam", Email = "namhoang@example.com", Phone = "0971122334", City = "Can Tho", CreatedAt = new DateTime(2026, 1, 3, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Order>().HasData(
            new Order { Id = 1, Number = "ORD-1001", Customer = "Nguyen Minh Anh", Item = "Wireless headphones", Quantity = 1, UnitPrice = 1250000, Status = "Processing", CreatedAt = new DateTime(2026, 1, 10, 0, 0, 0, DateTimeKind.Utc) },
            new Order { Id = 2, Number = "ORD-1002", Customer = "Tran Quoc Bao", Item = "Mechanical keyboard", Quantity = 2, UnitPrice = 890000, Status = "Pending", CreatedAt = new DateTime(2026, 1, 11, 0, 0, 0, DateTimeKind.Utc) },
            new Order { Id = 3, Number = "ORD-1003", Customer = "Le Thi Mai", Item = "Monitor 27 inch 2K IPS", Quantity = 1, UnitPrice = 4990000, Status = "Shipped", CreatedAt = new DateTime(2026, 1, 12, 0, 0, 0, DateTimeKind.Utc) },
            new Order { Id = 4, Number = "ORD-1004", Customer = "Hoang Van Nam", Item = "USB-C cable", Quantity = 3, UnitPrice = 120000, Status = "Cancelled", CreatedAt = new DateTime(2026, 1, 13, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}

