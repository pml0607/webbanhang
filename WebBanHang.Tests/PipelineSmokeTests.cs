using System.Globalization;

namespace WebBanHang.Tests;

[TestClass]
public sealed class PipelineSmokeTests
{
    [TestMethod]
    public void Addition_ReturnsExpectedTotal()
    {
        var actual = int.Parse("5", CultureInfo.InvariantCulture)
            + int.Parse("5", CultureInfo.InvariantCulture);

        Assert.AreEqual(10, actual);
    }
}
