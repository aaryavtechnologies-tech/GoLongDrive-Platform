'use client';

import * as React from 'react';
import apiClient from '@/lib/axios';
import { 
  LifeBuoy, Search, MessageSquare, Send, CheckCircle2, 
  AlertCircle, RefreshCw, User, ShieldCheck, Tag
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

interface TicketMessage {
  senderType: 'Customer' | 'Driver' | 'Admin';
  senderName: string;
  message: string;
  sentAt: string;
}

interface SupportTicket {
  _id: string;
  ticketId: string;
  creatorType: 'Customer' | 'Driver';
  customer?: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  driver?: {
    _id: string;
    fullName: string;
    phoneNumber: string;
  };
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [creatorFilter, setCreatorFilter] = React.useState<string>('All');

  // Selected ticket for Thread modal
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
  const [isThreadOpen, setIsThreadOpen] = React.useState(false);
  const [replyMessage, setReplyMessage] = React.useState('');
  const [replySending, setReplySending] = React.useState(false);
  const [statusUpdating, setStatusUpdating] = React.useState(false);

  const fetchTickets = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (creatorFilter !== 'All') params.creatorType = creatorFilter;

      const res = await apiClient.get('/tickets/admin/all', { params });
      if (res.data?.success) {
        setTickets(res.data.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, creatorFilter]);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const refreshCurrentTicket = async (ticketId: string) => {
    try {
      const res = await apiClient.get(`/tickets/${ticketId}`);
      if (res.data?.success) {
        setSelectedTicket(res.data.data.ticket);
      }
    } catch (e) {
      console.error('Failed to reload ticket thread:', e);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setReplySending(true);
    try {
      await apiClient.post(`/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage.trim(),
      });
      setReplyMessage('');
      await refreshCurrentTicket(selectedTicket._id);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setReplySending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    setStatusUpdating(true);
    try {
      await apiClient.patch(`/tickets/admin/${selectedTicket._id}/status`, {
        status: newStatus,
      });
      await refreshCurrentTicket(selectedTicket._id);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const idMatch = t.ticketId?.toLowerCase().includes(term);
    const subMatch = t.subject?.toLowerCase().includes(term);
    const custMatch = t.customer?.fullName?.toLowerCase().includes(term) || t.customer?.phoneNumber?.includes(term);
    const driverMatch = t.driver?.fullName?.toLowerCase().includes(term) || t.driver?.phoneNumber?.includes(term);
    return idMatch || subMatch || custMatch || driverMatch;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <Badge className="bg-red-500/10 text-red-400 border border-red-500/30">Urgent</Badge>;
      case 'High':
        return <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/30">High</Badge>;
      case 'Medium':
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30">Medium</Badge>;
      case 'Low':
      default:
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30">Open</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30">In Progress</Badge>;
      case 'Resolved':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Resolved</Badge>;
      case 'Closed':
        return <Badge className="bg-zinc-800 text-zinc-400 border border-white/5">Closed</Badge>;
      default:
        return <Badge className="bg-zinc-800 text-zinc-300">{status}</Badge>;
    }
  };

  const openTicketsCount = tickets.filter(t => t.status === 'Open').length;
  const customerTicketsCount = tickets.filter(t => t.creatorType === 'Customer').length;
  const driverTicketsCount = tickets.filter(t => t.creatorType === 'Driver').length;

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
                <BreadcrumbPage className="text-yellow-400">Support Tickets</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-yellow-400" />
            Support Ticket Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Review inquiries, chat directly with drivers and riders, and resolve platform issues.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchTickets}
          className="border-white/10 text-white bg-transparent hover:bg-zinc-900"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 shadow-md">
          <p className="text-xs font-medium text-zinc-400">Total Tickets</p>
          <p className="text-2xl font-bold text-white mt-1">{tickets.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Across all users</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 shadow-md">
          <p className="text-xs font-medium text-zinc-400">Open Tickets</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{openTicketsCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Needs attention</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 shadow-md">
          <p className="text-xs font-medium text-zinc-400">Customer Inquiries</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{customerTicketsCount}</p>
          <p className="text-xs text-zinc-500 mt-1">From user app</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 shadow-md">
          <p className="text-xs font-medium text-zinc-400">Driver Inquiries</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{driverTicketsCount}</p>
          <p className="text-xs text-zinc-500 mt-1">From driver app</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Creator Filter */}
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            {['All', 'Customer', 'Driver'].map((type) => (
              <button
                key={type}
                onClick={() => setCreatorFilter(type)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  creatorFilter === type
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {type === 'All' ? 'All Roles' : `${type}s`}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-yellow-400 text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search tickets, subject, user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 h-9 text-xs"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl border border-white/10 bg-zinc-950 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50 text-zinc-400 text-xs font-semibold">
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Subject & Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Created Date</th>
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
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <AlertCircle className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                    No support tickets match the current filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const isCustomer = t.creatorType === 'Customer';
                  const user = isCustomer ? t.customer : t.driver;

                  return (
                    <tr key={t._id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-yellow-400 text-xs">
                        {t.ticketId}
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCustomer ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {t.creatorType}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-white text-xs">{user?.fullName || 'Anonymous'}</span>
                            <span className="text-[11px] text-zinc-500">{user?.phoneNumber || 'No Phone'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col max-w-[280px]">
                          <span className="font-medium text-white text-xs truncate">{t.subject}</span>
                          <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Tag className="h-3 w-3 text-zinc-600" />
                            {t.category}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        {getPriorityBadge(t.priority)}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-zinc-400">
                        {t.createdAt ? format(new Date(t.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(t.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(t);
                            setIsThreadOpen(true);
                          }}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs h-8 px-3"
                        >
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                          Chat Thread ({t.messages?.length || 0})
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHAT THREAD MODAL */}
      <Dialog open={isThreadOpen} onOpenChange={setIsThreadOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-zinc-900/50 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-yellow-400">{selectedTicket?.ticketId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedTicket?.creatorType === 'Customer' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                  }`}>
                    {selectedTicket?.creatorType}: {selectedTicket?.creatorType === 'Customer' ? selectedTicket.customer?.fullName : selectedTicket?.driver?.fullName}
                  </span>
                  {selectedTicket && getPriorityBadge(selectedTicket.priority)}
                </div>
                <h3 className="text-sm font-semibold text-white mt-1">{selectedTicket?.subject}</h3>
                <p className="text-xs text-zinc-500">Category: {selectedTicket?.category}</p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-white/5">
                <span className="text-[11px] text-zinc-500 ml-1">Status:</span>
                <select
                  value={selectedTicket?.status || 'Open'}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={statusUpdating}
                  aria-label="Ticket Status"
                  className="bg-zinc-800 text-white text-xs rounded px-2 py-1 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conversation messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px] max-h-[420px] bg-black/20">
            {selectedTicket?.messages?.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No messages yet in this ticket thread.
              </div>
            ) : (
              selectedTicket?.messages?.map((m, idx) => {
                const isAdmin = m.senderType === 'Admin';
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-zinc-500">
                      {isAdmin ? (
                        <>
                          <ShieldCheck className="h-3 w-3 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">{m.senderName || 'Admin Support'}</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 text-zinc-400" />
                          <span className="text-zinc-300 font-medium">{m.senderName || selectedTicket.creatorType}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{m.sentAt ? format(new Date(m.sentAt), 'hh:mm a') : ''}</span>
                    </div>

                    <div className={`p-3 rounded-xl max-w-[80%] text-xs leading-relaxed ${
                      isAdmin 
                        ? 'bg-yellow-400/10 text-white border border-yellow-400/20 rounded-tr-none'
                        : 'bg-zinc-900 text-zinc-200 border border-white/5 rounded-tl-none'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Input Box */}
          <div className="p-3 border-t border-white/10 bg-zinc-950 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Textarea
                placeholder="Type response to driver/customer..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white text-xs resize-none h-18 min-h-[60px]"
              />
              <Button
                onClick={handleSendReply}
                disabled={replySending || !replyMessage.trim()}
                className="bg-yellow-400 hover:bg-yellow-500 text-black h-full px-4"
              >
                <Send className={`h-4 w-4 ${replySending ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
            <div className="flex justify-between items-center text-[11px] text-zinc-500">
              <span>This response will be instantly visible in their mobile app.</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsThreadOpen(false)}
                className="text-zinc-400 hover:text-white text-xs h-6 px-2"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
