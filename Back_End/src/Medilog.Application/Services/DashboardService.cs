using Medilog.Application.Common.Exceptions;
using Medilog.Application.Common.Interfaces;
using Medilog.Application.DTOs.Dashboard;
using Medilog.Application.Mappings;
using Medilog.Domain.Common;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;

namespace Medilog.Application.Services;

public sealed class DashboardService(
    IPatientRepository patients,
    IAppointmentRepository appointments,
    IVisitRepository visits,
    IClock clock,
    ILanguageContext language,
    ISystemSettings settings)
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken)
    {
        var now = clock.UtcNow;
        var today = ClinicTime.Today(now);
        var weekStart = ClinicTime.StartOfWeek(today);
        var weekEnd = weekStart.AddDays(7);

        var rangeStart = today.AddDays(-6);
        var rangeFromUtc = ClinicTime.StartOfDayUtc(rangeStart);
        var rangeToUtc = ClinicTime.EndOfDayUtc(today);

        var totalPatients = await patients.CountAsync(cancellationToken);
        var creationDates = await patients.GetCreationDatesAsync(cancellationToken);
        var recentPatients = await patients.GetRecentAsync(5, cancellationToken);

        var rangeVisits = await visits.GetAsync(rangeFromUtc, rangeToUtc, cancellationToken);
        var weekVisits = (await visits.GetAsync(
            ClinicTime.StartOfDayUtc(weekStart),
            ClinicTime.StartOfDayUtc(weekEnd),
            cancellationToken)).Count;

        var todayAppointments = await appointments.GetAsync(
            ClinicTime.StartOfDayUtc(today),
            ClinicTime.EndOfDayUtc(today),
            null,
            cancellationToken);

        var rangeAppointments = await appointments.GetAsync(
            rangeFromUtc,
            rangeToUtc,
            null,
            cancellationToken);

        var visitTrend = BuildDailyTrend(rangeStart, rangeVisits, visit => ClinicTime.Today(visit.VisitedAt));
        var appointmentTrend = BuildDailyTrend(rangeStart, rangeAppointments, item => ClinicTime.Today(item.StartsAt));
        var newRecordTrend = BuildDailyTrend(rangeStart, creationDates, createdAt => ClinicTime.Today(createdAt));

        var totalPatientsTrend = new List<int>(7);
        for (var day = rangeStart; day <= today; day = day.AddDays(1))
        {
            var end = ClinicTime.EndOfDayUtc(day);
            totalPatientsTrend.Add(creationDates.Count(createdAt => createdAt < end));
        }

        // The last 7 days always cover the current clinic week, but compute the
        // weekly sparkline from the week query for clarity.
        var allWeekVisits = await visits.GetAsync(
            ClinicTime.StartOfDayUtc(weekStart),
            ClinicTime.StartOfDayUtc(weekEnd),
            cancellationToken);
        var weeklyTrend = Enumerable.Range(0, 7)
            .Select(offset =>
            {
                var day = weekStart.AddDays(offset);
                return allWeekVisits.Count(visit => ClinicTime.Today(visit.VisitedAt) == day);
            })
            .ToList();

        var stats = new List<DashboardStatDto>
        {
            new("totalPatients", totalPatients, totalPatientsTrend),
            new("weeklyVisits", weekVisits, weeklyTrend),
            new("todayAppointments", todayAppointments.Count, appointmentTrend),
            new("newRecords", newRecordTrend.Sum(), newRecordTrend)
        };

        return new DashboardSummaryDto(
            stats,
            todayAppointments.Count(item => item.Status == AppointmentStatus.Scheduled),
            todayAppointments.Select(item => item.ToTodayDto(language)).ToArray(),
            recentPatients.Select(item => item.ToListItem(language, now)).ToArray(),
            settings.DemoMode);
    }

    public async Task<VisitsDto> GetVisitsAsync(string range, CancellationToken cancellationToken)
    {
        var normalized = range.Trim().ToLowerInvariant();
        if (normalized is not ("week" or "4weeks"))
        {
            throw new BadRequestException("Range must be 'week' or '4weeks'.", "range_invalid");
        }

        var today = ClinicTime.Today(clock.UtcNow);
        var currentWeekStart = ClinicTime.StartOfWeek(today);

        if (normalized == "week")
        {
            var points = Enumerable.Range(0, 7)
                .Select(offset => new VisitsPointDto(currentWeekStart.AddDays(offset), 0))
                .ToList();

            var weekVisits = await visits.GetAsync(
                ClinicTime.StartOfDayUtc(currentWeekStart),
                ClinicTime.StartOfDayUtc(currentWeekStart.AddDays(7)),
                cancellationToken);

            foreach (var visit in weekVisits)
            {
                var day = ClinicTime.Today(visit.VisitedAt);
                var index = (day.DayNumber - currentWeekStart.DayNumber);
                if (index is >= 0 and < 7)
                {
                    points[index] = points[index] with { Value = points[index].Value + 1 };
                }
            }

            return new VisitsDto("week", points);
        }

        var firstWeekStart = currentWeekStart.AddDays(-21);
        var fourWeekVisits = await visits.GetAsync(
            ClinicTime.StartOfDayUtc(firstWeekStart),
            ClinicTime.StartOfDayUtc(currentWeekStart.AddDays(7)),
            cancellationToken);

        var fourWeekPoints = Enumerable.Range(0, 4)
            .Select(offset =>
            {
                var weekStart = firstWeekStart.AddDays(offset * 7);
                var weekEnd = weekStart.AddDays(7);
                var value = fourWeekVisits.Count(visit =>
                {
                    var day = ClinicTime.Today(visit.VisitedAt);
                    return day >= weekStart && day < weekEnd;
                });
                return new VisitsPointDto(weekStart, value);
            })
            .ToList();

        return new VisitsDto("4weeks", fourWeekPoints);
    }

    private static List<int> BuildDailyTrend<T>(
        DateOnly start,
        IReadOnlyList<T> items,
        Func<T, DateOnly> dateSelector)
    {
        var trend = new List<int>(7);
        for (var offset = 0; offset < 7; offset++)
        {
            var day = start.AddDays(offset);
            trend.Add(items.Count(item => dateSelector(item) == day));
        }

        return trend;
    }
}
