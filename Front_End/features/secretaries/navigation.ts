/**
 * Secretary menu. Only appointment, basic-patient and account entries exist: no medical-record links.
 * The appointments and patients routes are built by other members; these hrefs are the agreed paths.
 */
export const SECRETARY_NAV_ITEMS = [
  { key: "appointments", href: "/secretary/appointments" },
  { key: "patients", href: "/secretary/patients" },
  { key: "account", href: "/secretary/account" },
] as const;

export type SecretaryNavKey = (typeof SECRETARY_NAV_ITEMS)[number]["key"];
