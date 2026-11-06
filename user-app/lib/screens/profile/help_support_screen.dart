// lib/screens/profile/help_support_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/data/api_client.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/faq_item.dart';
import '../../widgets/back_button.dart';

/// Help & Support — reached from Profile > "Help & Support".
///
/// Features:
/// 1. Tabbed Interface: "Support Tickets" & "FAQ & Contact"
/// 2. Ticket History: List of user tickets with real-time status badges
/// 3. Create Ticket: Bottom sheet form for reporting issues (category, priority, subject, description)
/// 4. Conversation Thread: Interactive chat dialog showing ticket discussion between customer & admin
/// 5. FAQ accordion + direct phone/email contact options
class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int? _expandedIndex;

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
      final res = await ApiClient.get('/tickets/my-tickets');
      if (res.statusCode == 200) {
        final d = jsonDecode(res.body)['data'];
        if (mounted) {
          setState(() {
            _tickets = d['tickets'] ?? [];
          });
        }
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loadingTickets = false);
    }
  }

  void _openCreateTicketSheet() {
    final formKey = GlobalKey<FormState>();
    final subjectController = TextEditingController();
    final descController = TextEditingController();
    String category = 'Ride Issue';
    String priority = 'Medium';
    bool submitting = false;

    final colors = AppColors.of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: colors.surface,
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
                      Text(
                        'Submit Support Ticket',
                        style: AppTextStyles.subtitle.copyWith(
                          color: colors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.close, color: colors.textSecondary),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Category
                  Text('Category', style: TextStyle(color: colors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: category,
                    dropdownColor: colors.surface,
                    style: TextStyle(color: colors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: colors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: colors.divider)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: colors.divider)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5A93C))),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'Ride Issue', child: Text('Ride Issue')),
                      DropdownMenuItem(value: 'Payment & Refund', child: Text('Payment & Refund')),
                      DropdownMenuItem(value: 'Driver Issue', child: Text('Driver Issue')),
                      DropdownMenuItem(value: 'Booking & Cancellation', child: Text('Booking & Cancellation')),
                      DropdownMenuItem(value: 'App Problem', child: Text('App Problem')),
                      DropdownMenuItem(value: 'Other', child: Text('Other')),
                    ],
                    onChanged: (v) => setModalState(() => category = v!),
                  ),
                  const SizedBox(height: 14),

                  // Priority
                  Text('Priority', style: TextStyle(color: colors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    value: priority,
                    dropdownColor: colors.surface,
                    style: TextStyle(color: colors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: colors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: colors.divider)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: colors.divider)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5A93C))),
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
                  Text('Subject', style: TextStyle(color: colors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: subjectController,
                    style: TextStyle(color: colors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Brief summary of the issue',
                      hintStyle: TextStyle(color: colors.textSecondary.withValues(alpha: 0.6)),
                      filled: true,
                      fillColor: colors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: colors.divider)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: colors.divider)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5A93C))),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter a subject' : null,
                  ),
                  const SizedBox(height: 14),

                  // Description
                  Text('Description', style: TextStyle(color: colors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: descController,
                    maxLines: 4,
                    style: TextStyle(color: colors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Describe the problem in detail...',
                      hintStyle: TextStyle(color: colors.textSecondary.withValues(alpha: 0.6)),
                      filled: true,
                      fillColor: colors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: colors.divider)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: colors.divider)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5A93C))),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Please enter details' : null,
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: submitting
                          ? null
                          : () async {
                              if (!formKey.currentState!.validate()) return;
                              setModalState(() => submitting = true);

                              try {
                                final res = await ApiClient.post(
                                  '/tickets',
                                  body: jsonEncode({
                                    'category': category,
                                    'priority': priority,
                                    'subject': subjectController.text.trim(),
                                    'description': descController.text.trim(),
                                  }),
                                );

                                if (res.statusCode == 201) {
                                  if (ctx.mounted) Navigator.pop(ctx);
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Support ticket created successfully! We will get back to you shortly.'),
                                        backgroundColor: Color(0xFF3B916E),
                                      ),
                                    );
                                    _fetchTickets();
                                  }
                                } else {
                                  final err = jsonDecode(res.body)['message'] ?? 'Failed to create ticket';
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(err), backgroundColor: Colors.red),
                                    );
                                  }
                                }
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
                                  );
                                }
                              } finally {
                                if (setModalState.toString().isNotEmpty) {
                                  setModalState(() => submitting = false);
                                }
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE5A93C),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: submitting
                          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                          : const Text('Submit Ticket', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _openTicketThread(dynamic ticket) {
    final ticketId = ticket['_id'] ?? '';
    final ticketCode = ticket['ticketId'] ?? 'Ticket';
    final colors = AppColors.of(context);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: colors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => _TicketThreadModal(
        ticketId: ticketId,
        ticketCode: ticketCode,
        initialTicket: ticket,
        onRefreshNeeded: _fetchTickets,
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'open':
        return const Color(0xFFE5A93C);
      case 'in progress':
      case 'inprogress':
        return Colors.blue;
      case 'resolved':
        return const Color(0xFF3B916E);
      case 'closed':
        return Colors.grey;
      default:
        return Colors.amber;
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return Colors.red;
      case 'high':
        return Colors.deepOrange;
      case 'medium':
        return const Color(0xFFE5A93C);
      case 'low':
      default:
        return const Color(0xFF3B916E);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: Row(
                children: [
                  AppBackButton(onPressed: () => Navigator.of(context).pop()),
                  const SizedBox(width: 16),
                  Text('Help & Support', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Tab bar
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              decoration: BoxDecoration(
                color: colors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: colors.divider),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: const Color(0xFFE5A93C),
                  borderRadius: BorderRadius.circular(12),
                ),
                labelColor: Colors.black,
                unselectedLabelColor: colors.textSecondary,
                labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                dividerColor: Colors.transparent,
                padding: const EdgeInsets.all(4),
                tabs: const [
                  Tab(text: 'Support Tickets'),
                  Tab(text: 'FAQ & Contact'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTicketsTab(colors),
                  _buildFaqTab(colors),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTicketsTab(AppColorPalette colors) {
    if (_loadingTickets) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFFE5A93C)));
    }

    return RefreshIndicator(
      onRefresh: _fetchTickets,
      color: const Color(0xFFE5A93C),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
        children: [
          // Banner & Create Ticket Button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFFE5A93C).withValues(alpha: 0.15),
                  const Color(0xFFE5A93C).withValues(alpha: 0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE5A93C).withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE5A93C).withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.support_agent, color: Color(0xFFE5A93C), size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Need Assistance?',
                        style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Report an issue with your ride, billing, or driver.',
                        style: TextStyle(color: colors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: _openCreateTicketSheet,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE5A93C),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    elevation: 0,
                  ),
                  child: const Text('+ Ticket', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'Your Tickets (${_tickets.length})',
            style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          if (_tickets.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
              alignment: Alignment.center,
              child: Column(
                children: [
                  Icon(Icons.mark_chat_unread_outlined, size: 54, color: colors.textSecondary.withValues(alpha: 0.4)),
                  const SizedBox(height: 12),
                  Text('No Support Tickets', style: TextStyle(color: colors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text(
                    'You have not submitted any support tickets yet. Tap "+ Ticket" if you need any help.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: colors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
            )
          else
            ..._tickets.map((t) {
              final status = t['status'] ?? 'Open';
              final priority = t['priority'] ?? 'Medium';
              final subject = t['subject'] ?? 'Untitled';
              final category = t['category'] ?? 'General';
              final ticketId = t['ticketId'] ?? 'TCK';
              final messages = (t['messages'] as List?) ?? [];
              final createdAt = t['createdAt'] != null ? DateTime.tryParse(t['createdAt']) : null;
              final formattedDate = createdAt != null ? DateFormat('dd MMM, hh:mm a').format(createdAt) : '';

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: colors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: colors.divider),
                ),
                child: Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => _openTicketThread(t),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(ticketId, style: const TextStyle(color: Color(0xFFE5A93C), fontWeight: FontWeight.bold, fontSize: 12)),
                              Row(
                                children: [
                                  // Priority badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: _getPriorityColor(priority).withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      priority,
                                      style: TextStyle(color: _getPriorityColor(priority), fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  // Status badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(status).withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      status.toUpperCase(),
                                      style: TextStyle(
                                        color: _getStatusColor(status),
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(subject, style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
                          const SizedBox(height: 4),
                          Text(category, style: TextStyle(color: colors.textSecondary, fontSize: 12)),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.forum_outlined, size: 14, color: colors.textSecondary),
                                  const SizedBox(width: 4),
                                  Text('${messages.length} messages', style: TextStyle(color: colors.textSecondary, fontSize: 11)),
                                ],
                              ),
                              Text(formattedDate, style: TextStyle(color: colors.textSecondary, fontSize: 11)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildFaqTab(AppColorPalette colors) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
      children: [
        _buildContactRow(colors),
        const SizedBox(height: 24),
        Text('Frequently Asked Questions', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary))
            .animate()
            .fadeIn(delay: 120.ms, duration: 300.ms),
        const SizedBox(height: 12),
        ...List.generate(mockFaqs.length, (index) {
          final faq = mockFaqs[index];
          final expanded = _expandedIndex == index;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _FaqTile(
              faq: faq,
              expanded: expanded,
              onTap: () => setState(() {
                _expandedIndex = expanded ? null : index;
              }),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildContactRow(AppColorPalette colors) {
    return Row(
      children: [
        Expanded(
          child: _ContactAction(
            icon: Icons.chat_bubble_outline,
            label: 'Support Chat',
            onTap: () {
              _tabController.animateTo(0);
              _openCreateTicketSheet();
            },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ContactAction(
            icon: Icons.call_outlined,
            label: 'Call',
            onTap: () async {
              final uri = Uri.parse('tel:+919876543210');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri);
              } else {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Support line: +91 98765 43210')));
                }
              }
            },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ContactAction(
            icon: Icons.mail_outline,
            label: 'Email',
            onTap: () async {
              final uri = Uri.parse('mailto:support@golongdrive.com?subject=Customer%20Support%20Request');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri);
              } else {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Support email: support@golongdrive.com')));
                }
              }
            },
          ),
        ),
      ],
    ).animate().fadeIn(delay: 80.ms, duration: 300.ms);
  }
}

class _TicketThreadModal extends StatefulWidget {
  final String ticketId;
  final String ticketCode;
  final dynamic initialTicket;
  final VoidCallback onRefreshNeeded;

  const _TicketThreadModal({
    required this.ticketId,
    required this.ticketCode,
    required this.initialTicket,
    required this.onRefreshNeeded,
  });

  @override
  State<_TicketThreadModal> createState() => _TicketThreadModalState();
}

class _TicketThreadModalState extends State<_TicketThreadModal> {
  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  List<dynamic> _messages = [];
  bool _sending = false;
  bool _loading = false;
  String _status = 'Open';

  @override
  void initState() {
    super.initState();
    _messages = (widget.initialTicket['messages'] as List?) ?? [];
    _status = widget.initialTicket['status'] ?? 'Open';
    _fetchDetails();
  }

  @override
  void dispose() {
    _msgController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchDetails() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient.get('/tickets/${widget.ticketId}');
      if (res.statusCode == 200) {
        final d = jsonDecode(res.body)['data']['ticket'];
        if (mounted) {
          setState(() {
            _messages = d['messages'] ?? [];
            _status = d['status'] ?? _status;
          });
        }
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _sendReply() async {
    final text = _msgController.text.trim();
    if (text.isEmpty) return;

    setState(() => _sending = true);
    try {
      final res = await ApiClient.post(
        '/tickets/${widget.ticketId}/reply',
        body: jsonEncode({'message': text}),
      );

      if (res.statusCode == 200) {
        _msgController.clear();
        await _fetchDetails();
        widget.onRefreshNeeded();
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent + 60,
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOut,
          );
        }
      } else {
        final err = jsonDecode(res.body)['message'] ?? 'Failed to send reply';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err), backgroundColor: Colors.red));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final isClosed = _status.toLowerCase() == 'closed' || _status.toLowerCase() == 'resolved';

    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 16, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.ticketCode, style: const TextStyle(color: Color(0xFFE5A93C), fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(
                      widget.initialTicket['subject'] ?? 'Support Thread',
                      style: TextStyle(color: colors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                IconButton(
                  icon: Icon(Icons.close, color: colors.textSecondary),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          Divider(color: colors.divider, height: 1),

          // Messages List
          Expanded(
            child: _loading && _messages.isEmpty
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFE5A93C)))
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (ctx, idx) {
                      final m = _messages[idx];
                      final senderType = (m['senderType'] ?? '').toString().toLowerCase();
                      final isUser = senderType == 'customer' || senderType == 'user' || senderType == 'driver';
                      final text = m['message'] ?? '';
                      final date = m['sentAt'] != null ? DateTime.tryParse(m['sentAt']) : null;
                      final timeStr = date != null ? DateFormat('hh:mm a').format(date) : '';

                      return Align(
                        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: isUser ? const Color(0xFFE5A93C) : colors.surfaceCard,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(14),
                              topRight: const Radius.circular(14),
                              bottomLeft: isUser ? const Radius.circular(14) : const Radius.circular(2),
                              bottomRight: isUser ? const Radius.circular(2) : const Radius.circular(14),
                            ),
                            border: isUser ? null : Border.all(color: colors.divider),
                          ),
                          child: Column(
                            crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                            children: [
                              if (!isUser) ...[
                                const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.support_agent, size: 14, color: Color(0xFFE5A93C)),
                                    SizedBox(width: 4),
                                    Text('Support Team', style: TextStyle(color: Color(0xFFE5A93C), fontSize: 11, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                              ],
                              Text(
                                text,
                                style: TextStyle(
                                  color: isUser ? Colors.black : colors.textPrimary,
                                  fontSize: 13,
                                  height: 1.3,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                timeStr,
                                style: TextStyle(
                                  color: isUser ? Colors.black.withValues(alpha: 0.6) : colors.textSecondary.withValues(alpha: 0.6),
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Input field
          if (!isClosed)
            Container(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              decoration: BoxDecoration(
                color: colors.surface,
                border: Border(top: BorderSide(color: colors.divider)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgController,
                      style: TextStyle(color: colors.textPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Type your reply...',
                        hintStyle: TextStyle(color: colors.textSecondary.withValues(alpha: 0.6)),
                        filled: true,
                        fillColor: colors.background,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide(color: colors.divider)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color(0xFFE5A93C),
                    ),
                    child: IconButton(
                      icon: _sending
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                          : const Icon(Icons.send, color: Colors.black, size: 18),
                      onPressed: _sending ? null : _sendReply,
                    ),
                  ),
                ],
              ),
            )
          else
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              color: colors.surfaceCard,
              child: Text(
                'This ticket is $_status. You cannot send replies.',
                textAlign: TextAlign.center,
                style: TextStyle(color: colors.textSecondary, fontSize: 12),
              ),
            ),
        ],
      ),
    );
  }
}

class _ContactAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ContactAction({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Icon(icon, color: colors.accentIcon, size: 22),
              const SizedBox(height: 8),
              Text(label, style: AppTextStyles.caption.copyWith(color: colors.textPrimary)),
            ],
          ),
        ),
      ),
    );
  }
}

class _FaqTile extends StatelessWidget {
  final FaqItem faq;
  final bool expanded;
  final VoidCallback onTap;

  const _FaqTile({required this.faq, required this.expanded, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(child: Text(faq.question, style: AppTextStyles.body.copyWith(color: colors.textPrimary))),
                  Icon(
                    expanded ? Icons.remove_circle_outline : Icons.add_circle_outline,
                    color: colors.accentIcon,
                    size: 20,
                  ),
                ],
              ),
              AnimatedCrossFade(
                firstChild: const SizedBox(width: double.infinity, height: 0),
                secondChild: Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(faq.answer, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
                ),
                crossFadeState:
                    expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 200),
                sizeCurve: Curves.easeInOut,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
