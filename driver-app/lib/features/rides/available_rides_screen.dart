import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/skeleton_loader.dart';
import '../../core/widgets/app_button.dart';
import 'package:intl/intl.dart';

class AvailableRidesScreen extends StatefulWidget {
  const AvailableRidesScreen({super.key});

  @override
  State<AvailableRidesScreen> createState() => _AvailableRidesScreenState();
}

class _AvailableRidesScreenState extends State<AvailableRidesScreen> {
  bool _loading = true;
  bool _refreshing = false;
  String _errorMsg = '';
  List<dynamic> _availableRides = [];
  String? _acceptingRideId;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() {
      if (!_refreshing) _loading = true;
      _errorMsg = '';
    });

    try {
      final res = await ApiService.get('/driver/bookings/rides/available');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body)['data'];
        if (data != null && data['rides'] != null) {
          _availableRides = data['rides'];
        }
      } else {
        throw Exception('Failed to load available rides');
      }
    } catch (e) {
      if (mounted) setState(() => _errorMsg = 'Failed to load rides. Please check your connection.');
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _refreshing = false;
        });
      }
    }
  }

  Future<void> _onRefresh() async {
    _refreshing = true;
    await _fetchData();
  }

  Future<void> _acceptRide(dynamic ride) async {
    final rideId = ride['_id']?.toString() ?? '';
    if (rideId.isEmpty) return;
    
    setState(() => _acceptingRideId = rideId);
    
    try {
      final res = await ApiService.post('/driver/bookings/rides/$rideId/accept');
      if (!mounted) return;
      
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ride accepted successfully!')),
        );
        context.pushReplacement('/tabs?tab=1'); // Go to My Rides
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to accept ride. It may no longer be available.')),
        );
        _onRefresh();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error. Please try again.')),
      );
    } finally {
      if (mounted) {
        setState(() => _acceptingRideId = null);
      }
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('MMM d, h:mm a').format(date.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Available Requests'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: _loading && !_refreshing
          ? ListView.builder(
              padding: const EdgeInsets.all(24),
              itemCount: 4,
              itemBuilder: (_, __) => const Padding(
                padding: EdgeInsets.only(bottom: 14),
                child: SkeletonCard(height: 180),
              ),
            )
          : _errorMsg.isNotEmpty && !_refreshing
              ? ErrorStateWidget(
                  title: 'Oops!',
                  message: _errorMsg,
                  onRetry: _onRefresh,
                )
              : RefreshIndicator(
                  color: AppColors.gold,
                  backgroundColor: AppColors.surface,
                  onRefresh: _onRefresh,
                  child: _availableRides.isEmpty
                      ? ListView(
                          children: const [
                            SizedBox(height: 100),
                            EmptyState(
                              icon: Icons.radar,
                              title: 'No requests right now',
                              subtitle: 'When passengers request rides in your area, they will appear here.',
                            )
                          ],
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(24, 24, 24, 100),
                          itemCount: _availableRides.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 16),
                          itemBuilder: (context, i) => _rideCard(context, _availableRides[i]),
                        ),
                ),
    );
  }

  Widget _rideCard(BuildContext context, dynamic ride) {
    final fare = (ride['finalFare'] ?? ride['estimatedFare'] ?? 0).toDouble();
    final pickup = ride['pickupLocation']?['address'] ?? 'Unknown Pickup';
    final drop = ride['dropoffLocation']?['address'] ?? 'Unknown Dropoff';
    final dist = (ride['distance'] ?? 0).toDouble();
    final date = ride['createdAt'] != null ? DateTime.tryParse(ride['createdAt']) ?? DateTime.now() : DateTime.now();
    final rideId = ride['_id']?.toString() ?? '';
    final isAccepting = _acceptingRideId == rideId;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: cardDecoration(radius: 20, context: context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: AppColors.info.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                child: const Text('Available', style: TextStyle(color: AppColors.info, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
              Text(
                '₹${fare.toStringAsFixed(0)}',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.circle, size: 8, color: AppColors.gold),
              const SizedBox(width: 8),
              Expanded(
                child: Text(pickup, style: TextStyle(color: AppColors.textPrimary, fontSize: 14), overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(left: 3.5),
            child: SizedBox(
              height: 16,
              child: VerticalDivider(color: AppColors.divider, thickness: 1, width: 1),
            ),
          ),
          Row(
            children: [
              Icon(Icons.location_on, size: 8, color: AppColors.textMuted),
              const SizedBox(width: 8),
              Expanded(
                child: Text(drop, style: TextStyle(color: AppColors.textSecondary, fontSize: 14), overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Distance: ${dist.toStringAsFixed(1)} km', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              Text(_formatDate(date), style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: AppButton(
              label: 'Accept Ride',
              isLoading: isAccepting,
              onPressed: isAccepting || _acceptingRideId != null ? null : () => _acceptRide(ride),
            ),
          ),
        ],
      ),
    );
  }
}
