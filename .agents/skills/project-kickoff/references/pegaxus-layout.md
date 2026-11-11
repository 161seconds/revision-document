# Pegaxus folder baseline

Use the structure observed in `C:\Users\acer\pegaxus` on 2026-11-11. This is a portable structural reference, not an instruction to copy Pegaxus business code, secrets, integrations, or dependencies. The original checkout is not required to use the skill.

## Workspace and repository boundaries

The reference work folder contains three separate repositories:

```text
<project>/
  <project>-be/
  <project>-fe/
  <project>-document/
```

Keep those responsibility boundaries for a new full-stack application. Preserve the user's chosen repository topology: the three folders may be sibling repositories or, when requested, directories in one repository. Do not initialize, split, or move repositories as a side effect of a folder proposal. Omit frontend/backend parts that the project does not need.

## Backend: layers with feature modules

For an ASP.NET Core backend, replace `Project` with its actual PascalCase name:

```text
<project>-be/
  Project.API/
    Controllers/
    Extensions/
    Filters/
    Middleware/
    Models/
    Program.cs
  Project.Service/
    <Feature>Service/
      I<Feature>Service.cs
      Service.cs
      Request.cs
      Response.cs
      Validator/
    Common/
    Exceptions/
  Project.Repository/
    Entities/
    Configurations/
    Enum/
    Extensions/
    Migrations/
    AppDbContext.cs
  Project.Service.Test/
    <Feature>/
    Common/
  docs/
  Directory.Build.props
  Project.sln
```

These are possible locations, not a list of empty directories or files to scaffold.

- **API:** HTTP boundaries, controllers, authorization policies, response handling, DI, and middleware. Add `Hubs/` or hosted `Services/` only for real-time or background behavior that is needed.
- **Service:** business rules and feature DTOs/validators. A module implementation is named `Service`, its contract `I<Feature>Service`; request and response types are grouped in `Request.cs` and `Response.cs`. Keep HTTP result types out of the service layer.
- **Repository:** EF Core context, entities, mappings, enums, migrations, and database helpers. Pegaxus services inject `AppDbContext` directly. Do not add repository wrappers, a unit of work, MediatR, or CQRS merely to imitate an architecture diagram.
- **Tests:** use the real test runner. In the .NET reference, xUnit tests are grouped by feature; shared test fixtures live in `Common/`. Service, HTTP contract, and relational database tests serve different purposes; InMemory does not prove PostgreSQL behavior.
- **Dependencies:** API uses Service; Service uses Repository; Service never references API. API may also reference Repository for startup/composition, as the actual Pegaxus project files do. Request flow and project references are not identical diagrams.
- **Module growth:** split a large service into cohesive partial files such as `Queries.cs`, `Lifecycle.cs`, or `Payments.cs` when needed. Do not create every partial file for a tiny feature. Prefer `Validator/` for a new module; preserve the existing `Validations/` spelling when editing a module that uses it.
- **Registration:** new services are wired through the API's `Extensions/ServiceCollectionExtensions.cs` in Pegaxus; inspect the equivalent composition root in the target.

Evidence: `pegaxus-be/CODING_CONVENTIONS.md`, `README.md`, project references, `Pegaxus.Service/BookingService/`, `InvoiceService/`, and `Pegaxus.Service.Test/Booking/`.

## Frontend: app, domain features, shared code

The reference is React/TypeScript with Vite:

```text
<project>-fe/
  src/
    app/
      providers/
      App.tsx
      router.tsx
      route-config.ts
    features/
      <feature>/
        components/
        hooks/
        pages/
        services.ts
        schemas.ts
        types.ts
        index.ts
    shared/
      components/
      constants/
      hooks/
      layouts/
      services/
      types/
      utils/
    lib/
      axios.ts
      env.ts
      queryClient.ts
    assets/
    locales/
    styles/
    tests/
      <feature>/
    main.tsx
  public/
  e2e/
  scripts/
```

- `app/` composes routing, providers, and application wiring. `features/<feature>/` owns domain pages, UI, hooks, API calls, validation, and types.
- Keep business-specific code inside its feature. Promote code to `shared/` only when multiple features actually need it; use `lib/` for configured clients and integrations, not miscellaneous business logic.
- Reuse a centralized API client rather than creating one per feature. Keep feature API calls in `services.ts`, runtime input validation in `schema.ts` or `schemas.ts` following the nearest module, and public exports in `index.ts` only where useful.
- `src/tests/<feature>/` holds unit tests in the reference; `e2e/` holds browser flows. Follow existing test placement when extending another repository.
- Create only needed files. Do not copy domain fixtures, mocks, screenshot folders, `.gitkeep`, demo files, or an entire dependency manifest from Pegaxus.
- Preserve the chosen framework. For Next.js, keep its required route directories and server/client boundaries; adapt the feature/shared organization around them rather than copying Vite entrypoints.

Evidence: `pegaxus-fe/src/app/`, `features/booking/`, `features/invoice/`, `features/auth/`, `shared/`, `lib/`, `src/tests/`, and `package.json`.

## Project documents

Pegaxus groups documents by responsibility: `overview/`, `business/`, `use-case/`, `api-contract/`, `data/`, `dbdiagram/`, `screen/`, and `report/`. Reuse only the categories the new project needs. Do not copy deprecated material or fill a document repository with placeholder sections.

Keep each backend/frontend README responsible for its own setup and checks. Keep shared requirements and API contracts in the project documents; link them from implementation repositories. If the target already uses `docs/` within one repository, preserve that location.

## Conventions are discovered separately

Pegaxus uses Conventional Commits and prefixes such as `feat/` and `fix/`; its frontend contribution workflow targets `dev`. These are observed examples, not mandatory Git topology for every project. Infer the target's current rules before proposing a fallback.

Framework/runtime versions, PostgreSQL-specific transaction helpers, route prefixes, authentication choices, Redis, SignalR, and production deployment are separate design decisions. The folder reference does not require copying them.
