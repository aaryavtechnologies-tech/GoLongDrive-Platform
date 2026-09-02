import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/config/env_config.dart';
import '../../core/data/api_service.dart';
import '../../core/data/socket_service.dart';
import '../../core/widgets/app_loader.dart';
import '../../core/widgets/error_state.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/skeleton_loader.dart';

/// Dashboard Screen - Main hub for the driver.
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _online = false;
  bool _refreshing = false;
  bool _loading = true;
  String _errorMsg = '';
  
  String _driverName = 'Driver';
  String? _profileImg;
  int _todayEarnings = 0;
  int _tripsToday = 0;
  dynamic _ongoingRide;
  dynamic _nextRide;
  List<dynamic> _recentTxns = [];

  StreamSubscription<Map<String, dynamic>>? _rideRequestSub;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _initSocket();
  }

  /// Initialise socket and listen for incoming ride requests.
  Future<void> _initSocket() async {
    await SocketService.init();
    _rideRequestSub = SocketService.onRideRequest.listen((booking) {
      if (!mounted) return;
      // Navigate to IncomingRequestScreen with the booking data
      context.push('/rides/incoming', extra: {'booking': booking});
    });
  }

  @override
  void dispose() {
    _rideRequestSub?.cancel();
    super.dispose();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() {
      if (!_refreshing) _loading = true;
      _errorMsg = '';
    });

    try {
      // Use separate try-catch for critical profile data so it doesn't block the whole screen
      try {
        final profileRes = await ApiService.get('/driver/profile');
        if (profileRes.statusCode == 200) {
          final rawData = jsonDecode(profileRes.body)['data'];
          final d = rawData['driver'] ?? rawData;
          setState(() {
            _driverName = d['fullName'] ?? 'Driver';
            String? imgPath = d['profileImage'] ?? (d['documents'] != null ? d['documents']['selfiePhoto'] : null);
            if (imgPath != null && imgPath.isNotEmpty) {
              _profileImg = imgPath.startsWith('http') ? imgPath : '${EnvConfig.socketUrl}/$imgPath';
            } else {
              _profileImg = null;
            }
            _online = d['onlineStatus'] == 'online';
          });
        }
      } catch (e) {
        print('Dashboard Profile Error: $e');
      }

      final futures = await Future.wait([
        ApiService.get('/driver/dashboard'),
        ApiService.get('/earnings/driver/dashboard'),
        ApiService.get('/driver/rides/current'),
      ]);

      final dashboardRes = futures[0];
      final earningsRes = futures[1];
      final currentRideRes = futures[2];

      if (dashboardRes.statusCode == 200) {
        final d = jsonDecode(dashboardRes.body)['data'];
        setState(() {
          _tripsToday = d['stats']?['todayTrips'] ?? 0;
        });
      }
      
      if (earningsRes.statusCode == 200) {
        final d = jsonDecode(earningsRes.body)['data'];
        setState(() {
          _todayEarnings = (d['todayEarnings'] ?? 0).toInt();
          _recentTxns = d['recentTransactions'] ?? [];
        });
      }
      
      if (currentRideRes.statusCode == 200) {
        final d = jsonDecode(currentRideRes.body)['data'];
        setState(() {
          if (d != null && d['ride'] != null) {
            _ongoingRide = d['ride'];
          } else {
            _ongoingRide = null;
          }
        });
      }

    } catch (e) {
      print('Dashboard Data Error: $e');
      if (mounted) {
        setState(() => _errorMsg = 'Failed to load some dashboard data. Tap refresh to retry.');
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
          _refreshing = false;
        });
      }
    }
  }

  Future<void> _toggleStatus(bool val) async {
    final original = _online;
    setState(() => _online = val);
    try {
      final res = await ApiService.patch('/driver/status', body: {
        'onlineStatus': val ? 'online' : 'offline'
      });
      if (res.statusCode != 200) throw Exception();
    } catch (e) {
      setState(() => _online = original);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update status')),
        );
      }
    }
  }

  Future<void> _onRefresh() async {
    _refreshing = true;
    await _fetchData();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && !_refreshing) {
      return SafeArea(child: _dashboardSkeleton());
    }

    if (_errorMsg.isNotEmpty && !_refreshing) {
      return Scaffold(
        body: ErrorStateWidget(
          title: 'Oops!',
          message: _errorMsg,
          onRetry: _onRefresh,
        ),
      );
    }

    return SafeArea(
      child: RefreshIndicator(
        color: AppColors.gold,
        backgroundColor: AppColors.surface,
        onRefresh: _onRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- Header Section ---
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Good Morning', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                      const SizedBox(height: 4),
                      Text(_driverName, style: AppText.cardHeadline),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.refresh, color: AppColors.textSecondary),
                        onPressed: _onRefresh,
                      ),
                      InkWell(
                        onTap: () => context.push('/tabs?tab=3'),
                        borderRadius: BorderRadius.circular(22),
                        child: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.gold, width: 2),
                            image: _profileImg != null
                                ? DecorationImage(image: NetworkImage(_profileImg!), fit: BoxFit.cover)
                                : null,
                          ),
                          child: _profileImg == null ? const Icon(Icons.person, color: AppColors.gold) : null,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // --- Online/Offline Toggle ---
              // TODO: Backend - this needs to hit the 'update-status' endpoint
              Container(
                padding: const EdgeInsets.all(20),
                decoration: cardDecoration(radius: 24, context: context),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _online ? AppColors.success : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 12),
                          Text(
                            _online ? "You're Online" : "You're Offline",
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                          ),
                      ],
                    ),
                    Switch(
                      value: _online,
                      activeColor: Colors.black,
                      activeTrackColor: AppColors.gold,
                      inactiveTrackColor: AppColors.divider,
                      onChanged: _toggleStatus,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // --- Stat Cards ---
              Row(
                children: [
                  Expanded(
                    child: _statCard(
                      Icons.trending_up, 
                      AppColors.gold, 
                      "Today's Earnings", 
                      '₹$_todayEarnings',
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _statCard(
                      Icons.local_taxi, 
                      AppColors.info, 
                      'Trips Today', 
                      '$_tripsToday',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              if (_ongoingRide != null || _nextRide != null) ...[
                Text(
                  _ongoingRide != null ? 'Active Ride' : 'Upcoming Ride', 
                  style: AppText.sectionTitle,
                ),
                const SizedBox(height: 12),
                InkWell(
                  onTap: () {
                    if (_ongoingRide != null) {
                      context.push('/rides/current');
                    } else {
                      context.push('/rides/details', extra: {'rideId': _nextRide!['_id']});
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: rideCardDecoration(radius: 24, context: context),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Icon(
                            _ongoingRide != null ? Icons.directions_car : Icons.access_time, 
                            size: 16, 
                            color: AppColors.gold,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _ongoingRide != null ? 'Trip in progress' : 'Pickup expected soon', 
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                          ),
                        ]),
                        const SizedBox(height: 12),
                        Text(
                          (_ongoingRide ?? _nextRide)!['pickupLocation']?['address'] ?? 'Unknown', 
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '→  ${(_ongoingRide ?? _nextRide)!['dropoffLocation']?['address'] ?? 'Unknown'}', 
                          style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // --- Quick Actions ---
              const Text('Quick Actions', style: AppText.sectionTitle),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _quickAction(Icons.notifications_active_outlined, 'New Ride', () => _simulateIncomingRequest(context))),
                  const SizedBox(width: 12),
                  Expanded(child: _quickAction(Icons.support_agent, 'Support', () => context.push('/profile/help'))),
                  const SizedBox(width: 12),
                  Expanded(child: _quickAction(Icons.receipt_long, 'History', () => context.push('/tabs?tab=1'))),
                  const SizedBox(width: 12),
                  Expanded(child: _quickAction(Icons.settings, 'Settings', () => context.push('/tabs?tab=3'))),
                ],
              ),
              const SizedBox(height: 24),

              // --- Recent Activity Feed ---
              const Text('Recent Activity', style: AppText.sectionTitle),
              const SizedBox(height: 12),
              if (_recentTxns.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24.0),
                  child: Text('No recent activity', style: TextStyle(color: Colors.grey)),
                )
              else
                Container(
                  decoration: cardDecoration(bg: Theme.of(context).brightness == Brightness.dark ? AppColors.surfaceAlt : AppColors.surfaceAltLight, radius: 24, context: context),
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    children: List.generate(_recentTxns.length, (i) {
                      final txn = _recentTxns[i];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          border: i < _recentTxns.length - 1
                              ? Border(bottom: BorderSide(color: Theme.of(context).brightness == Brightness.dark ? AppColors.borderSubtle : AppColors.borderSubtleLight))
                              : null,
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: const BoxDecoration(color: AppColors.goldTint, shape: BoxShape.circle),
                              child: const Icon(Icons.check, color: AppColors.gold, size: 18),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(txn['type'] ?? 'Ride Payment', style: const TextStyle(fontSize: 14)),
                            ),
                            Text(
                              '₹${(txn['amount'] ?? 0).toInt()}', 
                              style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ],
                        ),
                      );
                    }),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // Opens the "New Ride Request" screen using the next upcoming mock ride,
  // as a stand-in for a real incoming-request push (no dispatch/matching
  // backend exists yet — see BACKEND_API_SPEC.md).
  void _simulateIncomingRequest(BuildContext context) {
    if (_nextRide == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No incoming requests right now')),
      );
      return;
    }
    context.push('/rides/incoming', extra: {'rideId': _nextRide!['_id']});
  }

  Widget _dashboardSkeleton() {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SkeletonBox(width: 90, height: 12),
                  SizedBox(height: 8),
                  SkeletonBox(width: 140, height: 20),
                ],
              ),
              SkeletonBox(width: 44, height: 44, radius: 22),
            ],
          ),
          const SizedBox(height: 24),
          const SkeletonCard(),
          const SizedBox(height: 16),
          Row(
            children: const [
              Expanded(child: SkeletonCard()),
              SizedBox(width: 16),
              Expanded(child: SkeletonCard()),
            ],
          ),
          const SizedBox(height: 24),
          const SkeletonCard(),
          const SizedBox(height: 24),
          Row(
            children: const [
              Expanded(child: SkeletonCard()),
              SizedBox(width: 12),
              Expanded(child: SkeletonCard()),
              SizedBox(width: 12),
              Expanded(child: SkeletonCard()),
              SizedBox(width: 12),
              Expanded(child: SkeletonCard()),
            ],
          ),
          const SizedBox(height: 24),
          const SkeletonCard(),
        ],
      ),
    );
  }

  Widget _statCard(IconData icon, Color color, String label, String value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: rideCardDecoration(context: context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.goldTint,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _quickAction(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: cardDecoration(radius: 16, context: context),
        child: Column(
          children: [
            Icon(icon, color: AppColors.gold, size: 22),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
