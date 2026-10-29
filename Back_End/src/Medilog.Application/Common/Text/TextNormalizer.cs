using Medilog.Domain.Common;

namespace Medilog.Application.Common.Text;

public static class TextNormalizer
{
    private static readonly char[] ArabicIndicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    private static readonly char[] EasternArabicDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    /// <summary>Normalizes Arabic-Indic and Eastern Arabic digits to Western digits.</summary>
    public static string NormalizeDigits(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return value;
        }

        var chars = value.ToCharArray();
        for (var index = 0; index < chars.Length; index++)
        {
            var arabic = Array.IndexOf(ArabicIndicDigits, chars[index]);
            if (arabic >= 0)
            {
                chars[index] = (char)('0' + arabic);
                continue;
            }

            var eastern = Array.IndexOf(EasternArabicDigits, chars[index]);
            if (eastern >= 0)
            {
                chars[index] = (char)('0' + eastern);
            }
        }

        return new string(chars);
    }

    /// <summary>Normalizes a phone number to digits only, keeping an optional leading +.</summary>
    public static string NormalizePhone(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = NormalizeDigits(value).Trim();
        var builder = new System.Text.StringBuilder(normalized.Length);
        foreach (var character in normalized)
        {
            if (char.IsDigit(character) || (character == '+' && builder.Length == 0))
            {
                builder.Append(character);
            }
        }

        var digits = builder.ToString();
        if (digits.StartsWith("0020", StringComparison.Ordinal))
        {
            digits = "0" + digits[4..];
        }
        else if (digits.StartsWith("+20", StringComparison.Ordinal))
        {
            digits = "0" + digits[3..];
        }

        return digits;
    }

    public static int CalculateAge(DateOnly birthDate, DateTime utcNow)
    {
        var today = ClinicTime.Today(utcNow);
        var age = today.Year - birthDate.Year;
        if (birthDate > today.AddYears(-age))
        {
            age--;
        }

        return Math.Max(0, age);
    }
}
