# Secretary role & authorization (Member 5)

## Authentication contract (to be provided by the auth implementation)
- Register an authentication scheme (e.g. JWT bearer) so `HttpContext.User` is populated. This folder never issues tokens.
- User id claim: `ClaimTypes.NameIdentifier` or `sub` = `Doctor.DoctorId` / `Secretary.SecretaryId` / admin id (GUID).
- Role claim: `ClaimTypes.Role` or `role` = `Doctor` | `Secretary` | `Admin` (case-insensitive).
- Secretary assignments and Active status are read from the database on every request, never from claims.

## How other members must use it
- Medical-record endpoints (visits, diagnoses, medications/prescriptions, allergies, chronic conditions, vital signs,
  lab results, notes, documents, timeline): `.RequireMedicalRecordAccess()` / `[Authorize(Policy = MedilogPolicies.MedicalRecords)]`.
- Appointment and basic-patient endpoints: `.RequireSchedulingAccess()`, then call `IResourceAccessService`
  (`GetAccessibleDoctorIdsAsync` to filter lists, `CanAccessDoctorScheduleAsync` before create/reschedule,
  `CanAccessAppointmentAsync`, `CanAccessPatientBasicInfoAsync` for single resources).
  Return 404 when it yields false so the existence of other doctors' resources is not revealed.
- Build `ICurrentUser` with `new ClaimsPrincipalCurrentUser(httpContext.User)`.
