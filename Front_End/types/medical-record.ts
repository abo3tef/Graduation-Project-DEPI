export interface MedicalVisit {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  visitedAt: string;
  chiefComplaint: string;
  symptoms?: string;
  clinicalNotes?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperatureCelsius?: number;
  respiratoryRate?: number;
  weightKg?: number;
  heightCm?: number;
  oxygenSaturation?: number;
}

export type MedicalTimelineEventType =
  | "visit"
  | "diagnosis"
  | "medication"
  | "laboratory-result"
  | "document"
  | "note";
