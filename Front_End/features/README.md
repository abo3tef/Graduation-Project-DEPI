# Feature modules

Organize UI and business logic by SRS capability. Suggested modules: `auth`, `dashboard`, `doctors`, `secretaries`, `patients`, `appointments`, and `medical-records` (visits, diagnoses, medications, allergies, conditions, vitals, labs, notes, documents, and timeline). Keep role checks at the API boundary as well as in the UI. The secretary module must not expose medical-record data.
