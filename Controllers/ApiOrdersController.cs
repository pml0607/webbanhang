using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebBanHang.Models;

namespace WebBanHang.Controllers;

[ApiController]
[Route("api/orders")]
public class ApiOrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public ApiOrdersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        return await _context.Orders.OrderByDescending(o => o.Id).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();
        return order;
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(Order order)
    {
        order.Id = 0;
        if (string.IsNullOrWhiteSpace(order.Number))
        {
            var nextNum = await _context.Orders.AnyAsync() 
                ? await _context.Orders.MaxAsync(o => o.Id) + 1001 
                : 1001;
            order.Number = $"ORD-{nextNum}";
        }
        order.CreatedAt = DateTime.UtcNow;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(int id, Order order)
    {
        if (id != order.Id) return BadRequest();

        var existing = await _context.Orders.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Customer = order.Customer;
        existing.Item = order.Item;
        existing.Quantity = order.Quantity;
        existing.UnitPrice = order.UnitPrice;
        existing.Status = order.Status;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

