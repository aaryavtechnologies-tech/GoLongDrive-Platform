# 🚕 GoLongDrive - Intercity Cab Booking Platform

A comprehensive, full-stack ride-hailing and intercity car-booking platform. The system features real-time dispatch, dynamic pricing, a premium user experience, and a complete administrative dashboard.

The platform is divided into four main components:
- **User App** (Flutter)
- **Driver App** (Flutter)
- **Backend API & WebSockets** (Node.js / Express)
- **Admin Panel** (Next.js / React)

---

## 🌟 Features

### 📱 User App (Passenger)
- **Premium UI/UX:** A high-end, production-ready interface featuring a signature **Black + Yellow** brand theme.
- **Intercity Booking:** Search for pickup and drop-off locations with integrated Google Places Autocomplete.
- **Live Ride Tracking:** View active rides, driver information, and vehicle details on an interactive map.
- **Real-Time Updates:** WebSockets ensure instant status updates as the driver accepts, arrives, and completes the trip.
- **Authentication:** Secure JWT-based login, OTP flow, and profile management.

### 🚖 Driver App
- **Real-Time Dispatch:** Uses `socket.io` to receive instant, broadcasted ride requests.
- **Fastest-Finger-First Acceptance:** Drivers get a 2-minute window to accept a ride. The backend uses atomic locks to prevent race conditions if multiple drivers try to accept simultaneously.
- **Trip Management:** Manage the full ride lifecycle (Start, Complete, Cancel) directly from the app.
- **Earnings & Dashboard:** View daily trips, earnings, and easily toggle **Online/Offline** availability status.

### ⚙️ Backend (Node.js)
- **RESTful API:** Express.js routing handling authentication, bookings, drivers, users, and pricing.
- **WebSockets:** Integrated `socket.io` server for real-time bi-directional communication between users, drivers, and the server.
- **MongoDB:** Robust data modeling for Users, Drivers, Bookings, Payments, and Vehicle Types using Mongoose.
- **Dynamic Dispatch:** Broadcasts rides to available drivers matching the requested vehicle type. Features a random-assign fallback if no driver accepts within 2 minutes (while preventing double-bookings for the same date).

### 💻 Admin Panel (Next.js)
- **Dashboard Overview:** View platform metrics, total bookings, active drivers, and revenue.
- **Dynamic Pricing:** Administrators can set per-km pricing models, minimum fares, and advance amounts based on vehicle types (e.g., Sedan, SUV).
- **User/Driver Management:** Approve drivers, view user activity, and moderate the platform.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (For building mobile apps)
- Google Maps API Key (For Geocoding, Places, and Maps SDK)

### 1. Backend Setup
```bash
cd backend
npm install
```
Configure your environment variables (see `backend/.env.example`).
```bash
# Start the server (runs on port 5051 by default)
npm run dev
```

### 2. Admin Panel Setup
```bash
cd admin-panel
npm install
```
Configure your `.env` file (see `admin-panel/.env.example`).
```bash
# Start the Next.js development server
npm run dev
```

### 3. User App Setup
```bash
cd user-app
flutter pub get
```
Edit `lib/core/config/env_config.dart` to point `apiUrl` and `socketUrl` to your backend.
```bash
# Run on connected device or emulator
flutter run
```

### 4. Driver App Setup
```bash
cd driver-app
flutter pub get
```
Edit `lib/core/config/env_config.dart` to point `apiUrl` and `socketUrl` to your backend.
```bash
# Run on connected device or emulator
flutter run
```

---

## 🏗️ Architecture & Tech Stack

- **Mobile:** Flutter, Dart, Google Maps Flutter, Socket.io-client, GoRouter.
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io, JWT (JSON Web Tokens).
- **Admin:** Next.js (React), TailwindCSS.

## 📡 Real-Time Dispatch Flow

1. User creates a booking (`POST /bookings`).
2. Backend validates the booking and broadcasts a `ride:request` event via WebSockets to all online drivers matching the requested vehicle type.
3. Matching drivers see an `IncomingRequestScreen` with a 120-second countdown.
4. The first driver to tap "Accept" triggers `POST /driver/rides/:id/accept`. 
5. The backend applies an atomic update to lock the ride to that driver.
6. A `ride:accepted` event is broadcasted to the remaining drivers, automatically dismissing the request on their screens.
7. The user receives a real-time WebSocket update that a driver has been assigned.
