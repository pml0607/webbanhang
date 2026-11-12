using Microsoft.EntityFrameworkCore;
using Prometheus;
using WebBanHang.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Configure EF Core with SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

// Auto create database and seed data with retry on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var dbContext = services.GetRequiredService<AppDbContext>();

    for (int attempt = 1; attempt <= 12; attempt++)
    {
        try
        {
            dbContext.Database.EnsureCreated();
            logger.LogInformation("Database connected and initialized successfully.");
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning("Waiting for SQL Server... Attempt {Attempt}/12. Error: {Message}", attempt, ex.Message);
            if (attempt == 12)
            {
                logger.LogError(ex, "Failed to connect to SQL Server after multiple attempts.");
            }
            else
            {
                Thread.Sleep(3000);
            }
        }
    }
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseRouting();

// Export Prometheus metrics
app.UseHttpMetrics();
app.MapMetrics();

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllers();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();
