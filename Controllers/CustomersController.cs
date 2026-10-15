using Microsoft.AspNetCore.Mvc;

namespace WebBanHang.Controllers;

public class CustomersController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
