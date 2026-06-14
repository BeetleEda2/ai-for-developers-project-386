# E2E User Scenarios

## 1. Guest books a call (happy path)

1. Open `/` — list of event types with title, description, duration
2. Click on an event type → navigate to `/event-types/:id`
3. See calendar with available dates (next 14 days, working days only)
4. Click on an available date → time slots appear on the right
5. Click on a time slot → booking form appears
6. Fill `Name`, `Email`, optional `Notes`
7. Click `Book` → see confirmation page with event title, date/time, guest name
8. Click `Book another call` → back to event types list

## 2. Conflict: guest books an already taken slot

1. From an event type page, select an available slot
2. Fill name, email, notes → `Book`
3. Navigate back to the same event type page
4. Select the same slot (same date + time)
5. Fill name, email → `Book`
6. See error notification: "This time slot is no longer available"
7. The unavailable slot should no longer be shown as available

## 3. Owner creates an event type

1. Open `/admin/event-types`
2. Fill `Title` (and optional `Description`)
3. Click `Create` → new event type appears in the list below
4. Navigate to guest homepage `/` → new event type is visible and clickable

## 4. Owner sees upcoming meetings

1. Guest books a call (step 1)
2. Open `/admin` — dashboard shows total bookings count and the booking in the "Upcoming Meetings" list
3. Booking details (guest name, email, time, notes) are visible
