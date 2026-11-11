import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Driver Privacy Policy - Go Long Drive | ETCHTECH GLOBAL SOLUTIONS LLP',
  description: 'Official Driver Partner Privacy Policy for GoLongDrive Driver App published on Google Play by ETCHTECH GLOBAL SOLUTIONS LLP and operated by Aaryav Technologies.',
};

export default function DriverPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-6 sm:p-10 border border-slate-200">
        
        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-300">
            Official Driver Partner Policy
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-300">
            Package: com.golongdrive.driverapp
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
            Publisher: ETCHTECH GLOBAL SOLUTIONS LLP
          </span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full border border-indigo-300">
            Operated by: Aaryav Technologies
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Driver Partner Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Last Updated &amp; Effective Date: November 11, 2026
        </p>

        {/* Section 1 Identification Card */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 mb-8 text-slate-900 space-y-2">
          <h2 className="text-base font-bold text-amber-950 mb-3 border-b border-amber-200 pb-2">
            1. App &amp; Developer / Publisher Identification
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>App name:</strong> GoLongDrive Driver (Go Long Drive Driver Partner App)</p>
            <p><strong>Package name:</strong> <code>com.golongdrive.driverapp</code> (development identifier: <code>com.example.golongdrive</code>)</p>
            <p><strong>Developer / Publisher on Google Play:</strong> ETCHTECH GLOBAL SOLUTIONS LLP</p>
            <p><strong>Registered address:</strong> 1st Floor, 581, D1, Atrium Coworks, Anna Salai, Teynampet, Chennai - 600006, India</p>
            <p><strong>Developed and operated by:</strong> Aaryav Technologies, Near Raj Hotel, Bavisa Faliya, Silvassa - 396230, India</p>
            <p><strong>Contact email:</strong> <a href="mailto:support@golongdrive.online" className="text-blue-600 font-medium hover:underline">support@golongdrive.online</a></p>
            <p><strong>Official Website:</strong> <a href="https://golongdrive.online" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">https://golongdrive.online</a></p>
            <p><strong>Public Account Deletion URL:</strong> <a href="https://golongdrive.online/account-deletion" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">https://golongdrive.online/account-deletion</a></p>
            <p className="pt-2 text-xs text-amber-900 font-semibold italic border-t border-amber-200/60">
              This policy applies to the GoLongDrive Driver app published on Google Play by ETCHTECH GLOBAL SOLUTIONS LLP.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          <section>
            <p>
              ETCHTECH GLOBAL SOLUTIONS LLP (&quot;Publisher&quot;) and Aaryav Technologies (&quot;Operator&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;Company&quot;) operate the <strong>GoLongDrive Driver</strong> mobile application (&quot;Driver App&quot;) and the GoLongDrive Platform. We are committed to maintaining the privacy, confidentiality, and data protection of all registered driver partners (&quot;Driver&quot;, &quot;you&quot;, or &quot;driver partner&quot;). This Driver Privacy Policy comprehensively explains how we collect, use, store, process, and disclose your personal, location, vehicle, and financial data when you register, accept ride requests, provide transportation services, and receive payouts through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              2. Information We Collect from Driver Partners
            </h2>
            <p className="mb-3">
              To register, verify, dispatch rides, calculate fares, and disburse payouts, GoLongDrive Driver collects the following categories of information:
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">A. Driver Profile &amp; Authentication Data</h3>
                <p className="text-sm text-slate-600">
                  Full legal name, date of birth, gender, profile photograph (captured via device camera or gallery), mobile phone number (used for login authentication and rider communication), email address, encrypted account password (stored securely as a salted cryptographic hash via bcrypt; plain text passwords are never stored or accessible), and residential address (street address, city, state, PIN code).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">B. Vehicle Information &amp; Verification Documents (KYC)</h3>
                <p className="text-sm text-slate-600">
                  Vehicle make/brand, model, registration number, category (Sedan, SUV, Hatchback, Premium), fuel type, year of manufacture, available passenger seats, AC availability, and exterior front photo of the vehicle. Know Your Customer (KYC) verification documents include: Government-issued Commercial Driving License (DL front and back photos), Vehicle Registration Certificate (RC front and back photos), Motor Vehicle Insurance Policy document, Pollution Under Control (PUC) Certificate, and Aadhaar Card (front and back photos) for identity verification.
                </p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-950 mb-1">C. Precise Location Information (Foreground Service Location)</h3>
                <p className="text-sm text-amber-900 mb-2">
                  <strong>Foreground Service Location Disclosure:</strong> GoLongDrive Driver accesses precise geographic location data (using GPS, Wi-Fi, and cellular network signals) when the driver is toggled &quot;Online&quot; and available to receive trip requests, as well as throughout the duration of an active ride.
                </p>
                <p className="text-xs text-amber-900 font-semibold mb-1">Persistent Notification &amp; Service Type:</p>
                <p className="text-xs text-amber-900 mb-2">
                  Location updates operate via an Android Foreground Service (type: <code>FOREGROUND_SERVICE_LOCATION</code>) accompanied by an ongoing, visible notification in the device notification bar (&quot;GoLongDrive Driver - Running in background / Online for rides&quot;). The app does <strong>NOT</strong> request or use the <code>ACCESS_BACKGROUND_LOCATION</code> permission.
                </p>
                <p className="text-xs text-amber-900 font-semibold mb-1">Why Location is Collected:</p>
                <ul className="list-disc pl-5 text-xs text-amber-900/90 space-y-1">
                  <li><strong>Ride Dispatch &amp; Matching:</strong> To determine your current vehicle location and dispatch nearby customer pickup requests to you.</li>
                  <li><strong>Turn-by-Turn Navigation &amp; Route Display:</strong> To guide you from your current location to the rider&apos;s pickup point and subsequent destination via Google Maps.</li>
                  <li><strong>Accurate Fare Calculation:</strong> To calculate total distance traveled and elapsed trip time for fair, transparent fare computation.</li>
                  <li><strong>Passenger Live Tracking:</strong> To share your vehicle&apos;s live approaching coordinates with the booking passenger so they can track pickup arrival.</li>
                </ul>
                <p className="text-xs text-slate-500 mt-2 italic">
                  * Location tracking ceases immediately when you toggle your status to &quot;Offline&quot; or log out of the Driver App. You can also revoke location permissions at any time via Android System Settings. We never sell location data to third-party advertisers.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">D. Trip Operations &amp; Safety Data</h3>
                <p className="text-sm text-slate-600">
                  4-Digit passenger ride PIN (entered by the driver upon arrival to verify passenger identity and begin the journey), pickup arrival timestamps, trip start and completion timestamps, route polyline waypoint logs, total distance traveled, and trip duration.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">E. Financial &amp; Payout Information</h3>
                <p className="text-sm text-slate-600">
                  Bank account number, bank name, account holder name, and IFSC code, or UPI ID (Virtual Payment Address). Driver earnings ledger including daily earnings, completed trip fare breakdowns, platform commission deductions, and withdrawal request history with manual bank/UPI settlement reference numbers.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">F. Support Inquiries</h3>
                <p className="text-sm text-slate-600">
                  Inquiries or grievances submitted to our help desk (category, description, submitted images, and support resolution messages).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              3. How We Use Driver Information
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li><strong>Verification &amp; Compliance:</strong> To authenticate identity, check driver license validity, verify vehicle commercial eligibility, and activate driver accounts.</li>
              <li><strong>Trip Allocation &amp; Dispatch:</strong> To match available drivers with nearby passengers based on real-time vehicle location.</li>
              <li><strong>Live Route Guidance:</strong> To provide real-time navigation directions from pickup to drop-off.</li>
              <li><strong>Trip Verification:</strong> To authenticate passenger boarding using the 4-digit ride start PIN.</li>
              <li><strong>Fare Computation:</strong> To accurately calculate distance-based and time-based ride charges upon trip completion.</li>
              <li><strong>Payout Processing:</strong> To calculate driver earnings and disburse payouts directly to the driver&apos;s submitted bank account or UPI ID.</li>
              <li><strong>Safety &amp; Accountability:</strong> To display vehicle details and driver identity to the assigned passenger.</li>
              <li><strong>Customer Support:</strong> To investigate and resolve partner inquiries, payment disputes, or operational questions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              4. Data Sharing and Disclosure
            </h2>
            <p className="mb-3">
              We do not sell, rent, or monetize driver personal information. Data is shared strictly as necessary to deliver platform services:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li>
                <strong>With Assigned Passengers:</strong> When you accept a ride booking, the passenger is provided your first name, driver profile photo, vehicle make, model, category, license plate number, real-time GPS location, and ETA. Tapping the call button opens the device dialer to coordinate pickup; standard cellular calling displays your actual telephone number to the passenger, and theirs to you. Sensitive banking details, home addresses, and government ID numbers are NEVER disclosed to passengers.
              </li>
              <li>
                <strong>Google Maps Platform:</strong> To provide map rendering, route polyline calculations, and distance measurements.
              </li>
              <li>
                <strong>Real-Time Infrastructure:</strong> Secure WebSocket servers to synchronize trip requests, acceptance, and live coordinates between drivers, passengers, and platform backend.
              </li>
              <li>
                <strong>Payout Processing:</strong> Driver payout requests are verified by platform administrators and disbursed via direct bank transfer (NEFT/IMPS/RTGS) or UPI; no automated payout gateway SDK executes inside the driver mobile app.
              </li>
              <li>
                <strong>Legal &amp; Regulatory Obligations:</strong> When legally mandated under the Motor Vehicles Act, Indian Information Technology Act, or a valid judicial order.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              5. Data Retention &amp; Security Safeguards
            </h2>
            <p>
              All data exchanged between the GoLongDrive Driver App and backend servers is encrypted in transit using industry-standard Transport Layer Security (TLS/SSL). Passwords are protected using salted cryptographic hashes (bcrypt). Sensitive financial records are accessible only to authorized finance administrators. KYC verification documents, vehicle records, and driver profiles are retained for the duration of active partnership and archived as required under statutory Indian tax and transport laws.
            </p>
          </section>

          <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              6. Driver Account Deletion &amp; Data Rights
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              Driver partners have full control over their personal data and account status:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1 mb-3">
              <li><strong>In-App Option:</strong> Open the GoLongDrive Driver App &rarr; Navigate to Profile &rarr; Settings &rarr; Tap &quot;Delete Account&quot;.</li>
              <li>
                <strong>Web Deletion Portal:</strong> Visit our public{' '}
                <Link href="/account-deletion" className="text-blue-600 font-semibold hover:underline">
                  Account Deletion Portal
                </Link>{' '}
                (Select &quot;Driver&quot; user type and submit your registered phone number).
              </li>
              <li><strong>Email Request:</strong> Email <a href="mailto:support@golongdrive.online" className="text-blue-600 hover:underline">support@golongdrive.online</a> with the subject line &quot;Driver Account Deletion Request&quot; from your registered email address.</li>
            </ul>
            <p className="text-xs text-slate-500">
              Personal identity data, stored KYC documents, and vehicle photos are scheduled for permanent deletion from active databases within 30 days. Completed ride invoices, tax records, and payout transactions are retained in secure archives solely for statutory auditing, tax compliance, and legal liability requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              7. Android Permissions Requested
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              The GoLongDrive Driver App requests only the permissions necessary to operate its core features:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li><code>ACCESS_FINE_LOCATION</code> &amp; <code>ACCESS_COARSE_LOCATION</code>: Used to obtain precise and approximate GPS coordinates for ride dispatch, route navigation, and distance calculation.</li>
              <li><code>FOREGROUND_SERVICE</code> &amp; <code>FOREGROUND_SERVICE_LOCATION</code>: Used to maintain continuous GPS location updates and navigation while the driver is Online or engaged in an active ride, accompanied by an ongoing notification.</li>
              <li><code>FOREGROUND_SERVICE_DATA_SYNC</code>: Used for reliable real-time trip status synchronization with backend servers.</li>
              <li><code>WAKE_LOCK</code>: Keeps the device screen active during navigation so drivers can safely reference route directions without screen timeouts.</li>
              <li><code>RECEIVE_BOOT_COMPLETED</code>: Ensures local notification channels and background services initialize reliably after a device reboot.</li>
              <li><code>INTERNET</code> &amp; <code>ACCESS_NETWORK_STATE</code>: Used to establish secure TLS connections with backend APIs and real-time WebSocket servers.</li>
              <li><strong>Camera &amp; Photo Library Access (Image Picker):</strong> Requested at runtime when the driver captures or uploads profile photos, vehicle photos, and KYC documents (Aadhaar, Driving License, RC, Insurance, PUC).</li>
              <li><strong>Device Phone Dialer (url_launcher with tel: scheme):</strong> Tapping the call button opens the phone&apos;s native dialer with the passenger&apos;s number pre-filled. The app does not declare or require the dangerous <code>CALL_PHONE</code> permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              8. Changes to this Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect operational, technological, or regulatory developments. When updates are published, the &quot;Last Updated&quot; date will be revised. Continued use of the GoLongDrive Driver platform following updates signifies acceptance of the revised policy.
            </p>
          </section>

          <section className="p-5 bg-slate-100 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              9. Developer &amp; Publisher Contact Information
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              For questions, document verification inquiries, or grievance redressal regarding this policy, please contact our Legal &amp; Privacy team:
            </p>
            <div className="text-sm text-slate-800 space-y-1">
              <p><strong>App name:</strong> GoLongDrive Driver (Go Long Drive Driver Partner App)</p>
              <p><strong>Package name:</strong> <code>com.golongdrive.driverapp</code> (development identifier: <code>com.example.golongdrive</code>)</p>
              <p><strong>Developer / Publisher on Google Play:</strong> ETCHTECH GLOBAL SOLUTIONS LLP</p>
              <p><strong>Registered address:</strong> 1st Floor, 581, D1, Atrium Coworks, Anna Salai, Teynampet, Chennai - 600006, India</p>
              <p><strong>Developed and operated by:</strong> Aaryav Technologies, Near Raj Hotel, Bavisa Faliya, Silvassa - 396230, India</p>
              <p><strong>Contact email:</strong> <a href="mailto:support@golongdrive.online" className="text-blue-600 hover:underline">support@golongdrive.online</a></p>
              <p><strong>Official Website:</strong> <a href="https://golongdrive.online" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://golongdrive.online</a></p>
              <p><strong>Public Account Deletion URL:</strong> <a href="https://golongdrive.online/account-deletion" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://golongdrive.online/account-deletion</a></p>
              <p><strong>Country / Jurisdiction:</strong> India</p>
              <p className="pt-2 text-xs text-slate-500 italic">
                This policy applies to the GoLongDrive Driver app published on Google Play by ETCHTECH GLOBAL SOLUTIONS LLP.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
