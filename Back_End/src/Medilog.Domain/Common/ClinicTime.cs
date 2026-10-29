namespace Medilog.Domain.Common;

/// <summary>
/// The clinic operates on Africa/Cairo wall time. Instants are stored in UTC and
/// only converted at the edges (API queries, seeding, display).
/// </summary>
public static class ClinicTime
{
    public static readonly TimeZoneInfo TimeZone = ResolveTimeZone();

    public static DateOnly Today(DateTime utcNow) =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcNow, DateTimeKind.Utc), TimeZone));

    public static DateTime StartOfDayUtc(DateOnly date)
    {
        var local = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(local, TimeZone);
    }

    public static DateTime EndOfDayUtc(DateOnly date) => StartOfDayUtc(date.AddDays(1));

    public static DateOnly StartOfWeek(DateOnly date) => date.AddDays(-(int)date.DayOfWeek);

    private static TimeZoneInfo ResolveTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Africa/Cairo");
        }
        catch (TimeZoneNotFoundException)
        {
            // Windows fallback if the IANA database is unavailable.
            return TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
        }
    }
}
