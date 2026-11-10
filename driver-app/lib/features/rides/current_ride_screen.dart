import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme.dart';
import '../../core/data/api_service.dart';
import '../../core/data/geocoding_service.dart';
import '../../core/data/socket_service.dart';
import '../../core/models/ride.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/app_button.dart';
import '../../core/widgets/ride_route_map.dart';
import '../navigation/in_app_navigation_screen.dart';

/// Current Ride Screen - Handles the active trip logic.
/// Wiring this to MockData.currentRide for now.
/// AI/Backend: this screen is the core of the driver experience.
/// We need real-time status updates via WebSockets or long polling eventually.
class CurrentRideScreen extends StatefulWidget {
  const CurrentRideScreen({super.key});

  @override
  State<CurrentRideScreen> createState() => _CurrentRideScreenState();
}

enum _TripStage { arriving, arrived, inProgress, awaitingPayment, completed }

extension on _TripStage {
  String get label => switch (this) {
        _TripStage.arriving => 'Heading to Pickup',
        _TripStage.arrived => 'Arrived at Pickup',
        _TripStage.inProgress => 'Trip in Progress',
        _TripStage.awaitingPayment => 'Awaiting Payment',
        _TripStage.completed => 'Trip Completed',
      };

  String get actionLabel => switch (this) {
        _TripStage.arriving => "I've Arrived",
        _TripStage.arrived => 'Start Trip',
        _TripStage.inProgress => 'End Trip (Wait for Payment)',
        _TripStage.awaitingPayment => 'Verify PIN & Complete',
        _TripStage.completed => 'Done',
      };
}

class _CurrentRideScreenState extends State<CurrentRideScreen> {
  _TripStage _stage = _TripStage.arriving;
  Ride? _ride;
  bool _loading = true;
  bool _actionLoading = false;
  bool _isPaymentReceived = false;
  StreamSubscription? _paymentSub;
  StreamSubscription? _completeSub;

  @override
  void initState() {
    super.initState();
    _fetchCurrentRide();
    _paymentSub = SocketService.onPaymentReceived.listen((data) {
      if (!mounted) return;
      final incId = (data['bookingId'] ?? data['_id'])?.toString();
      if (_ride != null && incId == _ride!.id) {
        setState(() {
          _isPaymentReceived = true;
          _stage = _TripStage.completed;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment confirmed! Trip completed.'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    });

    _completeSub = SocketService.onRideCompleted.listen((data) {
      if (!mounted) return;
      final incId = (data['bookingId'] ?? data['_id'])?.toString();
      if (_ride != null && incId == _ride!.id) {
        setState(() {
          _stage = _TripStage.completed;
          _isPaymentReceived = true;
        });
      }
    });
  }

  @override
  void dispose() {
    _paymentSub?.cancel();
    _completeSub?.cancel();
    super.dispose();
  }

  Future<void> _confirmCashCollected() async {
    if (_ride == null || _actionLoading) return;
    setState(() => _actionLoading = true);
    try {
      final res = await ApiService.post(
        '/driver/bookings/rides/${_ride!.id}/complete',
        body: {'cashCollected': true},
      );
      if (res.statusCode == 200) {
        if (mounted) {
          setState(() {
            _stage = _TripStage.completed;
            _isPaymentReceived = true;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Cash payment confirmed! Trip completed.'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        String msg = 'Failed to confirm cash payment.';
        try {
          msg = jsonDecode(res.body)['message'] ?? msg;
        } catch (_) {}
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Network error')));
      }
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  Future<void> _fetchCurrentRide() async {
    try {
      final res = await ApiService.get('/driver/bookings/rides/current');
      if (res.statusCode == 200) {
        final d = jsonDecode(res.body)['data'];
        if (d != null && d['ride'] != null) {
          final rideData = d['ride'];
          if (mounted) {
            setState(() {
              _ride = Ride.fromJson(rideData);
              final status = rideData['rideStatus'];
              if (status == 'Trip Started') {
                _stage = _TripStage.inProgress;
              } else if (status == 'Awaiting Payment') {
                _stage = _TripStage.awaitingPayment;
              } else if (status == 'Trip Completed') {
                _stage = _TripStage.completed;
              } else if (status == 'Driver Arrived') {
                _stage = _TripStage.arrived;
              } else if (status == 'Driver Arriving' || status == 'Confirmed') {
                _stage = _TripStage.arriving;
              } else {
                _stage = _TripStage.arriving; // fallback
              }
            });
          }
        }
      }
    } catch (e) {
      debugPrint('Error fetching current ride: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _advance() async {
    if (_ride == null || _actionLoading) return;

    setState(() => _actionLoading = true);

    try {
      if (_stage == _TripStage.arriving) {
        // Driver arrived at pickup location - notify backend and customer
        final res = await ApiService.post('/driver/bookings/rides/${_ride!.id}/arrive');
        if (res.statusCode == 200) {
          if (mounted) {
            setState(() => _stage = _TripStage.arrived);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Arrival confirmed! Customer has been notified.'),
                backgroundColor: AppColors.gold,
              ),
            );
          }
        } else {
          // Fallback to local state transition if offline/error
          if (mounted) setState(() => _stage = _TripStage.arrived);
        }
      } else if (_stage == _TripStage.arrived) {
        // Prompt for passenger 4-digit PIN
        setState(() => _actionLoading = false);
        final pin = await _showPinDialog();
        if (pin == null) return; // Driver cancelled PIN dialog

        setState(() => _actionLoading = true);

        // Start Trip
        final res = await ApiService.post(
          '/driver/bookings/rides/${_ride!.id}/start',
          body: {
            'otp': pin, // Backend expects 'otp' which matches customer.ridePin
            'startLat': _ride!.pickupLat ?? 23.0225,
            'startLng': _ride!.pickupLng ?? 72.5714,
          },
        );
        if (res.statusCode == 200) {
          setState(() => _stage = _TripStage.inProgress);
          _startAutoNavigationToDrop();
        } else {
          String errorText = 'Failed to start trip';
          try {
            final body = jsonDecode(res.body);
            if (body['message'] != null) {
              errorText = body['message'];
            }
          } catch (_) {}
          if (mounted) {
            ScaffoldMessenger.of(context)
                .showSnackBar(SnackBar(content: Text(errorText)));
          }
        }
      } else if (_stage == _TripStage.inProgress) {
        // End Trip - transitions to Awaiting Payment
        final double dist = _ride!.distanceKm > 0 ? _ride!.distanceKm : 1.0;
        final double fare = _ride!.fare > 0 ? _ride!.fare : (_ride!.baseFare + (dist * _ride!.pricePerKm));
        final res = await ApiService.post(
          '/driver/bookings/rides/${_ride!.id}/end',
          body: {
            'actualDistance': dist,
            'actualDuration': _ride!.durationMin,
            'finalFare': fare.round(),
          },
        );
        if (res.statusCode == 200) {
          if (mounted) {
            setState(() => _stage = _TripStage.awaitingPayment);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Trip ended! Customer has been prompted for payment.'),
                backgroundColor: AppColors.gold,
              ),
            );
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Failed to end trip')));
          }
        }
      } else if (_stage == _TripStage.awaitingPayment) {
        // Complete Trip (Requires PIN)
        setState(() => _actionLoading = false);
        final pin = await _showPinDialog(isEndRide: true);
        if (pin == null) return;

        setState(() => _actionLoading = true);

        final res = await ApiService.post(
            '/driver/bookings/rides/${_ride!.id}/complete',
            body: { 'otp': pin });
        if (res.statusCode == 200) {
          if (mounted) {
            setState(() => _stage = _TripStage.completed);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Trip completed successfully!'),
                backgroundColor: AppColors.success,
              ),
            );
            context.pop();
          }
        } else {
          String errorText = 'Failed to complete trip. Has the user paid?';
          try {
            final body = jsonDecode(res.body);
            if (body['message'] != null) {
              errorText = body['message'];
            }
          } catch (_) {}
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(errorText)));
          }
        }
      } else if (_stage == _TripStage.completed) {
        if (mounted) {
          context.pop();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Network error')));
      }
    } finally {
      if (mounted) setState(() => _actionLoading = false);
    }
  }

  Future<String?> _showPinDialog({bool isEndRide = false}) async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppColors.surface,
          title: Text(isEndRide ? 'Enter Completion PIN' : 'Enter Passenger PIN', style: AppText.cardHeadline),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                isEndRide 
                  ? 'Please ask the passenger for the 4-digit PIN (shown on their app) to finalize the trip.'
                  : 'Please ask the passenger for their 4-digit verification PIN to start the ride.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                keyboardType: TextInputType.number,
                maxLength: 4,
                obscureText: true,
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 24,
                    letterSpacing: 8,
                    fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
                decoration: InputDecoration(
                  counterText: '',
                  hintText: '••••',
                  hintStyle: TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 24,
                      letterSpacing: 8),
                  enabledBorder: const UnderlineInputBorder(
                      borderSide: BorderSide(color: AppColors.gold)),
                  focusedBorder: const UnderlineInputBorder(
                      borderSide: BorderSide(color: AppColors.gold, width: 2)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, null),
              child:
                  Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
            ),
            ElevatedButton(
              onPressed: () {
                final val = controller.text.trim();
                if (val.length == 4) {
                  Navigator.pop(context, val);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a 4-digit PIN')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.gold),
              child: const Text('Verify',
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _startAutoNavigationToPickup() async {
    final ride = _ride;
    if (ride == null) return;

    final resolved = await GeocodingService.geocodeRide(ride);
    if (!mounted) return;

    final target = resolved ?? ride;
    if (target.pickupLat == null || target.pickupLng == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Couldn't locate pickup coordinates for navigation.")),
      );
      return;
    }

    Navigator.of(context, rootNavigator: true).push(
      MaterialPageRoute(
        builder: (_) => InAppNavigationScreen(
          ride: target,
          destination: LatLng(target.pickupLat!, target.pickupLng!),
          destinationLabel: target.pickupAddress,
          isPickupNavigation: true,
        ),
      ),
    );
  }

  /// Resolves the current ride's drop coordinates (geocoding the address as
  /// a fallback if the ride has none) and pushes the full-screen in-app
  /// navigation screen automatically. Shows a snackbar instead of silently
  /// doing nothing if no route could be determined at all.
  Future<void> _startAutoNavigationToDrop() async {
    final ride = _ride;
    if (ride == null) return;

    final resolved = await GeocodingService.geocodeRide(ride);
    if (!mounted) return;

    if (resolved == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Couldn't start navigation — this ride has no map coordinates "
            'and the drop address could not be located.',
          ),
        ),
      );
      return;
    }

    Navigator.of(context, rootNavigator: true).push(
      MaterialPageRoute(
        builder: (_) => InAppNavigationScreen(
          ride: resolved,
          destination: LatLng(resolved.dropLat!, resolved.dropLng!),
          destinationLabel: resolved.dropAddress,
        ),
      ),
    );
  }

  Future<void> _openGoogleMaps() async {
    if (_ride == null) return;

    String url = '';

    // If heading to pickup, set destination as pickup.
    // If in progress, set destination as drop-off.
    if (_stage == _TripStage.arriving || _stage == _TripStage.arrived) {
      if (_ride!.pickupLat != null && _ride!.pickupLng != null) {
        url =
            'https://www.google.com/maps/dir/?api=1&destination=${_ride!.pickupLat},${_ride!.pickupLng}';
      } else {
        url =
            'https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(_ride!.pickupAddress)}';
      }
    } else if (_stage == _TripStage.inProgress || _stage == _TripStage.awaitingPayment) {
      if (_ride!.dropLat != null && _ride!.dropLng != null) {
        url =
            'https://www.google.com/maps/dir/?api=1&destination=${_ride!.dropLat},${_ride!.dropLng}';
      } else {
        url =
            'https://www.google.com/maps/dir/?api=1&destination=${Uri.encodeComponent(_ride!.dropAddress)}';
      }
    }

    if (url.isNotEmpty) {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Could not open Google Maps')));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Current Ride')),
        body: const Center(
            child: CircularProgressIndicator(color: AppColors.gold)),
      );
    }

    final ride = _ride;

    if (ride == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Current Ride')),
        body: Center(
          child: Text('No active ride right now',
              style: TextStyle(color: AppColors.textMuted)),
        ),
      );
    }

    final bool canLeave = _stage == _TripStage.completed;

    return PopScope(
      canPop: canLeave,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Screen is locked during active ride. Please complete the trip.'),
            duration: Duration(seconds: 2),
            backgroundColor: AppColors.gold,
          ),
        );
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Stack(
            children: [
              Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(8, 8, 24, 8),
                    child: Row(
                      children: [
                        IconButton(
                          icon: Icon(Icons.arrow_back,
                              color: canLeave ? AppColors.textPrimary : AppColors.textMuted),
                          onPressed: () {
                            if (canLeave) {
                              context.pop();
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Trip is in progress. Navigation is locked.'),
                                  duration: Duration(seconds: 2),
                                ),
                              );
                            }
                          },
                        ),
                        const SizedBox(width: 4),
                        Text('Current Ride', style: AppText.cardHeadline),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.fromLTRB(24, 8, 24, 140),
                      children: [
                        // --- RideStatusCard ---
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: rideCardDecoration(),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 10,
                                    height: 10,
                                    decoration: const BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppColors.success),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(_stage.label,
                                      style: TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 17,
                                          fontWeight: FontWeight.w700)),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _stageStepper(),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // --- RideRouteMap (Phase 6) ---
                        RideRouteMapTappable(
                          ride: ride,
                          height: 180,
                          showDriverLocation: true,
                          navTarget: _stage == _TripStage.inProgress ||
                                  _stage == _TripStage.completed
                              ? NavTarget.drop
                              : NavTarget.pickup,
                        ),
                        const SizedBox(height: 16),

                        // --- Turn-by-Turn In-App Navigation Primary Button ---
                        if (_stage != _TripStage.completed) ...[
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                if (_stage == _TripStage.arriving || _stage == _TripStage.arrived) {
                                  _startAutoNavigationToPickup();
                                } else {
                                  _startAutoNavigationToDrop();
                                }
                              },
                              icon: const Icon(Icons.navigation, color: Colors.black),
                              label: Text(
                                _stage == _TripStage.arriving || _stage == _TripStage.arrived
                                    ? 'Turn-by-Turn to Pickup'
                                    : 'Turn-by-Turn to Drop',
                                style: const TextStyle(
                                    color: Colors.black,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.gold,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],

                        // --- Google Maps External Button ---
                        if (_stage != _TripStage.completed)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: _openGoogleMaps,
                                icon: const Icon(Icons.map, color: AppColors.gold),
                                label: const Text('Open in Google Maps App',
                                    style: TextStyle(
                                        color: AppColors.gold,
                                        fontWeight: FontWeight.bold)),
                                style: OutlinedButton.styleFrom(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 16),
                                  side: BorderSide(
                                      color:
                                          AppColors.gold.withValues(alpha: 0.5)),
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                ),
                              ),
                            ),
                          ),

                        // --- Payment Status Card if Awaiting Payment ---
                        if (_stage == _TripStage.awaitingPayment) ...[
                          Container(
                            padding: const EdgeInsets.all(20),
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: _isPaymentReceived ? AppColors.success : AppColors.gold,
                                width: 1.5,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      _isPaymentReceived ? Icons.check_circle : Icons.hourglass_top,
                                      color: _isPaymentReceived ? AppColors.success : AppColors.gold,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      _isPaymentReceived ? 'Payment Verified' : 'Awaiting Customer Payment',
                                      style: TextStyle(
                                        color: _isPaymentReceived ? AppColors.success : AppColors.gold,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 15,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'Final Fare: ₹${ride.fare.toStringAsFixed(0)}',
                                  style: TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _isPaymentReceived
                                      ? 'Payment has been confirmed! Trip completed.'
                                      : 'Passenger is paying via Razorpay on their app. If passenger pays cash, tap Confirm Cash below.',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                          if (!_isPaymentReceived)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: _actionLoading ? null : _confirmCashCollected,
                                  icon: const Icon(Icons.payments, color: Colors.black),
                                  label: Text(
                                    'Confirm Cash Received (₹${ride.fare.round()})',
                                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 15),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.success,
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              ),
                            ),
                        ],

                      // --- RideTimeline (pickup / drop) ---
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: cardDecoration(radius: 20),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              children: [
                                const Icon(Icons.circle,
                                    size: 10, color: AppColors.gold),
                                Container(
                                    width: 1.5,
                                    height: 36,
                                    color: AppColors.divider),
                                Icon(Icons.location_on,
                                    size: 12, color: AppColors.textMuted),
                              ],
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(ride.pickupAddress,
                                      style: TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 14,
                                          height: 1.3)),
                                  const SizedBox(height: 20),
                                  Text(ride.dropAddress,
                                      style: TextStyle(
                                          color: AppColors.textSecondary,
                                          fontSize: 14,
                                          height: 1.3)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // --- CustomerCard (compact) ---
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: cardDecoration(radius: 20),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.goldTint),
                              child: const Icon(Icons.person,
                                  color: AppColors.gold, size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(ride.customerName,
                                      style: TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700)),
                                  Text(
                                      '₹${ride.fare.toStringAsFixed(0)} · ${ride.paymentMethod}',
                                      style: TextStyle(
                                          color: AppColors.textMuted,
                                          fontSize: 12)),
                                ],
                              ),
                            ),
                            _roundIconButton(Icons.message_outlined),
                            const SizedBox(width: 10),
                            _roundIconButton(Icons.call, onTap: () async {
                              final uri = Uri.parse('tel:${ride.customerPhone}');
                              if (await canLaunchUrl(uri)) {
                                await launchUrl(uri);
                              }
                            }),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // --- RideSupportCard ---
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: cardDecoration(
                            radius: 20, bg: AppColors.surfaceAlt),
                        child: Row(
                          children: [
                            const Icon(Icons.support_agent,
                                color: AppColors.gold, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text('Need help with this trip?',
                                  style: TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 13)),
                            ),
                            TextButton(
                              onPressed: () {},
                              child: const Text('Contact Support',
                                  style: TextStyle(
                                      color: AppColors.gold,
                                      fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // --- StickyActionBar ---
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  border:
                      Border(top: BorderSide(color: AppColors.borderSubtle2)),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withValues(alpha: 0.4),
                        blurRadius: 12,
                        offset: const Offset(0, -4)),
                  ],
                ),
                child: AppButton(
                  label: _actionLoading ? 'Loading...' : _stage.actionLabel,
                  onPressed: _actionLoading ? null : _advance,
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

  Widget _stageStepper() {
    const stages = _TripStage.values;
    final currentIndex = stages.indexOf(_stage);
    return Row(
      children: List.generate(stages.length * 2 - 1, (i) {
        if (i.isOdd) {
          final leftDone = (i - 1) ~/ 2 < currentIndex;
          return Expanded(
            child: Container(
                height: 3,
                color: leftDone ? AppColors.gold : AppColors.divider),
          );
        }
        final stepIndex = i ~/ 2;
        final done = stepIndex <= currentIndex;
        return Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: done ? AppColors.gold : AppColors.surfaceAlt2,
            border: Border.all(
                color: done ? AppColors.gold : AppColors.dividerStrong),
          ),
          child: done
              ? const Icon(Icons.check, size: 14, color: Colors.white)
              : null,
        );
      }),
    );
  }

  Widget _roundIconButton(IconData icon, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.surfaceAlt2,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderSubtle2),
        ),
        child: Icon(icon, color: AppColors.gold, size: 18),
      ),
    );
  }
}
