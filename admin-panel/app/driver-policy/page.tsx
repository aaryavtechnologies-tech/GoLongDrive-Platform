import React from 'react';

export default function DriverPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy for Drivers</h1>
        <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>As a driver on our platform, we collect information necessary to facilitate rides and comply with local regulations. This includes: name, email, phone number, driving license, vehicle registration, insurance documents, background check information, and continuous location data while you are active on the app.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Location Data</h2>
            <p>We collect precise or approximate location data from your mobile device when the app is running in the foreground or background. This data is essential to match you with ride requests, navigate to pickup/drop-off locations, and provide safety features.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Deletion</h2>
            <p>You can request to delete your account and associated data at any time by visiting our <a href="/account-deletion" className="text-blue-600 hover:underline">Account Deletion</a> page. Note that we may be legally required to retain certain transaction and compliance records even after account deletion.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
