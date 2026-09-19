# City rides — frontend handoff

Open **Home → Book a city ride**. The rider flow is intentionally driven by sample data, but every backend-visible state now has a finished UI:

1. pickup and destination selection;
2. Mini / Sedan / XL selection;
3. fare and Cash / UPI review;
4. driver search;
5. driver assigned and approaching;
6. driver arrived with PIN, call and message actions;
7. trip in progress with ETA, progress and SOS affordance;
8. completion receipt and 1–5 star rating.

The driver app includes the matching request feed, accept/ignore actions, navigation to pickup, arrived state, PIN verification, active trip, completion, cancellation and local history. Seven demo requests keep the feed testable when the API is unavailable. Its service already attempts live driver endpoints and falls back to the demo feed.

## Backend connection points

Replace the rider screen's preview transitions with the existing authenticated booking and socket layers:

- create city booking: send pickup/drop coordinates, vehicle type, payment method and `bookingType: local`;
- matching: map `Searching Driver` to the searching UI;
- driver assignment: map `Driver Assigned` / `Driver Accepted` / `Confirmed` to the assigned UI and provide driver + vehicle data;
- arrival: map `Driver Arriving` and the driver-arrived event to the appropriate state;
- trip lifecycle: map `Trip Started`, `Trip Completed`, and cancellation events;
- actions: connect call, message, SOS, cancellation, payment confirmation and rating submission;
- live values: replace sample map, route, fare, ETA, PIN and receipt identifiers.

Driver integration is concentrated in `lib/features/city_rides/city_rides_service.dart`. Rider state rendering is in `lib/screens/city_ride/city_ride_screen.dart`; its `_Step` values are the UI mapping targets for API responses and socket events.

## Frontend validation

- `flutter analyze --no-pub`
- `flutter test --no-pub`
- Rider widget coverage includes routing, validation, vehicle/payment choice, matching, assigned, arrived, in-progress, completion, rating, cancellation, dark mode, compact width and enlarged text.
- Driver widget coverage includes request mapping without PIN exposure and the complete accept → arrive → PIN → start → complete lifecycle.
