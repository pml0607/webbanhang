using Microsoft.AspNetCore.Mvc;

namespace WebBanHang.Controllers;

public class ProductsController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
