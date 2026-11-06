# Complete Architecture Guide: Driver Earnings, Payouts, Bookings & Support Ticket System

## 1. Executive Summary
This document provides a comprehensive operational and technical guide for the newly implemented driver earnings, payout/wallet management, booking categorization, and multi-platform support ticket systems across **GoLongDrive Driver App**, **GoLongDrive User App**, **Backend API**, and the **Admin Panel**.

---

## 2. Driver Earnings & Wallet Architecture

### 2.1 Balance Calculation & Credit Lifecycle
In ride-hailing and chauffeur services, earnings and commissions depend on whether payment is collected digitally or in cash:
- **Online / Digital Payment (Razorpay / Pre-paid)**:
  - The customer pays 100% of the fare directly to GoLongDrive.
  - The driver is credited their net earnings (`grandTotal - platformCommission`) directly into their `walletBalance`.
  - The `Earning` record is created with `payoutStatus: 'Pending'`.
- **Cash Ride**:
  - The driver collects the full fare in cash from the passenger.
  - The driver already has the passenger's cash in hand, so their net payout is not credited; instead, the platform commission owed to GoLongDrive is recorded.

### 2.2 Payout Request & Overdraft Prevention
To ensure drivers cannot double-spend or request more than they hold:
1. When a driver initiates a payout request:
   - The backend checks `driver.walletBalance >= requestedAmount` and `requestedAmount >= 100` (minimum threshold).
   - The requested amount is **immediately deducted** from `driver.walletBalance`.
   - A `Payout` record is generated in `Pending` status with a unique code formatted as `PO-YYYYMMDD-XXXX`.
2. **If Admin Approves & Marks as Paid**:
   - The Admin enters the banking transaction reference (UTR / IMPS reference code).
   - The status transitions to `Paid`.
   - The driver sees the updated status and UTR number in their **Payout History** screen.
3. **If Admin Rejects the Payout**:
   - The Admin specifies a mandatory rejection reason (e.g. invalid IFSC or closed bank account).
   - The backend transitions the status to `Rejected`.
   - **Crucial Safety Measure**: The backend automatically refunds the exact requested amount back to the driver's `walletBalance` (`$inc: { walletBalance: payout.amount }`), ensuring no funds are lost.

---

## 3. Support Ticket System Architecture

```
                 ┌────────────────────────────────────────────────────────┐
                 │                Support Ticket Workflow                 │
                 └────────────────────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
 ┌──────────────────────┐                            ┌──────────────────────┐
 │      User App        │                            │      Driver App      │
 │  (Customer Ticket)   │                            │   (Driver Ticket)    │
 └──────────┬───────────┘                            └──────────┬───────────┘
            │ POST /api/v1/tickets                              │ POST /api/v1/tickets
            ▼                                                   ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                          Backend Ticket Engine                           │
 │     • Generates TCK-YYYYMMDD-XXXX                                        │
 │     • Associates Customer ID or Driver ID                                │
 │     • Appends message thread entries                                     │
 └──────────────────────────────────┬───────────────────────────────────────┘
                                    │
                                    ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                         Admin Support Desk                               │
 │     • Filter by role (Customer / Driver) and status                      │
 │     • Inspect ticket details & context                                   │
 │     • Respond directly via POST /api/v1/tickets/:id/reply                │
 │     • Update status (In Progress, Resolved, Closed)                      │
 └──────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Roles & Separation
- **Customer Tickets**: Categorized into `Ride Issue`, `Payment & Refund`, `Driver Issue`, `Booking & Cancellation`, `App Problem`, and `Other`.
- **Driver Tickets**: Categorized into `Payment & Billing`, `Ride Issue`, `Vehicle & Route`, `Account & KYC`, `App Problem`, and `Other`.
- **Conversation Thread**:
  - Each message records `senderType` (`Customer`, `Driver`, `Admin`), `senderName`, `message`, and timestamp `sentAt`.
  - Both mobile apps render live threads displaying admin responses clearly.
  - When tickets are `Resolved` or `Closed`, the thread displays a finalized banner.

---

## 4. Admin Panel Enhancements

### 4.1 Driver Payouts Management (`/payouts`)
- **Metrics Dashboard**: Real-time counts and totals for Pending Requests, Pending Amount, Settled (Paid) Total, and Total Requests Volume.
- **Filtering**: Tabbed status filtering (`All`, `Pending`, `Processing`, `Paid`, `Rejected`) and multi-field search.
- **Settlement Dialog**: Dialog prompting for the bank transaction UTR reference and optional notes.
- **Rejection Dialog**: Dialog with reason requirement and warning of automatic balance restoration.

### 4.2 Booking Categories (`/rides`)
- Quick access category tabs at the top of the Rides Management page:
  - **All Bookings**: Full list of trips.
  - **Ongoing Bookings**: Active trips (`Trip Started`, `Driver Arrived`, `Driver Assigned`, `Driver Accepted`, `Confirmed`).
  - **Upcoming Bookings**: Scheduled/Pending trips (`Pending`, `Searching Driver`).
  - **Completed Bookings**: Finalized journeys (`Trip Completed`).
  - **Cancelled Bookings**: Terminated journeys (`Cancelled by Customer`, `Cancelled by Driver`, `Cancelled by Admin`).
- Badge on each tab indicates the number of bookings currently in that category.
- Full trip inspection available via the Details link or `/rides/[id]`.

### 4.3 Support Ticket Helpdesk (`/tickets`)
- Role filter (`All Roles`, `Customers`, `Drivers`).
- Status filter (`All`, `Open`, `In Progress`, `Resolved`, `Closed`).
- Interactive chat drawer to read the full conversation and reply to the user.

---

## 5. API Reference Summary

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/v1/earnings/dashboard` | `GET` | Driver | Today vs Lifetime metrics, wallet balance, 7-day distance graph |
| `/api/v1/earnings/payouts/request` | `POST` | Driver | Request wallet withdrawal |
| `/api/v1/earnings/payouts` | `GET` | Driver | Driver payout history |
| `/api/v1/earnings/admin/payouts` | `GET` | Admin | List all driver payouts with pagination and filters |
| `/api/v1/earnings/admin/payouts/:id/status` | `PATCH` | Admin | Mark payout as `Paid` or `Rejected` |
| `/api/v1/tickets` | `POST` | User/Driver | Submit a new support ticket |
| `/api/v1/tickets/my-tickets` | `GET` | User/Driver | List submitted tickets |
| `/api/v1/tickets/:id` | `GET` | User/Driver/Admin | Fetch ticket details and full conversation |
| `/api/v1/tickets/:id/reply` | `POST` | User/Driver/Admin | Add a message to the ticket conversation |
| `/api/v1/tickets/admin/all` | `GET` | Admin | List all support tickets with filters |
| `/api/v1/tickets/admin/:id/status` | `PATCH` | Admin | Update ticket status (`In Progress`, `Resolved`, `Closed`) |

