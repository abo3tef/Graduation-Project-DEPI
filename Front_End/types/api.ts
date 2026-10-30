import type { AppointmentStatus } from "@/constants/appointment";
import type { UserRole } from "@/constants/roles";

/** Shapes returned by the Medilog .NET API (camelCase JSON). */

export type Gender = "female" | "male" | "unspecified";

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string | null;
  specialization: string | null;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserDto;
}

export interface PatientListItem {
  id: string;
  code: string;
  fullName: string;
  phone: string | null;
  birthDate: string;
  gender: Gender;
  age: number;
  lastVisitAt: string | null;
}

export interface PatientDetail extends PatientListItem {
  notes: string | null;
  createdAt: string;
  address: string | null;
  emergencyContact: string | null;
  doctorId: string;
  /** The name exactly as stored; ullName is the localized display name. Edit forms use this one. */
  name: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type PatientSort =
  | "lastVisit_desc"
  | "lastVisit_asc"
  | "name_asc"
  | "name_desc"
  | "code_asc"
  | "code_desc"
  | "age_asc"
  | "age_desc";

export interface PatientSearchParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: PatientSort;
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
}

export interface PatientOption {
  id: string;
  code: string;
  fullName: string;
  phone: string | null;
}

export interface DashboardStat {
  key: string;
  value: number;
  trend: number[];
}

export interface TodayAppointment {
  id: string;
  startsAt: string;
  patientName: string;
  reason: string;
  status: AppointmentStatus;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  pendingCount: number;
  todayAppointments: TodayAppointment[];
  recentPatients: PatientListItem[];
  demoMode: boolean;
}

export type VisitsRange = "week" | "4weeks";

export interface VisitsPoint {
  date: string;
  value: number;
}

export interface VisitsResponse {
  range: VisitsRange;
  points: VisitsPoint[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientCode: string;
  patientName: string;
  startsAt: string;
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  doctorName: string;
  notes: string | null;
  cancellationReason: string | null;
  visitId: string | null;
}

export interface AppointmentQuery {
  date?: string;
  from?: string;
  to?: string;
  patientId?: string;
}

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
  codes?: Record<string, string[]>;
  traceId?: string;
}
