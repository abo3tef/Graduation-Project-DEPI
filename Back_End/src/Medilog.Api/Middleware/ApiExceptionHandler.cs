using System.Diagnostics;
using System.Text.Json;
using Medilog.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using FluentValidation;

namespace Medilog.Api.Middleware;

public static class ProblemWriter
{
    public static async Task WriteAsync(
        HttpContext context,
        int statusCode,
        string title,
        string detail,
        string code,
        IReadOnlyDictionary<string, string[]>? errors = null,
        IReadOnlyDictionary<string, string[]>? codes = null)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = statusCode;
        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path,
            Type = $"https://httpstatuses.io/{statusCode}"
        };

        problem.Extensions["code"] = code;
        problem.Extensions["traceId"] = Activity.Current?.Id ?? context.TraceIdentifier;

        if (errors is not null)
        {
            problem.Extensions["errors"] = errors;
        }

        if (codes is not null)
        {
            problem.Extensions["codes"] = codes;
        }

        await context.Response.WriteAsJsonAsync(
            problem,
            new JsonSerializerOptions(JsonSerializerDefaults.Web),
            "application/problem+json");
    }
}

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        switch (exception)
        {
            case ValidationException validationException:
            {
                var errors = validationException.Errors
                    .GroupBy(error => ToCamelCase(error.PropertyName))
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(error => error.ErrorMessage).Distinct().ToArray());

                var codes = validationException.Errors
                    .GroupBy(error => ToCamelCase(error.PropertyName))
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(error => error.ErrorCode).Distinct().ToArray());

                await ProblemWriter.WriteAsync(
                    httpContext,
                    StatusCodes.Status400BadRequest,
                    "One or more validation errors occurred.",
                    "Please review the highlighted fields and try again.",
                    "validation_failed",
                    errors,
                    codes);
                return true;
            }
            case NotFoundException notFound:
                await ProblemWriter.WriteAsync(httpContext, StatusCodes.Status404NotFound, "Not found", notFound.Message, notFound.Code);
                return true;
            case ConflictException conflict:
                await ProblemWriter.WriteAsync(httpContext, StatusCodes.Status409Conflict, "Conflict", conflict.Message, conflict.Code);
                return true;
            case ForbiddenException forbidden:
                await ProblemWriter.WriteAsync(httpContext, StatusCodes.Status403Forbidden, "Forbidden", forbidden.Message, forbidden.Code);
                return true;
            case UnauthorizedException unauthorized:
                await ProblemWriter.WriteAsync(httpContext, StatusCodes.Status401Unauthorized, "Unauthorized", unauthorized.Message, unauthorized.Code);
                return true;
            case BadRequestException badRequest:
                await ProblemWriter.WriteAsync(httpContext, StatusCodes.Status400BadRequest, "Invalid request", badRequest.Message, badRequest.Code);
                return true;
            case BadHttpRequestException badHttpRequest:
                await ProblemWriter.WriteAsync(
                    httpContext,
                    StatusCodes.Status400BadRequest,
                    "Invalid request",
                    "The request body or parameters could not be read.",
                    "bad_request");
                logger.LogWarning(
                    "Bad request for {Method} {Path}: {Reason}",
                    httpContext.Request.Method,
                    httpContext.Request.Path,
                    badHttpRequest.Message);
                return true;
            case OperationCanceledException when httpContext.RequestAborted.IsCancellationRequested:
                return true;
            default:
                logger.LogError(
                    exception,
                    "Unhandled exception while processing {Method} {Path}",
                    httpContext.Request.Method,
                    httpContext.Request.Path);

                await ProblemWriter.WriteAsync(
                    httpContext,
                    StatusCodes.Status500InternalServerError,
                    "An unexpected error occurred",
                    "The server could not complete the request. Please try again.",
                    "server_error");
                return true;
        }
    }

    private static string ToCamelCase(string value) =>
        string.IsNullOrEmpty(value) ? value : char.ToLowerInvariant(value[0]) + value[1..];
}

public sealed class StatusCodeProblemMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        await next(context);

        if (context.Response.HasStarted
            || context.Response.ContentLength is > 0
            || context.Response.ContentType is not null)
        {
            return;
        }

        if (context.Response.StatusCode >= 400 && context.Response.StatusCode < 600)
        {
            await ProblemWriter.WriteAsync(
                context,
                context.Response.StatusCode,
                ReasonPhrases.GetReasonPhrase(context.Response.StatusCode),
                "The request could not be completed.",
                "http_error");
        }
    }
}
