using System.ComponentModel.DataAnnotations;

namespace WebBanHang.Models;

public class Order
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Number { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Customer { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Item { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

