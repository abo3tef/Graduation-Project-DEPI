using Medilog.Application.Common.Text;
using Medilog.Domain.Common;

namespace Medilog.Application.Tests;

public class TextNormalizerTests
{
    [Theory]
    [InlineData("٠١٠٠١٢٣٤٥٦٧", "01001234567")]
    [InlineData("۰۱۰۰۱۲۳۴۵۶۷", "01001234567")]
    [InlineData("0100 123 4567", "01001234567")]
    [InlineData("+20 100 123 4567", "01001234567")]
    [InlineData("0020-100-123-4567", "01001234567")]
    [InlineData("(010) 0123-4567", "01001234567")]
    public void NormalizePhone_ReturnsExpectedDigits(string input, string expected)
    {
        Assert.Equal(expected, TextNormalizer.NormalizePhone(input));
    }

    [Fact]
    public void NormalizePhone_ReturnsEmptyForBlankInput()
    {
        Assert.Equal(string.Empty, TextNormalizer.NormalizePhone("   "));
    }

    [Fact]
    public void NormalizeDigits_LeavesLatinTextUntouched()
    {
        Assert.Equal("PT-1042", TextNormalizer.NormalizeDigits("PT-1042"));
    }

    [Fact]
    public void CalculateAge_AccountsForUpcomingBirthday()
    {
        var utcNow = ClinicTime.StartOfDayUtc(new DateOnly(2026, 10, 29)).AddHours(12);

        Assert.Equal(30, TextNormalizer.CalculateAge(new DateOnly(1996, 1, 1), utcNow));
        Assert.Equal(31, TextNormalizer.CalculateAge(new DateOnly(1995, 10, 1), utcNow));
    }

    [Fact]
    public void CalculateAge_ClampsFutureBirthDatesToZero()
    {
        var utcNow = ClinicTime.StartOfDayUtc(new DateOnly(2026, 10, 29)).AddHours(12);
        Assert.Equal(0, TextNormalizer.CalculateAge(new DateOnly(2030, 1, 1), utcNow));
    }
}
