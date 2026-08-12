# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

### Changed

### Fixed

---

## [1.0.0-alpha.1] - 2026-08-12

First alpha release. Core meeting-room booking flows are in place; expect changes while persistence and confirmation follow-ups are finished.

### Added

- **Authentication** - Email/password registration, login, session handling, and protected app routes.
- **Room booking** - Weekly room schedule with occupied 30-minute slots, free-slot booking, and own-booking cancellation.
- **Office rules** - Server-side validation for office hours, overlaps, booking ownership, room capacity, and booking errors.
- **Recurring reservations** - Weekly recurring bookings with single-occurrence or whole-series cancellation.
- **Reservations views** - My Reservations page with future and past bookings.
- **Floor plans** - Top-down office layout builder and room schedule Gantt view.
- **Notifications** - In-app end-of-booking alerts before back-to-back room usage.
- **Demo data** - Docker-friendly seed data for users, rooms, floor layouts, and demo bookings.
- **Testing** - Unit, integration, and E2E coverage for auth, route guards, reservation rules, notifications, and booking flows.
- **Tooling** - Docker Compose setup, frontend/backend Dockerfiles, npm workspace scripts, Storybook, linting, Husky, and Turbo.
- **UI** - Redesigned the frontend with an isometric 16-bit visual style and shared design-system components.
- **Documentation** - Added assignment notes, runbook, validation rules, environment setup, and known follow-ups.
- **Auth** - Normalized credentials and aligned password-length validation across client and server flows.
- **Seeds** - Corrected demo room names and capacities.

[Unreleased]: https://github.com/vakhno/Rooomio/compare/v1.0.0-alpha.1...HEAD
[1.0.0-alpha.1]: https://github.com/vakhno/Rooomio/releases/tag/v1.0.0-alpha.1
