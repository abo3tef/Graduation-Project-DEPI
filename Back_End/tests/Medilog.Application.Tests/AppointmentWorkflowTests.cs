using Medilog.Domain.Entities;
using Medilog.Domain.Enums;

namespace Medilog.Application.Tests;

public class AppointmentWorkflowTests
{
    [Theory]
    [InlineData(AppointmentStatus.Scheduled, AppointmentStatus.Confirmed)]
    [InlineData(AppointmentStatus.Scheduled, AppointmentStatus.Cancelled)]
    [InlineData(AppointmentStatus.Scheduled, AppointmentStatus.NoShow)]
    [InlineData(AppointmentStatus.Confirmed, AppointmentStatus.Completed)]
    [InlineData(AppointmentStatus.Confirmed, AppointmentStatus.Cancelled)]
    [InlineData(AppointmentStatus.Confirmed, AppointmentStatus.NoShow)]
    public void CanTransition_AllowsDocumentedTransitions(AppointmentStatus current, AppointmentStatus next)
    {
        Assert.True(AppointmentWorkflow.CanTransition(current, next));
    }

    [Theory]
    [InlineData(AppointmentStatus.Scheduled, AppointmentStatus.Completed)]
    [InlineData(AppointmentStatus.Completed, AppointmentStatus.Confirmed)]
    [InlineData(AppointmentStatus.Cancelled, AppointmentStatus.Scheduled)]
    [InlineData(AppointmentStatus.NoShow, AppointmentStatus.Confirmed)]
    public void CanTransition_RejectsClosedOrSkippedTransitions(AppointmentStatus current, AppointmentStatus next)
    {
        Assert.False(AppointmentWorkflow.CanTransition(current, next));
    }

    [Fact]
    public void NextStatuses_IsEmptyForClosedAppointments()
    {
        Assert.Empty(AppointmentWorkflow.NextStatuses(AppointmentStatus.Completed));
        Assert.Empty(AppointmentWorkflow.NextStatuses(AppointmentStatus.Cancelled));
        Assert.Empty(AppointmentWorkflow.NextStatuses(AppointmentStatus.NoShow));
    }
}
