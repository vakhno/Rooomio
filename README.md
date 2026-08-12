# Roomio

## Demo Seed Data

Start the project:

```bash
docker compose up --build
```

Then seed the demo data:

```bash
npm run seed
```

The command is idempotent for the fixed demo users, building, rooms, and live demo bookings.

Seeded users:

| Name | Email | Password |
| --- | --- | --- |
| Shelby | `shelby@roomio.test` | `Roomio2026!` |
| Sparrow | `sparrow@roomio.test` | `Roomio2026!` |

Seeded rooms include `Aquarium`, `Mars`, `Gagarin`, `Luna`, `Orion`, and `Apollo`, each with floor and capacity data. Demo bookings are created through the same booking socket flow used by the app, so the backend must be running for bookings to be seeded. Because bookings currently live in socket memory, rerun `npm run seed` after restarting the backend when you need demo bookings again.
