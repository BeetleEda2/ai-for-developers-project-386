# Call Booking — Backend

Express + TypeScript backend implementing the [TypeSpec contract](../spec/main.tsp).

## Getting Started

```bash
npm install
npm run dev
```

Server starts at `http://127.0.0.1:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot-reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled version |
| `npm test` | Run tests (vitest) |

## Storage

In-memory only — data resets on restart. Pre-populated with one owner (`Europe/Moscow`) and 3 example event types.

## API

All endpoints follow the [OpenAPI spec](../spec/tsp-output/openapi.yaml). Key business rules:

- Slots: 30 min, 09:00–18:00 in owner's timezone, rolling 14-day window
- Booking start must align to 00/30 minute grid, within working hours, not in the past
- Same `start` cannot be booked twice (409 `TIME_SLOT_TAKEN`), even across event types
