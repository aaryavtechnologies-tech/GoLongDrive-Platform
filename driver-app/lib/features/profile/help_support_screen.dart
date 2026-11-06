import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/card_decoration.dart';

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _tickets = [];
  bool _loadingTickets = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchTickets();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchTickets() async {
    setState(() => _loadingTickets = true);
    try {
      final res = await ApiService.get('/tickets/my-tickets');
      if (res.statusCode == 200) {
        final d = jsonDecode(res.body)['data'];
        setState(() {
          _tickets = d['tickets'] ?? [];
        });
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loadingTickets = false);
    }
  }

  void _openCreateTicketDialog() {
    final formKey = GlobalKey<FormState>();
    final subjectController = TextEditingController();
    final descController = TextEditingController();
    String category = 'Payment & Billing';
    String priority = 'Medium';
    bool submitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).viewInsets.bottom + 24),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Submit Support Ticket', style: AppText.cardHeadline),
                      IconButton(
                        icon: Icon(Icons.close, color: AppColors.textSecondary),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Category
                  Text('Category', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: category,
                    dropdownColor: AppColors.surface,
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.borderSubtle2)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'Payment & Billing', child: Text('Payment & Billing')),
                      DropdownMenuItem(value: 'Ride Issue', child: Text('Ride Issue')),
                      DropdownMenuItem(value: 'Vehicle & Route', child: Text('Vehicle & Route')),
                      DropdownMenuItem(value: 'Account & KYC', child: Text('Account & KYC')),
                      DropdownMenuItem(value: 'App Problem', child: Text('App Problem')),
                      DropdownMenuItem(value: 'Other', child: Text('Other')),
                    ],
                    onChanged: (v) => setModalState(() => category = v!),
                  ),
                  const SizedBox(height: 14),

                  // Priority
                  Text('Priority', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: priority,
                    dropdownColor: AppColors.surface,
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppColors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.borderSubtle2)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'Low', child: Text('Low')),
                      DropdownMenuItem(value: 'Medium', child: Text('Medium')),
                      DropdownMenuItem(value: 'High', child: Text('High')),
                      DropdownMenuItem(value: 'Urgent', child: Text('Urgent')),
                    ],
                    onChanged: (v) => setModalState(() => priority = v!),
                  ),
                  const SizedBox(height: 14),

                  // Subject
                  Text('Subject', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: subjectController,
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Brief summary of the issue',
                      hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                      filled: true,
                      fillColor: AppColors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.borderSubtle2)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Please enter a subject' : null,
                  ),
                  const SizedBox(height: 14),

                  // Description
                  Text('Description', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: descController,
                    maxLines: 4,
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Provide details about your problem...',
                      hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                      filled: true,
                      fillColor: AppColors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.borderSubtle2)),
                      contentPadding: const EdgeInsets.all(14),
                    ),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Please provide a description' : null,
                  ),
                  const SizedBox(height: 24),

                  AppButton(
                    label: submitting ? 'Submitting...' : 'Submit Ticket',
                    onPressed: submitting
                        ? null
                        : () async {
                            if (!formKey.currentState!.validate()) return;
                            setModalState(() => submitting = true);
                            try {
                              final res = await ApiService.post('/tickets', body: {
                                'subject': subjectController.text.trim(),
                                'category': category,
                                'priority': priority,
                                'description': descController.text.trim(),
                              });
                              if (res.statusCode == 201 || res.statusCode == 200) {
                                if (!mounted) return;
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Support ticket submitted! Our team will respond shortly.'),
                                    backgroundColor: AppColors.success,
                                  ),
                                );
                                _fetchTickets();
                              }
                            } catch (_) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Failed to submit ticket')),
                                );
                              }
                            } finally {
                              setModalState(() => submitting = false);
                            }
                          },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _viewTicketDetails(Map<String, dynamic> ticket) {
    final replyController = TextEditingController();
    bool sendingReply = false;
    final ticketId = ticket['_id'] ?? ticket['ticketId'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDetailState) {
          final messages = (ticket['messages'] as List<dynamic>?) ?? [];
          final status = (ticket['status'] ?? 'Open').toString();

          return Padding(
            padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 20),
            child: SizedBox(
              height: MediaQuery.of(context).size.height * 0.7,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(ticket['ticketId'] ?? 'Ticket',
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          SizedBox(
                            width: MediaQuery.of(context).size.width * 0.65,
                            child: Text(
                              ticket['subject'] ?? 'Subject',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _statusColor(status).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: _statusColor(status).withValues(alpha: 0.3)),
                        ),
                        child: Text(status,
                            style: TextStyle(color: _statusColor(status), fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const Divider(height: 20),

                  // Messages list
                  Expanded(
                    child: ListView.builder(
                      itemCount: messages.length,
                      itemBuilder: (context, idx) {
                        final msg = messages[idx];
                        final isDriver = msg['sender'] == 'driver';
                        final senderName = msg['senderName'] ?? (isDriver ? 'You' : 'Admin Support');
                        final text = msg['message'] ?? '';
                        final time = msg['createdAt'] != null
                            ? DateTime.tryParse(msg['createdAt'])?.toLocal().toString().split('.')[0]
                            : '';

                        return Align(
                          alignment: isDriver ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                            decoration: BoxDecoration(
                              color: isDriver ? AppColors.gold.withValues(alpha: 0.15) : AppColors.background,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isDriver ? AppColors.gold.withValues(alpha: 0.3) : AppColors.borderSubtle2,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: isDriver ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                              children: [
                                Text(senderName,
                                    style: TextStyle(
                                        color: isDriver ? AppColors.gold : AppColors.textPrimary,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text(text, style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                                const SizedBox(height: 4),
                                Text(time ?? '', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  // Reply box if not closed
                  if (status != 'Closed')
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: replyController,
                            style: TextStyle(color: AppColors.textPrimary, fontSize: 14),
                            decoration: InputDecoration(
                              hintText: 'Type your message...',
                              hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 13),
                              filled: true,
                              fillColor: AppColors.background,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppColors.borderSubtle2)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: sendingReply
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold))
                              : const Icon(Icons.send, color: AppColors.gold),
                          onPressed: sendingReply
                              ? null
                              : () async {
                                  final msg = replyController.text.trim();
                                  if (msg.isEmpty) return;
                                  setDetailState(() => sendingReply = true);
                                  try {
                                    final res = await ApiService.post('/tickets/$ticketId/reply', body: {'message': msg});
                                    if (res.statusCode == 200) {
                                      final updated = jsonDecode(res.body)['data']['ticket'];
                                      setDetailState(() {
                                        ticket['messages'] = updated['messages'];
                                        replyController.clear();
                                      });
                                      _fetchTickets();
                                    }
                                  } catch (_) {
                                  } finally {
                                    setDetailState(() => sendingReply = false);
                                  }
                                },
                        ),
                      ],
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'Resolved':
        return AppColors.success;
      case 'In Progress':
        return Colors.blue;
      case 'Closed':
        return AppColors.textMuted;
      case 'Open':
      default:
        return AppColors.gold;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Help & Support', style: AppText.cardHeadline),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.gold,
          labelColor: AppColors.gold,
          unselectedLabelColor: AppColors.textSecondary,
          tabs: const [
            Tab(text: 'Support Tickets'),
            Tab(text: 'Contact & FAQ'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Support Tickets
          _buildTicketsTab(),
          // Tab 2: Contact & FAQs
          _buildContactFaqTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.gold,
        onPressed: _openCreateTicketDialog,
        icon: const Icon(Icons.add, color: Colors.black),
        label: const Text('New Ticket', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildTicketsTab() {
    if (_loadingTickets) {
      return const Center(child: CircularProgressIndicator(color: AppColors.gold));
    }
    if (_tickets.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.support_agent_outlined, size: 56, color: AppColors.textMuted),
              const SizedBox(height: 16),
              Text('No Support Tickets', style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Have a problem or question? Tap "New Ticket" below to reach our support team directly.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.gold,
      onRefresh: _fetchTickets,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 90),
        itemCount: _tickets.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (ctx, i) {
          final t = _tickets[i];
          final status = (t['status'] ?? 'Open').toString();
          final subject = t['subject'] ?? 'Ticket';
          final category = t['category'] ?? 'Other';
          final ticketId = t['ticketId'] ?? 'TCK';
          final date = t['createdAt'] != null
              ? DateTime.tryParse(t['createdAt'])?.toLocal().toString().split('.')[0]
              : '';

          return InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => _viewTicketDetails(t),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: cardDecoration(context: context, radius: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(ticketId, style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _statusColor(status).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(status, style: TextStyle(color: _statusColor(status), fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(subject, style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(category, style: TextStyle(color: AppColors.gold, fontSize: 12, fontWeight: FontWeight.w600)),
                      const Spacer(),
                      if (date != null) Text(date, style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildContactFaqTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Contact Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: cardDecoration(context: context, radius: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Driver Helpline', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text('Available 24x7 for road assistance & urgent ride queries', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final uri = Uri.parse('tel:+918000000000');
                        if (await canLaunchUrl(uri)) await launchUrl(uri);
                      },
                      icon: const Icon(Icons.call, color: AppColors.gold, size: 18),
                      label: const Text('Call Us', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.gold),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final uri = Uri.parse('mailto:driver-support@golongdrive.online');
                        if (await canLaunchUrl(uri)) await launchUrl(uri);
                      },
                      icon: const Icon(Icons.email, color: AppColors.gold, size: 18),
                      label: const Text('Email', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.gold),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        Text('Frequently Asked Questions', style: AppText.sectionTitle),
        const SizedBox(height: 12),
        _faqTile('How do I withdraw my earnings?', 'Go to the Earnings tab, tap "Request Payout", enter your desired amount, and choose Bank Transfer or UPI.'),
        _faqTile('When are payouts processed?', 'Payout requests are typically verified and sent to your bank account or UPI ID within 24 hours.'),
        _faqTile('What if a passenger cancels after I arrive?', 'Cancellation charges will automatically apply and appear in your earnings balance.'),
        _faqTile('How does the passenger verify the ride start?', 'Ask the passenger for their 4-digit Ride PIN displayed on their app, and enter it to begin the journey.'),
      ],
    );
  }

  Widget _faqTile(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: cardDecoration(context: context, radius: 14),
      child: ExpansionTile(
        title: Text(question, style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
        iconColor: AppColors.gold,
        collapsedIconColor: AppColors.textSecondary,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(answer, style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.4)),
          ),
        ],
      ),
    );
  }
}
