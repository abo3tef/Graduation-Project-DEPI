/** Mirrors the API's GET /api/secretary/me response (SecretaryAccountDto). No credentials are ever included. */
export interface AssignedDoctor {
  doctorId: string;
  fullName: string;
  specialization?: string | null;
}

export type SecretaryAccountStatus = "Active" | "Inactive";

export interface SecretaryAccount {
  secretaryId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  accountStatus: SecretaryAccountStatus;
  createdAt: string;
  assignedDoctors: AssignedDoctor[];
}
