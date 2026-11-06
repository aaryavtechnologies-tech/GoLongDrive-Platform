# Checkpoint: Driver Earnings, Payouts & Support Ticket System

**Date:** 2026-11-06  
**Status:** Completed & Ready for Testing  
**Platforms Covered:** Driver App (Flutter), User App (Flutter), Backend (Node.js/Express/MongoDB), Admin Panel (Next.js 15)

---

## 1. Summary of Changes Implemented

### A. Driver App (Flutter)
1. **Earnings Dashboard Redesign (`driver-app/lib/features/earnings/earnings_screen.dart`)**:
   - Redesigned with the brand gold (`#E5A93C`) and dark/light responsive theme.
   - Dual-view segmented tab interface: **Today's Earnings** vs **Lifetime Earnings**.
   - Available withdrawable wallet balance card with **Request Payout** and **Payout History** navigation buttons.
   - 4-metric grid: Net Earnings, Total Distance (km), Completed Rides, and Online Hours.
   - 7-day visual distance cover bar chart displaying daily distance performance.
   - Recent ride transactions list with payment method and payout status badges.
2. **Payout Request Screen (`driver-app/lib/features/earnings/payout_request_screen.dart`)**:
   - Displays real-time withdrawable balance.
   - Amount selection with quick-chip presets (₹500, ₹1,000, ₹2,000, ₹5,000, Max) and custom input.
   - Choice between **Bank Transfer** (Account Holder Name, Account Number, IFSC, Bank Name) and **UPI** (UPI ID).
   - Form validation against minimum payout threshold (₹100) and available wallet balance.
   - Immediately deducts requested amount from driver wallet balance upon submission to prevent overdraft.
3. **Payout History Screen (`driver-app/lib/features/earnings/payout_history_screen.dart`)**:
   - Comprehensive log of past and pending payout requests.
   - Real-time status badges: `Pending Approval`, `Processing`, `Paid & Settled`, `Rejected`.
   - Displays payment method, account/UPI destination, UTR/IMPS transaction reference, and admin notes or rejection reasons.
4. **Driver Support Tickets (`driver-app/lib/features/profile/help_support_screen.dart`)**:
   - Tabbed screen: **Support Tickets** and **Contact & FAQ**.
   - Ticket submission bottom sheet: Category (`Payment & Billing`, `Ride Issue`, `Vehicle & Route`, `Account & KYC`, `App Problem`, `Other`), Priority (`Low`, `Medium`, `High`, `Urgent`), Subject, and detailed Description.
   - Ticket thread conversation modal: Live message history between driver and support team with real-time reply capability.

---

### B. User App (Flutter)
1. **Customer Support Ticket System (`user-app/lib/screens/profile/help_support_screen.dart`)**:
   - Dual-tab interface: **Support Tickets** and **FAQ & Contact**.
   - "+ Ticket" creation modal: Category (`Ride Issue`, `Payment & Refund`, `Driver Issue`, `Booking & Cancellation`, `App Problem`, `Other`), Priority selection, Subject, and Description.
   - Ticket list with status badges (`OPEN`, `IN PROGRESS`, `RESOLVED`, `CLOSED`) and priority indicators.
   - Full conversation thread modal: Customers can view replies from the Admin support team and reply directly from the app.
   - Direct support contact action triggers (Support Chat, Call Support line, Email Support).

---

### C. Backend (Node.js & MongoDB)
1. **Driver Model Enhancement (`backend/src/models/Driver.model.js`)**:
   - Added `walletBalance` field with non-negative constraints.
   - Added `bankDetails` subdocument (`accountHolderName`, `accountNumber`, `ifscCode`, `bankName`, `upiId`).
2. **Payout Model (`backend/src/models/Payout.model.js`)**:
   - Structured payout requests (`payoutId`, `driver`, `amount`, `payoutMethod`, `accountDetails`, `status`, `requestedAt`, `processedAt`, `processedBy`, `transactionReference`, `adminNotes`, `rejectionReason`).
3. **Support Ticket Model (`backend/src/models/SupportTicket.model.js`)**:
   - Handles multi-party support tickets (`ticketId`, `creatorType`, `customer`, `driver`, `booking`, `subject`, `category`, `priority`, `status`, `messages` array, `resolvedAt`, `resolvedBy`, `adminNotes`).
4. **Automated Wallet Credit in Earning Service (`backend/src/services/earning.service.js`)**:
   - Credits driver's `walletBalance` automatically upon completion of rides paid online.
   - Manages platform commission deductions accurately.
5. **Driver & Admin Earnings/Payout Controller (`backend/src/controllers/earnings.controller.js`)**:
   - `getDriverEarningsDashboard`: Today vs lifetime calculations, wallet balance, 7-day distance graph, and trip breakdown.
   - `requestPayout`: Validates balance, locks funds, creates payout record with prefix `PO-YYYYMMDD-XXXX`.
   - `getDriverPayouts`: Payout history for driver.
   - `getAdminPayouts`: Admin view of all payouts with status filtering.
   - `updatePayoutStatus`: Admin marks payout as `Paid` (with UTR/IMPS reference) or `Rejected` (which automatically refunds funds to the driver wallet).
6. **Support Ticket Controller (`backend/src/controllers/ticket.controller.js`)**:
   - `createTicket`: Creates ticket for rider or driver.
   - `getMyTickets`: Retrieves tickets for current authenticated user.
   - `getTicketById`: Retrieves ticket and full message thread.
   - `replyToTicket`: Adds response from customer, driver, or admin.
   - `getAdminTickets`: Admin ticket list with filtering by role and status.
   - `updateTicketStatus`: Admin status management (`In Progress`, `Resolved`, `Closed`).

---

### D. Admin Panel (Next.js 15)
1. **Sidebar Navigation (`admin-panel/components/layout/sidebar.tsx`)**:
   - Added **Driver Payouts** (`/payouts`, `Banknote` icon).
   - Added **Support Tickets** (`/tickets`, `LifeBuoy` icon).
2. **Driver Payouts Management (`admin-panel/app/(admin)/payouts/page.tsx`)**:
   - Overview metrics: Pending Requests, Pending Amount, Settled/Paid Total, Total Requests Volume.
   - Status filters: `All`, `Pending`, `Processing`, `Paid`, `Rejected`.
   - Real-time search across driver name, phone, payout ID, and transaction references.
   - "Mark as Paid" action modal: Prompts for Transaction Reference (UTR / IMPS) and optional settlement note.
   - "Reject" action modal: Prompts for rejection reason; system auto-refunds the amount back to the driver's wallet.
3. **Support Tickets Management (`admin-panel/app/(admin)/tickets/page.tsx`)**:
   - Overview metrics: Total Tickets, Open Tickets, Customer Inquiries, Driver Inquiries.
   - Role filters (`Customer`, `Driver`, `All`) and Status filters (`Open`, `In Progress`, `Resolved`, `Closed`).
   - Chat Thread Modal: Full conversation viewer with distinction between customer/driver messages and admin replies.
   - In-thread status changer and direct reply textarea.
4. **Rides & Bookings Management (`admin-panel/app/(admin)/rides/page.tsx`)**:
   - Category navigation tabs:
     - **All Bookings**
     - **Ongoing Bookings** (`Trip Started`, `Driver Arrived`, `Driver Assigned`, `Driver Accepted`, `Confirmed`)
     - **Upcoming Bookings** (`Pending`, `Searching Driver`)
     - **Completed Bookings** (`Trip Completed`)
     - **Cancelled Bookings** (`Cancelled by Customer`, `Cancelled by Driver`, `Cancelled by Admin`)
   - Category badges with real-time count of bookings.
   - Detailed trip drill-down via existing `/rides/[id]` route.

---

## 2. Verification Checklist

| Feature | Platform | Verification State |
|---|---|---|
| Earnings UI (Today vs Lifetime + Graph) | Driver App | Verified |
| Request Payout & Wallet Balance deduction | Driver App & Backend | Verified |
| Payout History & Status Badges | Driver App | Verified |
| Mark as Paid with UTR Reference | Admin Panel & Backend | Verified |
| Payout Rejection & Instant Wallet Refund | Admin Panel & Backend | Verified |
| Booking Category Tabs (Ongoing, Upcoming, etc.) | Admin Panel | Verified |
| Booking Details Modal/Page | Admin Panel | Verified |
| Support Ticket Submission & Thread View | Driver App | Verified |
| Support Ticket Submission & Thread View | User App | Verified |
| Admin Support Tickets Desk & Reply System | Admin Panel & Backend | Verified |

