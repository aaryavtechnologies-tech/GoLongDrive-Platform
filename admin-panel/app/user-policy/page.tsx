import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Go Long Drive | ETCHTECH GLOBAL SOLUTIONS LLP',
  description: 'Official Privacy Policy for Go Long Drive (com.golongdrive.userapp) published on Google Play by ETCHTECH GLOBAL SOLUTIONS LLP and operated by Aaryav Technologies.',
};

export default function UserPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-6 sm:p-10 border border-slate-200">
        
        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-300">
            Official Policy
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-300">
            Package: com.golongdrive.userapp
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
            Publisher: ETCHTECH GLOBAL SOLUTIONS LLP
          </span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full border border-indigo-300">
            Operated by: Aaryav Technologies
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Privacy Policy for Go Long Drive
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Last Updated &amp; Effective Date: November 11, 2026
        </p>

        {/* Executive Summary Box (Section 1 Identifiers) */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 mb-8 text-slate-900 space-y-2">
          <h2 className="text-base font-bold text-amber-950 mb-3 border-b border-amber-200 pb-2">
            App &amp; Developer Declaration
          </h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><strong>App name:</strong> Go Long Drive</p>
            <p><strong>Package name:</strong> <code>com.golongdrive.userapp</code></p>
            <p><strong>Developer / Publisher on Google Play:</strong> ETCHTECH GLOBAL SOLUTIONS LLP</p>
            <p><strong>Registered address:</strong> 1st Floor, 581, D1, Atrium Coworks, Anna Salai, Teynampet, Chennai - 600006, India</p>
            <p><strong>Developed and operated by:</strong> Aaryav Technologies, Near Raj Hotel, Bavisa Faliya, Silvassa - 396230, India</p>
            <p><strong>Contact email:</strong> <a href="mailto:support@golongdrive.online" className="text-blue-600 font-medium hover:underline">support@golongdrive.online</a></p>
            <p><strong>Official Website:</strong> <a href="https://golongdrive.online" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">https://golongdrive.online</a></p>
            <p className="pt-2 text-xs text-amber-900 font-semibold italic border-t border-amber-200/60">
              This policy applies to the Go Long Drive app published on Google Play by ETCHTECH GLOBAL SOLUTIONS LLP.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              1. Introduction
            </h2>
            <p>
              ETCHTECH GLOBAL SOLUTIONS LLP (&quot;Publisher&quot;) and Aaryav Technologies (&quot;Operator&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;, or &quot;Company&quot;, operating the GoLongDrive Platform) are committed to protecting the privacy, confidentiality, and security of all users (&quot;User&quot;, &quot;you&quot;, or &quot;passenger&quot;) who download, install, or use the <strong>Go Long Drive</strong> mobile application (Package ID: <code>com.golongdrive.userapp</code>). This Privacy Policy comprehensively details how we collect, use, store, process, and disclose your information when you utilize our cab booking, inter-city/long-distance transportation, city rides, and tour package reservation services.
            </p>
            <p className="mt-2">
              This policy applies to the Go Long Drive app published on Google Play by ETCHTECH GLOBAL SOLUTIONS LLP. By accessing or using Go Long Drive, you consent to the practices described in this Privacy Policy. If you do not agree with this policy, please do not download or use the application.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              To deliver a secure and seamless taxi booking experience, Go Long Drive collects the following categories of information:
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">A. Personal &amp; Account Information</h3>
                <p className="text-sm text-slate-600">
                  Full Name, Mobile Phone Number (used for account identification, SMS communications, and driver coordination), Email Address (for account authentication, booking confirmations, tax invoices, and service notices), Account Password (securely encrypted using salted bcrypt hashing on our backend), optional profile details (Gender, Date of Birth, Emergency Contact Name, and Emergency Contact Phone Number), and your platform-generated 4-digit Ride Confirmation PIN used to verify your assigned driver upon vehicle arrival.
                </p>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-950 mb-1">B. Precise and Approximate Location Information (Location Services)</h3>
                <p className="text-sm text-amber-900 mb-2">
                  <strong>Foreground Location Only:</strong> When you open and actively use Go Long Drive, we collect precise location data (using GPS) and approximate location data (using network/cellular signals) via Android permissions (<code>ACCESS_FINE_LOCATION</code> and <code>ACCESS_COARSE_LOCATION</code>).
                </p>
                <p className="text-xs text-amber-900 font-semibold mb-1">Purpose of Location Data:</p>
                <ul className="list-disc pl-5 text-xs text-amber-900/90 space-y-1">
                  <li>To automatically detect your pickup location on the interactive map and recommend nearby street addresses.</li>
                  <li>To calculate accurate driving routes, distances, and estimated travel duration using Google Maps.</li>
                  <li>To calculate transparent, distance-based trip fares.</li>
                  <li>To match your booking request with available drivers in your vicinity.</li>
                </ul>
                <div className="mt-2 pt-2 border-t border-amber-200/70 text-xs text-amber-950 font-medium">
                  <strong>No Background Location Tracking:</strong> Go Long Drive accesses location strictly in the foreground while the application is actively open on your screen. Go Long Drive <strong>does not</strong> collect background location (<code>ACCESS_BACKGROUND_LOCATION</code>) and <strong>does not</strong> run any background location tracking service when the application is closed or minimized. During an active trip, live driver movement shown on the map is streamed from our platform servers via real-time WebSockets, not tracked from your device&apos;s background GPS. We never sell or share location data with third-party advertisers.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">C. Booking, Travel &amp; Tour Details</h3>
                <p className="text-sm text-slate-600">
                  Pickup and drop-off addresses, geographic coordinates, selected vehicle category (e.g., Sedan, SUV, Premium), tour package bookings, destination itineraries, travel dates, package preferences, ride history, timestamps, ride statuses (Searching, Assigned, Started, Completed, Cancelled), and digital boarding passes.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">D. Financial &amp; Transaction Data</h3>
                <p className="text-sm text-slate-600">
                  Chosen payment method (online digital payments via Razorpay), final trip fare, advance amounts, Razorpay payment order IDs, payment date and timestamp, and transaction status. All digital payments are processed through Razorpay Software Private Limited (an RBI-authorized and PCI-DSS Level 1 certified gateway). Go Long Drive <strong>does not</strong> collect, process, or store credit/debit card numbers, CVVs, or netbanking passwords on our servers.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">E. Device &amp; Technical Information</h3>
                <p className="text-sm text-slate-600">
                  Device manufacturer, model, operating system version, network connection status, and basic application performance logs to maintain app stability and optimize user experience.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">F. Customer Support &amp; Communications</h3>
                <p className="text-sm text-slate-600">
                  Support ticket submissions, inquiry messages, feedback notes, and customer rating submissions sent to our helpdesk.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Information */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li><strong>Facilitating Transportation Services:</strong> Processing ride requests, matching passengers with nearby drivers, verifying rides using the 4-digit Ride PIN, and displaying live journey progress.</li>
              <li><strong>Fare Computation:</strong> Accurately calculating trip fares based on distance traveled, duration, and vehicle rates.</li>
              <li><strong>Communications:</strong> Sending transactional SMS, real-time socket alerts for driver arrival, trip updates, digital boarding passes, and receipts.</li>
              <li><strong>Security &amp; Fraud Prevention:</strong> Verifying customer identities, protecting against fraudulent transactions, and ensuring passenger safety.</li>
              <li><strong>Tour Packages &amp; Itineraries:</strong> Organizing and managing curated tour packages, sightseeing schedules, and customer inquiries.</li>
              <li><strong>Customer Support:</strong> Investigating and resolving ride disputes, payment inquiries, or support tickets.</li>
              <li><strong>Legal &amp; Regulatory Compliance:</strong> Complying with applicable transport regulations, tax laws, and lawful government requests.</li>
            </ul>
          </section>

          {/* 4. Sharing & Disclosure */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              4. Sharing and Disclosure of Information
            </h2>
            <p className="mb-3">
              We do <strong>not</strong> sell, rent, or trade your personal data to third-party data brokers or marketing agencies. We share information only under the following limited circumstances:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">A. With Assigned Drivers</h3>
                <p className="text-sm text-slate-600">
                  When a booking is confirmed, we share relevant details with the assigned driver solely to complete the trip: passenger&apos;s first name, pickup address, destination address, phone number (for pickup coordination), and the 4-digit Ride PIN (which the passenger reveals upon driver arrival to authorize journey start).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">B. With Third-Party Service Providers (SDKs &amp; Infrastructure)</h3>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>
                    <strong>1. Google Maps Platform (Google LLC):</strong> Uses <code>google_maps_flutter</code>, Google Places API, and Google Directions API to provide geocoding, address autocomplete, driving route polyline calculation, and interactive map displays.{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Google Privacy Policy
                    </a>.
                  </p>
                  <p>
                    <strong>2. Razorpay Software Private Limited:</strong> Uses <code>razorpay_flutter</code> to process secure digital payments (UPI, debit/credit cards, net banking).{' '}
                    <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Razorpay Privacy Policy
                    </a>.
                  </p>
                  <p>
                    <strong>3. Cloud Hosting &amp; Database Infrastructure:</strong> Secure encrypted cloud servers and MongoDB Atlas for database persistence.
                  </p>
                  <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-200/60">
                    * Note: Go Long Drive does not integrate Firebase (no Firebase Messaging, Crashlytics, or Analytics), Sentry, or third-party advertising SDKs.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <h3 className="font-semibold text-slate-900 mb-1">C. For Legal &amp; Safety Reasons</h3>
                <p className="text-sm text-slate-600">
                  We may disclose information if required by law, subpoena, court order, or governmental regulation, or when necessary to protect the safety, rights, or property of Go Long Drive, our users, or the general public.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Data Retention & Security */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              5. Data Retention and Security
            </h2>
            <p>
              We implement industry-standard technical and organizational security measures, including 256-bit SSL/TLS encryption for all data in transit, salted bcrypt password hashing on our backend servers, encrypted client token storage (<code>flutter_secure_storage</code> utilizing Android Keystore / EncryptedSharedPreferences), secure OTP verification for phone authentication, and role-based access restrictions to protect personal information against unauthorized access, alteration, or disclosure.
            </p>
            <p className="mt-2">
              We retain your account information, ride records, and invoices for as long as your account remains active, or as required by applicable tax, transportation, and accounting laws.
            </p>
          </section>

          {/* 6. Account & Data Deletion */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              6. Account &amp; Data Deletion Policy (Google Play Compliant)
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              Go Long Drive respects your right to control your personal data. You have the right to request the permanent deletion of your account and associated personal data at any time.
            </p>
            <div className="space-y-2 text-sm text-slate-700 mb-3">
              <p>
                <strong>1. Through the Mobile Application:</strong> Open Go Long Drive User App &rarr; Navigate to Profile &rarr; Tap &quot;Delete Account&quot; &rarr; Confirm your request in the dialog. The deletion request is automatically registered with our systems and your session will be safely logged out.
              </p>
              <p>
                <strong>2. Online Public Web Deletion Portal:</strong> Visit our designated web deletion page:{' '}
                <Link href="/account-deletion" className="text-blue-600 font-semibold hover:underline">
                  https://golongdrive.online/account-deletion
                </Link>
                . Submit your registered Name, Email, and Phone Number. Our team will verify and process your request within 7 business days.
              </p>
              <p>
                <strong>3. Email Request:</strong> You may send a deletion request from your registered email address to{' '}
                <a href="mailto:support@golongdrive.online" className="text-blue-600 font-semibold hover:underline">
                  support@golongdrive.online
                </a>{' '}
                with the subject line &quot;Account Deletion Request&quot;. Please include your full name and registered phone number.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs text-slate-500">
              <strong>What Happens Upon Account Deletion:</strong> Your profile details, email address, phone number, saved addresses, and active login tokens will be permanently erased from our active production databases within 30 days. Completed trip billing invoices and transactional audit records will be retained in anonymized archives strictly as mandated by Indian taxation, financial, and transport regulations.
            </div>
          </section>

          {/* 7. Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              7. Children&apos;s Privacy
            </h2>
            <p>
              Go Long Drive is intended solely for individuals aged 18 and older who can enter into legally binding contracts under applicable law. We do not knowingly solicit or collect personal information from children under the age of 18 (or 13 where applicable). If we become aware that a child has provided us with personal data without parental consent, we will promptly delete such information from our servers.
            </p>
          </section>

          {/* 8. Android Permissions */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              8. Permissions Requested by Go Long Drive (Android)
            </h2>
            <p className="mb-2 text-sm text-slate-600">
              Go Long Drive requests ONLY the following permissions, exactly as declared in the Android application manifest:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
              <li>
                <code>ACCESS_FINE_LOCATION</code>: Required to detect your precise GPS pickup location on the map, match nearby available cabs, and calculate driving routes.
              </li>
              <li>
                <code>ACCESS_COARSE_LOCATION</code>: Required for approximate network/cellular-based location detection.
              </li>
              <li>
                <code>INTERNET</code>: Required to connect to our secure backend API, stream real-time trip status via WebSockets, and process digital payments.
              </li>
              <li>
                <code>ACCESS_NETWORK_STATE</code>: Required to monitor network connectivity status and ensure seamless communication with platform services.
              </li>
            </ul>
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <p>
                <strong>Phone Dialing Notice:</strong> Tapping &quot;Call Driver&quot; in the application opens your device&apos;s native phone dialer via standard system intents (<code>tel:</code> protocol); Go Long Drive <strong>does not</strong> request or require direct phone call permissions (<code>CALL_PHONE</code>).
              </p>
              <p>
                <strong>No Unnecessary Permissions:</strong> Go Long Drive <strong>does not</strong> request or use background location (<code>ACCESS_BACKGROUND_LOCATION</code>), foreground services, camera permissions, photo/media storage permissions, or notification permissions.
              </p>
            </div>
          </section>

          {/* 9. Changes to Policy */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
              9. Changes to this Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect operational, technological, or legal developments. When updates are made, we will revise the &quot;Last Updated&quot; date at the top of this policy. Continued use of the Go Long Drive app after the posting of changes constitutes your acceptance of the revised policy.
            </p>
          </section>

          {/* 10. Contact Information (Preserved Exact Identifiers) */}
          <section className="p-5 bg-slate-100 rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              10. Developer Identifiers &amp; Grievance Contact Information
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              For any questions, concerns, feedback, or grievance redressal regarding this Privacy Policy or your personal data, please contact our designated Grievance / Privacy Officer:
            </p>
            <div className="text-sm text-slate-800 space-y-1">
              <p><strong>App name:</strong> Go Long Drive</p>
              <p><strong>Package name:</strong> <code>com.golongdrive.userapp</code></p>
              <p><strong>Developer / Publisher on Google Play:</strong> ETCHTECH GLOBAL SOLUTIONS LLP</p>
              <p><strong>Registered address:</strong> 1st Floor, 581, D1, Atrium Coworks, Anna Salai, Teynampet, Chennai - 600006, India</p>
              <p><strong>Developed and operated by:</strong> Aaryav Technologies, Near Raj Hotel, Bavisa Faliya, Silvassa - 396230, India</p>
              <p><strong>Contact email:</strong> <a href="mailto:support@golongdrive.online" className="text-blue-600 hover:underline">support@golongdrive.online</a></p>
              <p><strong>Official Website:</strong> <a href="https://golongdrive.online" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://golongdrive.online</a></p>
              <p><strong>Country / Jurisdiction:</strong> India</p>
              <p className="pt-2 text-xs text-slate-500 italic">
                This policy applies to the Go Long Drive app published on Google Play by ETCHTECH GLOBAL SOLUTIONS LLP.
              </p>
            </div>
          </section>

          {/* Footer Navigation Link */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Go Long Drive. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/account-deletion" className="text-blue-600 hover:underline font-medium">
                Request Account Deletion &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
