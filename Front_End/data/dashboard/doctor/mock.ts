import type {
  DashboardStat,
  DoctorDashboardData,
  TodayAppointmentItem,
  VisitsChartData,
  VisitsChartPoint,
} from "@/types/dashboard";
import type { PatientSummary } from "@/types/patient";

/**
 * Synthetic development data only. Never put real patient data here.
 *
 * Dates are built from `now` so "today" is always today. `now` is passed in
 * (instead of calling `new Date()` here) so the caller decides where the
 * current time comes from, which keeps this file pure and easy to replace
 * with the real API later.
 */

function atTime(now: Date, hours: number, minutes = 0): string {
  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function daysAgo(now: Date, days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function buildTodayAppointments(now: Date): TodayAppointmentItem[] {
  return [
    {
      id: "apt-1001",
      startAt: atTime(now, 10, 0),
      patientName: "منى سعيد",
      reason: "متابعة ضغط",
      status: "confirmed",
    },
    {
      id: "apt-1002",
      startAt: atTime(now, 10, 30),
      patientName: "كريم عادل",
      reason: "كشف جديد",
      status: "scheduled",
    },
    {
      id: "apt-1003",
      startAt: atTime(now, 11, 0),
      patientName: "هالة يوسف",
      reason: "نتيجة تحاليل",
      status: "completed",
    },
    {
      id: "apt-1004",
      startAt: atTime(now, 12, 0),
      patientName: "أحمد فتحي",
      reason: "متابعة",
      status: "scheduled",
    },
  ];
}

function buildRecentPatients(now: Date): PatientSummary[] {
  return [
    {
      id: "PT-0148",
      fullName: "سعاد محمود حسن",
      dateOfBirth: "1972-03-14",
      gender: "female",
      phone: "0100 555 0148",
      lastVisitAt: daysAgo(now, 40),
    },
    {
      id: "PT-0152",
      fullName: "منى سعيد",
      dateOfBirth: "1985-06-02",
      gender: "female",
      phone: "0100 555 0152",
      lastVisitAt: daysAgo(now, 12),
    },
    {
      id: "PT-0171",
      fullName: "كريم عادل",
      dateOfBirth: "1993-09-20",
      gender: "male",
      phone: "0111 555 0171",
      // No previous visit: first appointment is today.
    },
    {
      id: "PT-0189",
      fullName: "هالة يوسف",
      dateOfBirth: "1964-01-30",
      gender: "female",
      phone: "0122 555 0189",
      lastVisitAt: daysAgo(now, 19),
    },
  ];
}

function buildVisits(now: Date): VisitsChartData {
  // Last 5 days, ending today. The values add up to the weekly total (23).
  const week: VisitsChartPoint[] = [3, 6, 4, 5, 5].map((value, index) => ({
    date: daysAgo(now, 4 - index),
    value,
  }));

  // Last 4 weeks, each point is the first day of that week.
  const fourWeeks: VisitsChartPoint[] = [19, 27, 21, 23].map(
    (value, index) => ({
      date: daysAgo(now, 27 - index * 7),
      value,
    }),
  );

  return { week, fourWeeks };
}

export function createDoctorDashboardMock(now: Date): DoctorDashboardData {
  const todayAppointments = buildTodayAppointments(now);
  const visits = buildVisits(now);

  const stats: DashboardStat[] = [
    {
      key: "totalPatients",
      value: 128,
      trend: [96, 101, 107, 112, 118, 123, 128],
    },
    {
      key: "weeklyVisits",
      value: visits.week.reduce((sum, point) => sum + point.value, 0),
      trend: [5, 3, 6, 4, 7, 5, 6],
    },
    {
      key: "todayAppointments",
      value: todayAppointments.length,
      trend: [2, 3, 3, 4, 3, 4, 4],
    },
    {
      key: "newRecords",
      value: 9,
      trend: [1, 2, 2, 4, 3, 5, 6],
    },
  ];

  return {
    stats,
    pendingCount: todayAppointments.filter((a) => a.status === "scheduled")
      .length,
    visits,
    todayAppointments,
    recentPatients: buildRecentPatients(now),
  };
}

