'use client';

import * as React from 'react';
import apiClient from '@/lib/axios';
import { 
  Banknote, Search, CheckCircle2, XCircle, 
  RefreshCw, AlertCircle, Building2, Smartphone 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format } from 'date-fns';

interface PayoutRecord {
  _id: string;
  payoutId: string;
  driver?: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    walletBalance: number;
  };
  amount: number;
  payoutMethod: 'Bank Transfer' | 'UPI';
  accountDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  status: 'Pending' | 'Processing' | 'Paid' | 'Rejected';
  requestedAt: string;
  processedAt?: string;
  transactionReference?: string;
  adminNotes?: string;
  rejectionReason?: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = React.useState<PayoutRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  
  // Dashboard stats
  const [stats, setStats] = React.useState({
    pendingCount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalCount: 0,
  });

  // Action Dialogs
  const [selectedPayout, setSelectedPayout] = React.useState<PayoutRecord | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = React.useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [transactionRef, setTransactionRef] = React.useState('');
  const [adminNote, setAdminNote] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [actionSubmitting, setActionSubmitting] = React.useState(false);

  const fetchPayouts = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const res = await apiClient.get('/earnings/admin/payouts', { params });
      if (res.data?.success) {
        const list: PayoutRecord[] = res.data.data.payouts || [];
        setPayouts(list);

        // Calculate quick summary metrics
        const pending = list.filter(p => p.status === 'Pending' || p.status === 'Processing');
        const paid = list.filter(p => p.status === 'Paid');
        setStats({
          pendingCount: pending.length,
          pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
          paidAmount: paid.reduce((sum, p) => sum + p.amount, 0),
          totalCount: list.length,
        });
      }
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleMarkAsPaid = async () => {
    if (!selectedPayout) return;
    setActionSubmitting(true);
    try {
      await apiClient.patch(`/earnings/admin/payouts/${selectedPayout._id}/status`, {
        status: 'Paid',
        transactionReference: transactionRef,
        adminNotes: adminNote,
      });
      setIsPayModalOpen(false);
      setSelectedPayout(null);
      setTransactionRef('');
      setAdminNote('');
      fetchPayouts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update payout status');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleRejectPayout = async () => {
    if (!selectedPayout) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejecting the payout.');
      return;
    }
    setActionSubmitting(true);
    try {
      await apiClient.patch(`/earnings/admin/payouts/${selectedPayout._id}/status`, {
        status: 'Rejected',
        rejectionReason: rejectionReason,
        adminNotes: adminNote,
      });
      setIsRejectModalOpen(false);
      setSelectedPayout(null);
      setRejectionReason('');
      setAdminNote('');
      fetchPayouts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject payout');
    } finally {
      setActionSubmitting(false);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const idMatch = p.payoutId?.toLowerCase().includes(term);
    const driverMatch = p.driver?.fullName?.toLowerCase().includes(term);
    const phoneMatch = p.driver?.phoneNumber?.includes(term);
    const refMatch = p.transactionReference?.toLowerCase().includes(term);
    return idMatch || driverMatch || phoneMatch || refMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30">Pending Approval</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30">Processing</Badge>;
      case 'Paid':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Paid & Settled</Badge>;
      case 'Rejected':
        return <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30">Rejected</Badge>;
      default:
        return <Badge className="bg-zinc-800 text-zinc-300">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-yellow-400">Driver Payouts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Banknote className="h-6 w-6 text-yellow-400" />
            Driver Payout Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Review driver withdrawal requests, process transfers, and record settlement details.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchPayouts}
          className="border-white/10 text-white bg-transparent hover:bg-zinc-900"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 shadow-md">
          <p className="text-xs font-medium text-zinc-400">Pending Requests</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pendingCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Awaiting verification</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 shadow-md">
          <p className="text-xs font-medium text-zinc-400">Pending Amount</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">₹{stats.pendingAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-zinc-500 mt-1">To be disbursed</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 shadow-md">
          <p className="text-xs font-medium text-zinc-400">Total Settled (Paid)</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">₹{stats.paidAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-zinc-500 mt-1">Disbursed to drivers</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 shadow-md">
          <p className="text-xs font-medium text-zinc-400">Total Payout Volume</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Requests recorded</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-white/5">
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Processing', 'Paid', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-yellow-400 text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by ID, driver, UTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 h-9 text-xs"
          />
        </div>
      </div>

      {/* Payouts Table */}
      <div className="rounded-xl border border-white/10 bg-zinc-950 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50 text-zinc-400 text-xs font-semibold">
                <th className="py-3.5 px-4">Payout ID</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method & Details</th>
                <th className="py-3.5 px-4">Requested Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-5 bg-zinc-800 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <AlertCircle className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                    No payout requests found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => {
                  const isPending = p.status === 'Pending' || p.status === 'Processing';
                  return (
                    <tr key={p._id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Payout ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-yellow-400 text-xs">
                        {p.payoutId}
                      </td>

                      {/* Driver */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{p.driver?.fullName || 'Unknown Driver'}</span>
                          <span className="text-xs text-zinc-500">{p.driver?.phoneNumber || 'No Phone'}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="text-base font-bold text-white">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Method & Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                            {p.payoutMethod === 'Bank Transfer' ? (
                              <Building2 className="h-3.5 w-3.5 text-blue-400" />
                            ) : (
                              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                            )}
                            {p.payoutMethod}
                          </span>
                          {p.payoutMethod === 'Bank Transfer' ? (
                            <span className="text-zinc-500 font-mono">
                              A/C: {p.accountDetails?.accountNumber || 'N/A'} • IFSC: {p.accountDetails?.ifscCode || 'N/A'}
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-mono">
                              UPI: {p.accountDetails?.upiId || 'N/A'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Requested Date */}
                      <td className="py-3.5 px-4 text-xs text-zinc-400">
                        {p.requestedAt ? format(new Date(p.requestedAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(p.status)}
                        {p.transactionReference && (
                          <div className="text-[11px] text-zinc-500 font-mono mt-1">
                            Ref: {p.transactionReference}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPayout(p);
                                setIsPayModalOpen(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3"
                            >
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                              Mark as Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayout(p);
                                setIsRejectModalOpen(true);
                              }}
                              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs h-8 px-3"
                            >
                              <XCircle className="mr-1.5 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MARK AS PAID DIALOG */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              Confirm Driver Payment
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Confirm that you have transferred ₹{selectedPayout?.amount.toLocaleString('en-IN')} to{' '}
              <strong className="text-white">{selectedPayout?.driver?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-zinc-900/70 rounded-lg border border-white/5 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Payout ID:</span>
                <span className="font-mono text-zinc-300">{selectedPayout?.payoutId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payout Method:</span>
                <span className="text-zinc-300 font-medium">{selectedPayout?.payoutMethod}</span>
              </div>
              {selectedPayout?.payoutMethod === 'Bank Transfer' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Account No:</span>
                    <span className="font-mono text-white">{selectedPayout?.accountDetails?.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">IFSC Code:</span>
                    <span className="font-mono text-white">{selectedPayout?.accountDetails?.ifscCode}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-zinc-500">UPI ID:</span>
                  <span className="font-mono text-white">{selectedPayout?.accountDetails?.upiId}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Transaction Reference / UTR Number *</label>
              <Input
                placeholder="e.g. UTR1234567890 / IMPS Ref"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Admin Note (Optional)</label>
              <Textarea
                placeholder="Optional settlement note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs resize-none h-20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPayModalOpen(false)}
              className="border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={actionSubmitting || !transactionRef.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              {actionSubmitting ? 'Processing...' : 'Confirm & Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT PAYOUT DIALOG */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-400">
              <XCircle className="h-5 w-5" />
              Reject Payout Request
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Rejecting this request will automatically refund{' '}
              <strong className="text-emerald-400">₹{selectedPayout?.amount}</strong> back to the driver&apos;s
              wallet balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Rejection Reason *</label>
              <Textarea
                placeholder="Explain why this request is rejected (e.g. Invalid bank IFSC / mismatched account name)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs resize-none h-24"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              className="border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectPayout}
              disabled={actionSubmitting || !rejectionReason.trim()}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
            >
              {actionSubmitting ? 'Rejecting...' : 'Reject Request & Refund Wallet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
