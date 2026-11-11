import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/services/socket_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../widgets/primary_button.dart';
import '../../core/services/booking_service.dart';

class BoardingPassScreen extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const BoardingPassScreen({super.key, required this.bookingData});

  @override
  State<BoardingPassScreen> createState() => _BoardingPassScreenState();
}

class _BoardingPassScreenState extends State<BoardingPassScreen> {
  Map<String, dynamic>? _passData;
  bool _isLoading = true;
  bool _showPin = true;
  String? _errorMsg;
  StreamSubscription? _rideStartedSub;
  StreamSubscription? _rideAwaitingPaymentSub;

  @override
  void initState() {
    super.initState();
    _loadBoardingPass();
    _rideStartedSub = UserSocketService.onRideStarted.listen((data) {
      if (!mounted) return;
      final targetId = widget.bookingData['bookingId']?.toString() ?? widget.bookingData['_id']?.toString();
      final incoming = data['bookingId']?.toString() ?? data['_id']?.toString();
      if (incoming == null || incoming == targetId) {
        Navigator.of(context).pushReplacementNamed(
          '/active-ride',
          arguments: targetId ?? incoming ?? '',
        );
      }
    });

    _rideAwaitingPaymentSub = UserSocketService.onRideAwaitingPayment.listen((data) {
      if (!mounted) return;
      final targetId = widget.bookingData['bookingId']?.toString() ?? widget.bookingData['_id']?.toString();
      final incoming = data['bookingId']?.toString() ?? data['_id']?.toString();
      if (incoming == null || incoming == targetId) {
        Navigator.of(context).pushReplacementNamed(
          '/active-ride',
          arguments: targetId ?? incoming ?? '',
        );
      }
    });
  }

  @override
  void dispose() {
    _rideStartedSub?.cancel();
    _rideAwaitingPaymentSub?.cancel();
    super.dispose();
  }

  double _parseDouble(dynamic value, [double defaultValue = 0.0]) {
    if (value == null) return defaultValue;
    if (value is num) return value.toDouble();
    if (value is String) {
      final clean = value.replaceAll('₹', '').replaceAll(',', '').trim();
      return double.tryParse(clean) ?? defaultValue;
    }
    return defaultValue;
  }

  Future<void> _loadBoardingPass() async {
    try {
      final id = widget.bookingData['bookingId']?.toString() ?? widget.bookingData['id']?.toString() ?? '';
      if (id.isEmpty) {
        throw Exception('Booking ID is missing');
      }
      final data = await BookingService.getBoardingPass(id);
      if (!mounted) return;
      setState(() {
        _passData = data;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMsg = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    if (_isLoading) {
      return Scaffold(
        backgroundColor: colors.background,
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.primaryGold),
        ),
      );
    }

    if (_errorMsg != null || _passData == null) {
      return Scaffold(
        backgroundColor: colors.background,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, color: Colors.redAccent, size: 48),
                const SizedBox(height: 16),
                Text(
                  _errorMsg ?? 'Failed to load boarding pass details.',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.body.copyWith(color: colors.textPrimary),
                ),
                const SizedBox(height: 24),
                PrimaryButton(
                  label: 'Go to My Bookings',
                  onPressed: () {
                    Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
                    Navigator.of(context).pushNamed('/my-rides');
                  },
                )
              ],
            ),
          ),
        ),
      );
    }

    final String bookingId = _passData?['bookingId']?.toString() ?? widget.bookingData['bookingId']?.toString() ?? 'CAB-XXXX';
    final String status = _passData?['status']?.toString() ?? widget.bookingData['status']?.toString() ?? 'Pending';
    final String from = (_passData?['pickup'] is Map ? _passData!['pickup']['address']?.toString() : null) ?? widget.bookingData['from']?.toString() ?? 'Unknown Pickup';
    final String to = (_passData?['destination'] is Map ? _passData!['destination']['address']?.toString() : null) ?? widget.bookingData['to']?.toString() ?? 'Unknown Destination';
    
    final journeyDateStr = (_passData?['journey'] is Map ? _passData!['journey']['date']?.toString() : null);
    DateTime? journeyDate;
    if (journeyDateStr != null) {
      journeyDate = DateTime.tryParse(journeyDateStr);
    }
    final String timeString = (_passData?['journey'] is Map ? _passData!['journey']['time']?.toString() : null) ?? widget.bookingData['time']?.toString() ?? '08:30 AM';
    
    final String dateString = journeyDate != null 
        ? '${journeyDate.day.toString().padLeft(2, '0')} ${_getMonthName(journeyDate.month).toUpperCase()} ${journeyDate.year}'
        : (widget.bookingData['date']?.toString() ?? '15 AUG 2026');
        
    final String passengers = widget.bookingData['passengers']?.toString() ?? '2';
    final String luggage = widget.bookingData['luggage']?.toString() ?? '2';
    final String luggageDisplay = luggage.toLowerCase() == 'none' || luggage.toLowerCase().contains('bag')
        ? luggage
        : '$luggage bags';

    // Safely extract vehicle model (widget.bookingData['car'] can be String like 'Tour Cab' or Map)
    String model = 'Toyota Etios';
    if (_passData?['vehicle'] is Map && _passData!['vehicle']['model'] != null) {
      model = _passData!['vehicle']['model'].toString();
    } else if (widget.bookingData['car'] is Map && widget.bookingData['car']['model'] != null) {
      model = widget.bookingData['car']['model'].toString();
    } else if (widget.bookingData['car'] != null && widget.bookingData['car'].toString().isNotEmpty) {
      model = widget.bookingData['car'].toString();
    }

    // Safely extract distance (widget.bookingData['car'] and 'distance' can be String or Map)
    String distance = 'N/A';
    if (_passData?['journey'] is Map && _passData!['journey']['distanceKm'] != null) {
      distance = '${_passData!['journey']['distanceKm']} KM';
    } else if (widget.bookingData['car'] is Map && widget.bookingData['car']['distance'] != null) {
      distance = widget.bookingData['car']['distance'].toString();
    } else if (widget.bookingData['distance'] is Map && widget.bookingData['distance']['distanceText'] != null) {
      distance = widget.bookingData['distance']['distanceText'].toString();
    } else if (widget.bookingData['distance'] != null) {
      distance = widget.bookingData['distance'].toString();
    }

    // Safely extract passenger name
    String passengerName = 'Passenger';
    if (_passData?['passenger'] is Map && _passData!['passenger']['name'] != null) {
      passengerName = _passData!['passenger']['name'].toString();
    } else if (widget.bookingData['passengerName'] != null) {
      passengerName = widget.bookingData['passengerName'].toString();
    } else if (widget.bookingData['customer'] is Map && widget.bookingData['customer']['fullName'] != null) {
      passengerName = widget.bookingData['customer']['fullName'].toString();
    } else if (widget.bookingData['customer'] != null) {
      passengerName = widget.bookingData['customer'].toString();
    }

    final String ridePin = (_passData?['passenger'] is Map ? _passData!['passenger']['ridePin']?.toString() : null) ?? widget.bookingData['otp']?.toString() ?? 'N/A';
    
    final String carNumber = (_passData?['vehicle'] is Map ? _passData!['vehicle']['registrationNumber']?.toString() : null) ?? 'Pending';
    final String driverName = (_passData?['vehicle'] is Map ? _passData!['vehicle']['driverName']?.toString() : null) ?? 'Pending';
    
    final Map<String, dynamic> pricing = (_passData?['pricing'] is Map)
        ? Map<String, dynamic>.from(_passData!['pricing'])
        : {};
    final double totalFare = _parseDouble(pricing['totalFare'], _parseDouble(widget.bookingData['total']));
    final double advancePaid = _parseDouble(pricing['advancePaid'], _parseDouble(widget.bookingData['advancePaid'] ?? widget.bookingData['advance']));
    final double remainingAmount = _parseDouble(pricing['remainingAmount'], totalFare - advancePaid);
    final String paymentStatus = _passData?['paymentStatus']?.toString() ?? widget.bookingData['paymentStatus']?.toString() ?? 'Pending';
    final double baseFare = _parseDouble(pricing['baseFare'], 2000.0);
    final double distanceCharge = _parseDouble(pricing['distanceCharge'], 0.0);

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Success Header
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
                  ).animate().scale(duration: 400.ms, curve: Curves.elasticOut),
                  const SizedBox(height: 16),
                  Text('Booking Confirmed', style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary)),
                  const SizedBox(height: 8),
                  Text('Your ride status is currently: $status', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
                ],
              ),
            ),
            
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                children: [
                  // Digital Boarding Pass
                  Container(
                    decoration: BoxDecoration(
                      color: colors.surfaceCard,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryGold.withValues(alpha: 0.1),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        )
                      ],
                    ),
                    child: Column(
                      children: [
                        // Pass Header
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGold.withValues(alpha: 0.1),
                            borderRadius: const BorderRadius.only(topLeft: Radius.circular(22), topRight: Radius.circular(22)),
                          ),
                          child: Center(
                            child: Text(
                              'GO LONG DRIVE',
                              style: AppTextStyles.subtitle.copyWith(
                                color: AppColors.primaryGold,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 2,
                              ),
                            ),
                          ),
                        ),
                        
                        // Route
                        Padding(
                          padding: const EdgeInsets.all(24),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(from.length > 25 ? '${from.substring(0, 22)}...' : from, 
                                        textAlign: TextAlign.center,
                                        style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                                    const SizedBox(height: 4),
                                    Text(from.length >= 3 ? from.substring(0, 3).toUpperCase() : 'FROM', 
                                        style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary, fontSize: 32)),
                                  ],
                                ),
                              ),
                              Icon(Icons.local_taxi, color: colors.accentIcon),
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(to.length > 25 ? '${to.substring(0, 22)}...' : to, 
                                        textAlign: TextAlign.center,
                                        style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                                    const SizedBox(height: 4),
                                    Text(to.length >= 3 ? to.substring(0, 3).toUpperCase() : 'TO', 
                                        style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary, fontSize: 32)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        // Cutout dashed line
                        Row(
                          children: [
                            Container(
                              width: 16,
                              height: 32,
                              decoration: BoxDecoration(
                                color: colors.background,
                                borderRadius: const BorderRadius.only(topRight: Radius.circular(16), bottomRight: Radius.circular(16)),
                                border: Border(
                                  right: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                  top: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                  bottom: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                ),
                              ),
                            ),
                            Expanded(
                              child: LayoutBuilder(
                                builder: (context, constraints) {
                                  return Flex(
                                    direction: Axis.horizontal,
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: List.generate(
                                      (constraints.constrainWidth() / 10).floor(),
                                      (index) => SizedBox(width: 5, height: 2, child: DecoratedBox(decoration: BoxDecoration(color: colors.divider))),
                                    ),
                                  );
                                },
                              ),
                            ),
                            Container(
                              width: 16,
                              height: 32,
                              decoration: BoxDecoration(
                                color: colors.background,
                                borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
                                border: Border(
                                  left: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                  top: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                  bottom: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                ),
                              ),
                            ),
                          ],
                        ),
                        
                        // Pass Details
                        Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Date', dateString)),
                                  Expanded(child: _buildPassDetail(colors, 'Time', timeString)),
                                  Expanded(child: _buildPassDetail(colors, 'Booking ID', bookingId)),
                                ],
                              ),
                              const SizedBox(height: 20),
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Passenger', passengerName)),
                                  Expanded(child: _buildPassDetail(colors, 'Vehicle', model)),
                                ],
                              ),
                              if (_passData?['vehicle'] is Map) ...[
                                const SizedBox(height: 20),
                                Row(
                                  children: [
                                    Expanded(child: _buildPassDetail(colors, 'Car Number', carNumber)),
                                    Expanded(child: _buildPassDetail(colors, 'Driver', driverName)),
                                  ],
                                ),
                              ],
                              const SizedBox(height: 20),
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Passengers', '$passengers ($luggageDisplay)')),
                                  Expanded(child: _buildPassDetail(colors, 'Distance', distance)),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('Passenger PIN', style: AppTextStyles.caption.copyWith(color: colors.textSecondary, fontSize: 10)),
                                        const SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Text(
                                              _showPin ? ridePin : '••••',
                                              style: AppTextStyles.body.copyWith(
                                                color: colors.textPrimary, 
                                                fontWeight: FontWeight.bold,
                                                letterSpacing: _showPin ? 2 : 0,
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            GestureDetector(
                                              onTap: () => setState(() => _showPin = !_showPin),
                                              child: Icon(
                                                _showPin ? Icons.visibility_off : Icons.visibility,
                                                color: colors.textSecondary,
                                                size: 14,
                                              ),
                                            ),
                                          ],
                                        )
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              Divider(color: colors.divider),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Base Fare', '₹${baseFare.toStringAsFixed(0)}')),
                                  Expanded(child: _buildPassDetail(colors, 'Distance Charge', '₹${distanceCharge.toStringAsFixed(0)}')),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Total Fare', '₹${totalFare.toStringAsFixed(0)}')),
                                  Expanded(child: _buildPassDetail(colors, 'Advance Paid', '₹${advancePaid.toStringAsFixed(0)}')),
                                  Expanded(child: _buildPassDetail(colors, 'Remaining', '₹${remainingAmount.toStringAsFixed(0)}')),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Align(
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  'Payment Status: $paymentStatus',
                                  style: AppTextStyles.caption.copyWith(
                                    color: paymentStatus == 'Paid' || paymentStatus == 'Advance Paid'
                                        ? AppColors.success
                                        : Colors.orangeAccent,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 32),
                              
                              // PIN Code Display
                              Container(
                                padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 32),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryGold.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: AppColors.primaryGold, width: 2),
                                ),
                                child: Column(
                                  children: [
                                    Text('SHARE THIS PIN WITH DRIVER', style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                                    const SizedBox(height: 8),
                                    Text(
                                      ridePin,
                                      style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, letterSpacing: 12, color: Colors.white),
                                    ),
                                  ],
                                ),
                              ).animate().fadeIn(delay: 400.ms, duration: 400.ms),
                              const SizedBox(height: 12),
                              Text('The trip will start once the driver enters this PIN.', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 200.ms, duration: 400.ms).slideY(begin: 0.1, end: 0),
                  
                  const SizedBox(height: 32),
                  
                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Downloading Boarding Pass...')),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(color: colors.inputBorder),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.download, size: 18, color: colors.textPrimary),
                              const SizedBox(width: 8),
                              Text('Download', style: AppTextStyles.button.copyWith(color: colors.textPrimary)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Preparing Share Link...')),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(color: colors.inputBorder),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.share, size: 18, color: colors.textPrimary),
                              const SizedBox(width: 8),
                              Text('Share Pass', style: AppTextStyles.button.copyWith(color: colors.textPrimary)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  PrimaryButton(
                    label: 'Live Ride Info & Tracking (Locked)',
                    onPressed: () {
                      final bId = _passData?['bookingId']?.toString() ??
                          _passData?['_id']?.toString() ??
                          widget.bookingData['bookingId']?.toString() ??
                          widget.bookingData['_id']?.toString() ??
                          '';
                      Navigator.of(context).pushReplacementNamed(
                        '/active-ride',
                        arguments: bId,
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton(
                    onPressed: () {
                      Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
                      Navigator.of(context).pushNamed('/my-rides');
                    },
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 50),
                      side: BorderSide(color: colors.inputBorder),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Go to My Bookings', style: AppTextStyles.button.copyWith(color: colors.textPrimary)),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPassDetail(AppColorPalette colors, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.caption.copyWith(color: colors.textSecondary, fontSize: 10)),
        const SizedBox(height: 4),
        Text(
          value, 
          style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  String _getMonthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }
}
