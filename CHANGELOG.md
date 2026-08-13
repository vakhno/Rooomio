# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

### Changed

### Fixed

---

## [1.0.0-alpha.2] - 2026-08-13

### Added

- **Persistent reservations** - Store committed room bookings in Postgres so confirmed reservations survive socket reconnects and backend restarts.
- **Reservation persistence coverage** - Added an integration test that commits a booking through sockets, restarts the socket server, and verifies the reservation still exists in Postgres.

### Changed

- **Home** - Centered the Rooomio landing copy and primary booking/account actions, with text coming from shared locales.
- **Authentication** - Simplified login/register screens to the right-side form panel, renamed actions to Sign In and Sign Up, and localized the visible copy.
- **Navigation and profile** - Localized header, menu, profile, and reservations copy; removed the header subtitle and profile back button.
- **Reservations** - Replaced the upcoming-count control with a booking action and centered empty states for upcoming and past reservations.
- **Pages and queries** - Moved page-local components and query operations into focused folders to match existing module structure.
- **Floor canvas** - Removed the read-only grid toggle, keep the grid off by default, and use clearer room borders with hover-only highlight color.

### Fixed

- **Booking durability** - Confirmed bookings no longer disappear when in-memory socket state is reset after a server restart.
- **Floor interactions** - Room hover borders now stay inside each room boundary, avoiding highlight bleed into neighboring rooms.
- **Pointer states** - Added pointer cursors for tabs, building cards, floors, and selectable room areas.

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

[Unreleased]: https://github.com/vakhno/Rooomio/compare/v1.0.0-alpha.2...HEAD
[1.0.0-alpha.2]: https://github.com/vakhno/Rooomio/compare/v1.0.0-alpha.1...v1.0.0-alpha.2
[1.0.0-alpha.1]: https://github.com/vakhno/Rooomio/releases/tag/v1.0.0-alpha.1
