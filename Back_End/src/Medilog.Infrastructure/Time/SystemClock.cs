using Medilog.Application.Common.Interfaces;

namespace Medilog.Infrastructure.Time;

public sealed class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}
