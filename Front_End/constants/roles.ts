export const USER_ROLES = ["doctor", "secretary", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

// A patient is a medical record entity, not an authenticated user (per the SRS).
