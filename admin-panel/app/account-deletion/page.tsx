'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function AccountDeletionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'User',
    reason: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.golongdrive.online';
      const response = await fetch(`${apiUrl}/api/v1/public/deletion-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit request');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', userType: 'User', reason: '' });
    } catch (error: any) {
      console.error('Error submitting deletion request:', error);
      setStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-6 sm:p-10 border border-slate-200">
        
        {/* Header App & Publisher Identifiers */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-300">
            Go Long Drive
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">
            Publisher: ETCHTECH GLOBAL SOLUTIONS LLP
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Account &amp; Data Deletion Request
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          This page allows registered riders and drivers of <strong>Go Long Drive</strong> (published on Google Play by <strong>ETCHTECH GLOBAL SOLUTIONS LLP</strong>) to request the permanent deletion of their account and associated personal data.
        </p>

        {/* Informational Guidance Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 text-sm text-slate-700 space-y-3">
          <h2 className="font-bold text-slate-900 text-base">How Data Deletion Works:</h2>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
            <li><strong>Data Purged:</strong> Your profile details, email, phone number, saved addresses, and active login sessions will be permanently purged from active production servers within 30 days.</li>
            <li><strong>Data Retained:</strong> Historical billing invoices and financial transaction records will be retained in anonymized/archived form strictly as required by Indian taxation, transport, and commercial laws.</li>
            <li><strong>Alternative Email Option:</strong> You can also email us directly at <a href="mailto:support@golongdrive.online" className="text-blue-600 font-semibold underline">support@golongdrive.online</a> from your registered email address with the subject line &quot;Account Deletion Request&quot;.</li>
          </ul>
        </div>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6 text-sm">
            ✓ Your account deletion request has been submitted successfully. Our team will verify and process it within 7 business days.
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">I am registered as</label>
            <select
              required
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5 border bg-white"
              value={formData.userType}
              onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
            >
              <option value="User">User / Rider (Go Long Drive User App)</option>
              <option value="Driver">Driver / Partner (Go Long Drive Driver App)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Enter your registered full name"
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5 border"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Registered Email Address</label>
            <input
              type="email"
              required
              placeholder="Enter your registered email address"
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5 border"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Registered Phone Number</label>
            <input
              type="tel"
              required
              placeholder="Enter your registered mobile number"
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5 border"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Reason for Deletion (Optional)</label>
            <textarea
              rows={3}
              placeholder="Please share any feedback or reason for closing your account"
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5 border"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
          >
            {status === 'loading' ? 'Submitting Request...' : 'Submit Deletion Request'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <Link href="/user-policy" className="text-blue-600 hover:underline">
            &larr; Back to Go Long Drive Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
