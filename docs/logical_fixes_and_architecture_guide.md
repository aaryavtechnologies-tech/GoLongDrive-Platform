# GoLongDrive: Ride Lifecycle, Turn-by-Turn Navigation & Payment Architecture Guide

This document provides a comprehensive explanation of the logical fixes, data flows, and state machines implemented across the GoLongDrive platform (`driver-app`, `user-app`, and `backend`).

---

## 1. High-Level Lifecycle State Machine

```
[Customer Books Ride] 
         ↓
[Searching Driver] ──(Broadcast)──→ [Driver Accepts Ride]
                                           ↓
                                  [Heading to Pickup]
                                (In-App Nav to Pickup)
                                           ↓
                                  [Driver Arrived] ──(Socket alert to User)
                                           ↓
                                [Passenger Shares 4-Digit PIN]
                                           ↓
                                    [Trip Started]
                             (In-App Nav to Drop-Off)
                             (Live GPS Broadcast via Socket)
                             (Dynamic Distance & Fare Tally)
                                           ↓
                                    [Driver Ends Ride]
                                           ↓
                                  [Awaiting Payment]
                          (Razorpay opens on User App)
                                           ↓
                          [Payment Verified via Backend]
                          (Socket: payment:received)
                                           ↓
                            [Verify PIN & Complete Ride]
                                           ↓
                                   [Trip Completed]
```

---

## 2. Driver App Navigation & Screen Lock Architecture

### 2.1 Route Preview & Navigation Segments
Drivers experience two distinct navigation segments managed through [`InAppNavigationScreen`](file:///Users/wefix/Documents/chirag-projects/GoLongDrive-Platform/driver-app/lib/features/navigation/in_app_navigation_screen.dart):
1. **Segment 1 (Driver to Pickup)**:
   - Initiated from `CurrentRideScreen` via `Turn-by-Turn to Pickup`.
   - Google Directions API generates the road-following polyline and turn steps to the rider's pickup point.
   - When the driver approaches within 30 meters of pickup, the screen displays "Arrived at Pickup" with a `Confirm Arrival` button.
2. **Segment 2 (Pickup to Drop-Off)**:
   - Initiated automatically upon PIN verification.
   - Google Directions API provides turn-by-turn maneuvers, bearing calculations, and visual instructions.
   - Every 3 seconds, the driver's GPS fix is emitted over WebSockets to update the customer's live tracking view.
   - Live distance driven is accumulated and multiplied by `pricePerKm` to update the real-time fare.

### 2.2 Auditory Prompts (Google Maps Behavior)
- As the vehicle reaches the end of each maneuver step (within 25m), `_advanceStepIfNeeded()` triggers `_playInstructionChime()` and updates the instruction banner.
- Auditory chimes notify the driver to prepare for the turn, replicating the hands-free turn notification of native navigation tools.

### 2.3 Ride-Time Screen Lock
- Both `CurrentRideScreen` and `InAppNavigationScreen` are guarded with Flutter's `PopScope`:
  ```dart
  PopScope(
    canPop: _stage == _TripStage.completed,
    onPopInvokedWithResult: (didPop, result) {
      if (didPop) return;
      ScaffoldMessenger.of(context).showSnackBar(...);
    },
    child: Scaffold(...),
  )
  ```
- Prevents accidental back-navigation, swipes, or premature exit while a customer is in transit.

---

## 3. User App Real-Time Tracking, Boarding Pass & Payment

### 3.1 Live Tracking & Arrival Alerts
- [`ActiveRideScreen`](file:///Users/wefix/Documents/chirag-projects/GoLongDrive-Platform/user-app/lib/screens/booking/active_ride_screen.dart) renders a full-bleed `GoogleMap`.
- Subscribes to `UserSocketService.onDriverLocation`: when coordinates arrive, the car marker animates smoothly and updates its rotation to match the driver's compass bearing.
- Subscribes to `UserSocketService.onDriverArrived`: instantly displays a high-visibility arrival banner and dialog prompting the passenger to share their 4-digit Ride PIN.

### 3.2 Digital Boarding Pass
- Accessible at any time via the "Boarding Pass" button in the top bar.
- Uses `qr_flutter` to render an embedded QR code containing:
  - `bookingId`
  - `ridePin`
  - `passengerName`
  - `vehicleType`
  - Pickup and Drop addresses
- Displays the prominent 4-digit Ride PIN in bold, high-contrast gold styling.

### 3.3 Seamless End-of-Ride Razorpay Payment
- Subscribes to `UserSocketService.onRideAwaitingPayment`:
  1. Triggered automatically when the driver taps "End Ride".
  2. The user app receives the final calculated fare, calls `BookingService.initiatePayment()`, and immediately presents the native Razorpay payment sheet.
  3. Upon successful payment, `_handlePaymentSuccess` submits the payment ID and signature to `POST /api/customer/payments/verify`.
  4. The backend marks the booking as `Paid` and emits `payment:received` directly to the driver's phone.
  5. The driver enters the completion PIN, and both apps navigate to the completed summary screen.

---

## 4. User App Ride History Categorization & Sorting

In [`RideHistoryScreen`](file:///Users/wefix/Documents/chirag-projects/GoLongDrive-Platform/user-app/lib/screens/profile/ride_history_screen.dart), rides are partitioned into 4 strictly ordered tabs:

| Tab Order | Tab Name | Included Statuses | Action / Behavior |
|:---:|:---|:---|:---|
| **1st** | **Ongoing** | `Driver Assigned`, `Driver Accepted`, `Confirmed`, `Driver Arriving`, `Driver Arrived`, `Trip Started`, `Awaiting Payment` | Tapping navigates directly to `ActiveRideScreen` to track live progress and view PIN. |
| **2nd** | **Upcoming** | `Pending`, `Searching Driver`, Scheduled future trips | Shows scheduled pickup time, vehicle category, and estimated fare. |
| **3rd** | **Past** | `Trip Completed`, `Completed`, `Paid` | Shows completed ride receipts, driver information, and total fare. |
| **4th** | **Cancelled** | `Cancelled by Customer`, `Cancelled by Driver`, `Cancelled by Admin` | Shows trip cancellation date and documented reason. |

---

## 5. Backend Socket & Endpoint Reference

### Endpoints
- `POST /api/v1/driver/bookings/rides/:id/arrive` — Marks driver arrival, emits `ride:driver_arrived`.
- `POST /api/v1/driver/bookings/rides/:id/start` — Accepts passenger OTP/PIN, sets status to `Trip Started`, emits `ride:started`.
- `POST /api/v1/driver/bookings/rides/:id/end` — Accepts `actualDistance` and `finalFare`, transitions to `Awaiting Payment`, emits `ride:awaiting_payment`.
- `POST /api/v1/driver/bookings/rides/:id/complete` — Validates completion OTP, checks payment status, generates driver earnings, emits `ride:completed`.
- `POST /api/customer/payments/verify` — Validates Razorpay signature, sets booking payment status to `Paid`, emits `payment:received` to driver.

### Socket Events
- `driver:location_update` (Driver → Server) — Transmits latitude, longitude, heading, and speed.
- `driver:location` (Server → Customer) — Delivers live coordinates to customer map.
- `ride:driver_arrived` (Server → Customer) — Informs customer driver has arrived at pickup.
- `ride:awaiting_payment` (Server → Customer) — Prompts customer to pay via Razorpay.
- `payment:received` (Server → Driver) — Informs driver that payment was completed.
- `ride:completed` (Server → Customer & Driver) — Signals successful completion of ride.

