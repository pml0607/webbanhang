using Microsoft.AspNetCore.Mvc;

namespace WebBanHang.Controllers;

public class OrdersController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
