export type Gender = "female" | "male" | "unspecified";

export interface PatientSummary {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  lastVisitAt?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}
