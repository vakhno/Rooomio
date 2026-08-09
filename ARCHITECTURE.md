# Architecture

```text
/
|-- apps/
|   |-- backend/       Express API, auth enforcement, Socket.IO runtime.
|   `-- frontend/      React app, pages, UI flows, browser state.
|-- shared/
|   |-- auth/          Better Auth setup and shared auth helpers.
|   |-- components/    Reusable UI components.
|   |-- db/            Drizzle schema, migrations, database helpers.
|   |-- e2e/           End-to-end test utilities.
|   |-- integration/   Integration test utilities.
|   |-- locales/       Translation and locale files.
|   |-- queries/       Shared query contracts.
|   |-- routes/        Shared route contracts.
|   |-- sockets/       Socket event contracts and realtime types.
|   |-- styles/        Shared styling assets.
|   `-- unit/          Unit test utilities.
|-- design/            Product design source files and visual references.
|-- .github/           GitHub automation and repository config.
|-- .husky/            Git hooks.
|-- AGENTS.md          Agent read order, routing, rules, and quality gates.
|-- CONTEXT.md         Product and domain context skeleton.
|-- DESIGN.md          UI and product design guidance.
|-- package.json       Root scripts and npm workspace config.
|-- package-lock.json  Locked npm dependency graph.
|-- tsconfig.json      Root TypeScript project references.
|-- turbo.json         Turbo task orchestration.
|-- docker-compose.*   Docker profiles.
`-- .env*.example      Non-secret environment templates.
```
