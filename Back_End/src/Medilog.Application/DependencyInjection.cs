using FluentValidation;
using Medilog.Application.DTOs.Appointments;
using Medilog.Application.DTOs.Auth;
using Medilog.Application.DTOs.Patients;
using Medilog.Application.Services;
using Medilog.Application.Validators;
using Microsoft.Extensions.DependencyInjection;

namespace Medilog.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<AuthService>();
        services.AddScoped<PatientService>();
        services.AddScoped<AppointmentService>();
        services.AddScoped<DashboardService>();

        services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();

        services.AddScoped<IValidator<CreatePatientRequest>, CreatePatientRequestValidator>();
        services.AddScoped<IValidator<UpdatePatientRequest>, UpdatePatientRequestValidator>();
        services.AddScoped<IValidator<PatientSearchQuery>, PatientSearchQueryValidator>();

        services.AddScoped<IValidator<CreateAppointmentRequest>, CreateAppointmentRequestValidator>();
        services.AddScoped<IValidator<UpdateAppointmentRequest>, UpdateAppointmentRequestValidator>();
        services.AddScoped<IValidator<UpdateAppointmentStatusRequest>, UpdateAppointmentStatusRequestValidator>();
        services.AddScoped<IValidator<LinkVisitRequest>, LinkVisitRequestValidator>();
        services.AddScoped<IValidator<AppointmentQuery>, AppointmentQueryValidator>();

        return services;
    }
}
