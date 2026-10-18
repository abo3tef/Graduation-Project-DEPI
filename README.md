# Medilog

Medilog is a smart medical records platform designed to give doctors and healthcare teams a clearer, safer workspace for managing patients, appointments, and medical histories.

The project is organized as a full-stack application:

- **Frontend:** A bilingual Next.js web application with Arabic and English support.
- **Backend:** An ASP.NET Core Web API organized into Domain, Application, Infrastructure, and API layers.

> **Project status:** Medilog is currently under active development. The frontend foundation, localization setup, domain type definitions, and backend solution structure are in place. Business features and persistent data access are being implemented incrementally.

## Contents

- [Product scope](#product-scope)
- [Current implementation](#current-implementation)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Frontend](#frontend)
- [Backend](#backend)
- [Localization](#localization)
- [Architecture](#architecture)
- [Development conventions](#development-conventions)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## Product scope

Medilog is intended to provide a unified workspace for:

- Patient profile and contact information
- Doctor and secretary workflows
- Appointment scheduling and status management
- Medical visits and clinical notes
- Vital signs and medical records
- Medical timeline events such as diagnoses, medications, laboratory results, documents, and notes
- Secure access to healthcare information
- Arabic and English user experiences

These areas represent the planned product scope. Availability of a feature in the running application depends on its implementation status.

## Current implementation

### Available today

- Next.js App Router frontend
- Arabic (`ar`) and English (`en`) locales
- Locale-aware routing with Arabic as the default locale
- Right-to-left layout for Arabic and left-to-right layout for English
- Initial landing page describing the platform scope
- Shared TypeScript models for patients, appointments, and medical visits
- ASP.NET Core Web API project with HTTPS redirection
- Development OpenAPI endpoint configuration
- Layered backend solution with separate projects for domain, application, infrastructure, and API concerns

### In progress

- Authentication and role-based access
- Patient, doctor, and secretary management
- Appointment and medical-record workflows
- Database persistence and repositories
- Complete REST API endpoints
- Production-ready validation, authorization, observability, and automated tests

The current backend still contains the default ASP.NET Core weather forecast endpoint as a placeholder while the Medilog API is being built.

## Technology stack

### Frontend

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [next-intl](https://next-intl.dev/) for localization
- [Tailwind CSS](https://tailwindcss.com/) 4
- ESLint

### Backend

- [.NET](https://dotnet.microsoft.com/) 10
- ASP.NET Core Web API
- ASP.NET Core OpenAPI support
- Nullable reference types and implicit usings enabled

## Repository structure

```text
.
├── Back_End/
│   ├── Medilog.slnx
│   └── src/
│       ├── Medilog.Api/             # HTTP host, endpoints, middleware, configuration
│       ├── Medilog.Application/     # Use cases, DTOs, services, and interfaces
│       ├── Medilog.Domain/          # Entities, enums, and shared domain rules
│       └── Medilog.Infrastructure/  # Persistence and repository implementations
│
├── Front_End/
│   ├── app/                         # Next.js routes and locale layouts
│   ├── components/                  # Shared UI components
│   ├── constants/                   # Shared frontend constants
│   ├── data/                        # Frontend data access layer
│   ├── features/                    # Feature-oriented modules
│   ├── i18n/                        # Routing and localization configuration
│   ├── messages/                    # Arabic and English translation files
│   ├── types/                       # Shared TypeScript models
│   └── package.json
│
└── README.md
```

## Prerequisites

Install the following before running the project:

- Git
- Node.js 20.9 or later
- npm
- .NET SDK 10.0 or later

Verify the installed versions:

```bash
node --version
npm --version
dotnet --version
```

## Getting started

Clone the repository and open the project directory:

```bash
git clone https://github.com/abo3tef/Graduation-Project-DEPI.git
cd Graduation-Project-DEPI
```

The frontend and backend run as separate applications. Start each one in its own terminal.

### 1. Start the backend

From the repository root:

```bash
cd Back_End
dotnet restore
dotnet run --project src/Medilog.Api/Medilog.Api.csproj
```

The exact HTTP and HTTPS URLs are printed by ASP.NET Core when the application starts. In development, the OpenAPI document is available at:

```text
https://localhost:<backend-port>/openapi/v1.json
```

The backend currently exposes a placeholder `GET /weatherforecast` endpoint. Medilog-specific endpoints will replace it as the application layer is completed.

### 2. Start the frontend

In a second terminal, from the repository root:

```bash
cd Front_End
npm install
npm run dev
```

Open the application at:

- [http://localhost:3000/ar](http://localhost:3000/ar) for Arabic
- [http://localhost:3000/en](http://localhost:3000/en) for English

The locale is always part of the URL. Visiting the root path is handled by the locale middleware according to the configured routing behavior.

## Frontend

### Available scripts

Run these commands from `Front_End/`:

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Serve the production build
npm run lint     # Run ESLint
```

### Frontend conventions

- Keep route-level code in `app/`.
- Keep reusable visual components in `components/`.
- Organize business functionality by feature under `features/`.
- Add user-facing copy to both `messages/en.json` and `messages/ar.json`.
- Keep shared models in `types/`.
- Preserve the locale direction behavior: Arabic is RTL and English is LTR.

## Backend

The backend solution is located in `Back_End/Medilog.slnx`.

### Projects

| Project | Responsibility |
| --- | --- |
| `Medilog.Domain` | Core entities, enums, and domain rules with no dependency on infrastructure |
| `Medilog.Application` | Application use cases, DTOs, service abstractions, and interfaces |
| `Medilog.Infrastructure` | Persistence, repositories, and external implementation details |
| `Medilog.Api` | HTTP entry point, API endpoints, middleware, and application configuration |

Build and run the backend:

```bash
cd Back_End
dotnet build Medilog.slnx
dotnet run --project src/Medilog.Api/Medilog.Api.csproj
```

For local development, environment-specific configuration belongs in:

```text
Back_End/src/Medilog.Api/appsettings.Development.json
```

Do not commit passwords, connection strings containing credentials, API keys, or other secrets. Use user secrets or environment variables for sensitive local configuration.

## Localization

The frontend currently supports:

| Locale | Language | Direction | URL |
| --- | --- | --- | --- |
| `ar` | Arabic | RTL | `/ar` |
| `en` | English | LTR | `/en` |

Localization is configured in `Front_End/i18n/`. Translation resources are stored in:

- `Front_End/messages/ar.json`
- `Front_End/messages/en.json`

When adding a translation key, add the matching key to both files so that switching languages does not produce missing content.

## Architecture

The backend follows a layered architecture inspired by Clean Architecture:

```text
Medilog.Api
    ↓
Medilog.Application
    ↓
Medilog.Domain

Medilog.Infrastructure → Medilog.Application + Medilog.Domain
```

The dependency direction keeps business rules independent from HTTP, database, and framework-specific details. New business behavior should normally be represented in the Application and Domain layers, while the API layer should remain focused on transport concerns.

The frontend follows a feature-oriented structure so that pages, components, data access, and types can evolve around a specific business capability without creating a single large shared module.

## Development conventions

- Use clear, domain-oriented names for entities, services, DTOs, and UI features.
- Keep API contracts and frontend models aligned as backend endpoints are introduced.
- Validate input at API boundaries and return explicit, consistent errors.
- Avoid placing business rules directly in controllers or page components.
- Run the relevant formatter, linter, build, and tests before opening a pull request.
- Keep generated folders such as `bin/`, `obj/`, `.next/`, and `node_modules/` out of commits.

## Roadmap

The following sequence reflects the intended implementation direction:

1. Define the domain model for users, roles, patients, appointments, and medical records.
2. Add database configuration, migrations, repositories, and seed data.
3. Implement authentication and authorization for doctors, secretaries, and other supported roles.
4. Expose patient, appointment, medical visit, and medical timeline APIs.
5. Connect the frontend feature modules to the backend API.
6. Add dashboards, search, filtering, validation, and error states.
7. Add automated unit, integration, and end-to-end tests.
8. Harden production configuration, logging, monitoring, and privacy controls.

## Contributing

1. Create a focused branch from the current development branch.
2. Keep changes limited to one feature or fix when possible.
3. Update both Arabic and English translations for any new user-facing text.
4. Run the relevant checks:

   ```bash
   cd Front_End
   npm run lint
   npm run build
   ```

   ```bash
   cd Back_End
   dotnet build Medilog.slnx
   ```

5. Open a pull request with a concise description of the change, validation performed, and any configuration required.

## License

No license has been specified for this repository yet. Until a license is added, the project should be treated as proprietary and reused only with permission from the project owners.
