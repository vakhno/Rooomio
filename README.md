# Roomio

Small meeting-room booking app. The assignment is to let employees register/login, open a weekly room schedule, see occupied 30-minute slots, book free office time, and cancel only their own bookings.

## Run With Docker

Requirements:

- Docker Desktop with Docker Compose.

Create `.env`:

```powershell
Copy-Item .env.example .env
```

Start the app:

```bash
docker compose up --build
```

Open http://localhost:5173. The backend runs on http://localhost:3000.

## Seed Demo Data

After the Docker stack is running, seed from another terminal:

```bash
docker compose exec backend-dev npm run seed
```

Seeded users:

| Name | Email | Password |
| --- | --- | --- |
| Shelby | `shelby@roomio.test` | `Roomio2026!` |
| Sparrow | `sparrow@roomio.test` | `Roomio2026!` |

Seeded rooms include `Aquarium`, `Mars`, `Gagarin`, `Luna`, `Orion`, and `Apollo`. The seed is idempotent for fixed users, rooms, and demo bookings. Reservation state currently lives in the backend socket process, so rerun the seed after restarting the backend if demo bookings disappear.

## Local Npm Commands

Node/npm is only needed when running commands outside Docker:

```bash
npm install
npm test
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env`. Docker Compose uses it for PostgreSQL credentials, `POSTGRES_URL`, `JWT_SECRET`, frontend/backend URLs, and `NOTIFY_BEFORE_MINUTES`. `NOTIFY_BEFORE_MINUTES=10` means the app sends the in-app end-of-booking notification 10 minutes before a booking ends when the next slot in the same room is already occupied.

## Validation And Time

Overlap checking uses the standard half-open interval rule: `newStart < existingEnd && newEnd > existingStart`. Partial overlaps and fully contained ranges are rejected, while adjacent bookings are valid because one booking may end exactly when the next one starts.

Reservation times are sent as UTC ISO strings ending in `Z`. The UI displays those same instants in the user's browser time zone, but office-hours checks convert them to `Europe/Kyiv` before applying the `09:00-19:00` rule.

## Implemented Bonuses

- Docker Compose startup.
- Clear server-side booking errors.
- Server-side own-booking cancellation protection.
- My Reservations page with future and past lists.
- Weekly recurring reservations with occurrence or series cancellation.
- In-app end-of-booking notification.
- Integration tests for booking flows.
- Capacity filter.

## Known Follow-ups

- [Issue #70](https://github.com/vakhno/Rooomio/issues/70): reservation persistence/race protection needs recheck because current source still keeps reservations in socket memory.
- [Issue #72](https://github.com/vakhno/Rooomio/issues/72): dev-mode email confirmation before booking is still open.
