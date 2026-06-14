# Call Booking — Frontend

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Generate API types from contract:
   ```
   npm run gen:api
   ```

3. Start the mock API (Prism) — in a separate terminal:
   ```
   npm run mock
   ```

4. Start the dev server:
   ```
   npm run dev
   ```

   The app will be available at http://localhost:5173.

## Environment Variables

- `VITE_API_BASE_URL` — Base URL of the API (default: `http://127.0.0.1:4010`).

## Pages

### Guest
- `/` — List of event types
- `/event-types/:id` — Select a slot and book

### Admin
- `/admin` — Dashboard with upcoming bookings
- `/admin/event-types` — Create and view event types
