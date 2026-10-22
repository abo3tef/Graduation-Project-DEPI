import type { Appointment } from "@/types/appointment";
import type { PatientSummary } from "@/types/patient";

export const DASHBOARD_STAT_KEYS = [
  "totalPatients",
  "weeklyVisits",
  "todayAppointments",
  "newRecords",
] as const;

export type DashboardStatKey = (typeof DASHBOARD_STAT_KEYS)[number];

export interface DashboardStat {
  key: DashboardStatKey;
  value: number;
  /** Small series used to draw the sparkline inside the stat card. */
  trend: number[];
}

export const VISITS_RANGES = ["week", "fourWeeks"] as const;

export type VisitsRange = (typeof VISITS_RANGES)[number];

export interface VisitsChartPoint {
  /** ISO date. The UI formats it per locale (weekday name or week start). */
  date: string;
  value: number;
}

export type VisitsChartData = Record<VisitsRange, VisitsChartPoint[]>;

/**
 * Summary shape of an appointment for the "today" list.
 * Only appointment and basic patient data, no medical details.
 */
export type TodayAppointmentItem = Pick<
  Appointment,
  "id" | "startAt" | "reason" | "status"
> & {
  patientName: string;
};

export interface DoctorDashboardData {
  stats: DashboardStat[];
  /** Appointments still in "scheduled" status, shown in the top banner. */
  pendingCount: number;
  visits: VisitsChartData;
  todayAppointments: TodayAppointmentItem[];
  recentPatients: PatientSummary[];
}

