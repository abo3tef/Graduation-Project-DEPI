import type { AppointmentStatus } from "@/constants/appointment";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  startAt: string;
  endAt: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  cancellationReason?: string;
}
