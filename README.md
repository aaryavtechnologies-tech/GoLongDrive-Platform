# 🚕 GoLongDrive - Premium Intercity Cab Booking Platform

![GoLongDrive Banner](https://via.placeholder.com/1200x400/000000/FFD700?text=GoLongDrive+Platform)

A comprehensive, full-stack ride-hailing and intercity car-booking platform designed with a premium aesthetic and enterprise-grade architecture. The system features real-time dynamic dispatch, algorithmic pricing, a luxurious user experience (featuring a signature **Black + Yellow** brand theme), and a powerful administrative dashboard.

The ecosystem is divided into four interconnected applications:
1. **User App** (Flutter - iOS/Android)
2. **Driver App** (Flutter - iOS/Android)
3. **Backend API & WebSockets** (Node.js / Express)
4. **Admin Panel** (Next.js / React)

---

## 🌟 Comprehensive Feature Set

### 📱 User App (Passenger)
- **Premium UI/UX:** A high-end, production-ready interface that feels like a blend of luxury airline boarding passes and modern mobility apps.
- **Intercity & Local Booking:** Seamlessly search for pickup and drop-off locations using Google Places Autocomplete API.
- **Live Ride Tracking:** View active rides, exact driver location, and vehicle details on an interactive, custom-styled map.
- **Real-Time Updates:** WebSockets ensure instant status updates without manual refreshing as the driver accepts, arrives, and completes the trip.
- **Dynamic Fare Estimation:** Calculates exact route distances via Google Maps Directions API and applies dynamic per-km pricing.
- **Secure Authentication:** JWT-based login, OTP verification flow, and robust profile management.
- **Ride History & Invoices:** Beautifully structured digital receipts and historical ride tracking.

### 🚖 Driver App
- **Real-Time Dispatch Engine:** Leverages `socket.io` to receive instant, broadcasted ride requests.
- **Fastest-Finger-First Mechanics:** Drivers receive a 120-second window to accept a ride. The UI features a dynamic countdown ring and prominent "Missed Ride" error states if another driver wins the bid.
- **Trip Lifecycle Management:** Complete end-to-end management (Heading to Pickup, Arrived, Start Trip, Complete Trip) directly from the dashboard.
- **Earnings & Analytics Dashboard:** View daily trips, completed earnings, and recent transactions.
- **Availability Toggle:** Easily switch **Online/Offline** status, securely updating the backend so offline drivers aren't spammed with requests.

### ⚙️ Backend (Node.js)
- **RESTful API Architecture:** Express.js routing handling complex flows for authentication, bookings, drivers, users, and dynamic pricing models.
- **Real-Time WebSockets:** Integrated `socket.io` server for bi-directional communication, ensuring sub-second dispatching.
- **MongoDB Database:** Robust, relational-style data modeling using Mongoose (Users, Drivers, Bookings, Payments, Vehicle Types).
- **Atomic Concurrency Control:** Prevents race conditions during dispatch. When multiple drivers attempt to accept a ride simultaneously, atomic database locks guarantee only one driver is assigned.
- **Random-Assign Fallback:** If no driver accepts within 2 minutes, the system intelligently falls back to assigning a random available driver while checking for date-based scheduling conflicts.

### 💻 Admin Panel (Next.js)
- **Global Dashboard Overview:** View critical platform metrics, total ongoing bookings, active driver counts, and lifetime revenue.
- **Dynamic Pricing Engine:** Administrators can granularly set per-km pricing models, minimum base fares (e.g. ₹2000), and advance payment amounts (e.g. ₹500) based on specific vehicle types (Sedan, SUV, Hatchback).
- **User & Driver CRM:** Approve pending driver registrations, view detailed user activity logs, and moderate the entire platform.

---

## 🏗️ Architecture & Tech Stack

### Frontend & Mobile
- **Framework:** Flutter (Dart)
- **Routing:** GoRouter (Declarative routing)
- **Maps:** Google Maps Flutter, Google Places API, Geocoding
- **Real-Time:** `socket_io_client`
- **Admin UI:** Next.js (React), TailwindCSS, Shadcn UI

### Backend & Infrastructure
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Real-Time:** Socket.io
- **Email:** Nodemailer (SMTP)

---

## 📡 The Real-Time Dispatch Flow (Deep Dive)

The dispatch system is the core of the GoLongDrive platform. Here is exactly what happens when a user requests a ride:

1. **Booking Creation:** The user confirms a ride (`POST /bookings`). The backend saves the ride as `Searching Driver`.
2. **WebSocket Broadcast:** The backend emits a `ride:request` event to all drivers who are currently marked as `Online`, `Available`, and drive the requested `VehicleType`.
3. **Driver UI Trigger:** Matching drivers instantly see an `IncomingRequestScreen` with a 120-second countdown ring.
4. **Race Condition Resolution (Fastest Finger First):** 
   - When a driver taps "Accept", the app fires `POST /driver/rides/:id/accept`.
   - The backend uses an **atomic `findOneAndUpdate` lock**. If the ride is still `Searching Driver`, it locks it to this driver.
   - If a second driver's request arrives milliseconds later, the database rejects it with a `400 Bad Request`.
5. **Auto-Dismissal:** The backend broadcasts a `ride:accepted` event. Any other driver looking at the request screen will see it automatically close and transform into a "Missed Ride" state.
6. **User Notification:** The user receives a real-time update that a driver has been assigned, and the map begins tracking the driver's location.

---

## 📂 Project Structure

```text
car-booking/
├── user-app/                # Flutter passenger application
│   ├── lib/core/            # Services, models, API config
│   ├── lib/screens/         # UI layout and navigation
│   └── pubspec.yaml         
├── driver-app/              # Flutter driver application
│   ├── lib/core/            # Socket service, API config
│   ├── lib/features/        # Dashboard, Rides, Earnings
│   └── pubspec.yaml         
├── backend/                 # Node.js/Express server
│   ├── src/controllers/     # Request handlers
│   ├── src/models/          # Mongoose schemas
│   ├── src/routes/          # API endpoint definitions
│   ├── src/services/        # Dispatch & Socket logic
│   └── server.js            
└── admin-panel/             # Next.js web dashboard
    ├── src/components/      # Reusable UI components
    ├── src/pages/           # Next.js routing
    └── next.config.js       
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (v3.0+)
- Google Maps API Key (Ensure Geocoding, Places, and Maps SDK are enabled)

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Configure your environment variables by copying `.env.example`:
```bash
cp .env.example .env
```
*(Ensure you add your MongoDB URI, JWT Secrets, and Email SMTP credentials).*

Start the development server:
```bash
npm run dev
```
*The server will start on port 5051.*

### 2. Admin Panel Setup
Navigate to the admin panel:
```bash
cd admin-panel
npm install
```
Configure the environment variables:
```bash
# Edit admin-panel/.env to point to your backend:
# NEXT_PUBLIC_API_URL=http://localhost:5051/api/v1
```
Start the web dashboard:
```bash
npm run dev
```

### 3. User & Driver App Setup
Both Flutter applications follow the exact same setup process. For the user app:
```bash
cd user-app
flutter pub get
```
**Crucial Step:** You must configure the apps to talk to your backend. 
Open `lib/core/config/env_config.dart` and update the URLs:
```dart
class EnvConfig {
  static const String apiUrl = 'http://YOUR_LOCAL_IP:5051/api/v1';
  static const String socketUrl = 'http://YOUR_LOCAL_IP:5051';
}
```
*(Note: If testing on a physical device or Android Emulator, do not use `localhost`. Use your computer's local network IP address, e.g., `192.168.1.10`)*.

Run the app:
```bash
flutter run
```

---

## 🔒 Security & Best Practices
- **Role-Based Access Control (RBAC):** Distinct roles (User, Driver, Admin) enforced via JWT middleware.
- **Data Validation:** Joi validation on incoming API requests to prevent NoSQL injection.
- **Environment Isolation:** Sensitive keys are strictly kept out of source control via `.gitignore` and `.env` files.

## 📄 License
This project is proprietary and confidential. Unauthorized copying of these files, via any medium, is strictly prohibited.
