# City Rides backend handoff checklist

## Frontend contract

- [x] Rider and driver lifecycle screens are implemented.
- [x] Rider vehicle, payment, fare, driver, PIN, active-trip, receipt and rating states are represented.
- [x] Driver nearby-request, accept, ignore, arrival, PIN, start, cancel, completion and history states are represented.
- [x] Driver live response parsing is isolated in `CityRideRequest.fromApiJson`.
- [x] Driver API calls are isolated in `CityRidesService`.
- [x] Empty, loading/fallback, cancellation, compact and dark UI states exist.

## Backend work still required

- [ ] Confirm one canonical `bookingType`/`tripType` value for city rides.
- [ ] Return vehicle option quotes and ETA for the rider selection screen.
- [ ] Accept a rider city-booking request with pickup/drop coordinates, vehicle type and payment method.
- [ ] Emit canonical booking lifecycle socket events to both apps.
- [ ] Include assigned driver and vehicle data in rider booking updates.
- [ ] Expose driver arrival, contact relay/chat and SOS integration.
- [ ] Confirm cancellation rules/fees and payment settlement behavior.
- [ ] Accept rider ratings only after a completed booking.
- [ ] Replace all demo values and run an end-to-end two-device test.

Frontend status: ready for backend integration. The remaining items above are backend contract and integration work, not missing UI screens.
