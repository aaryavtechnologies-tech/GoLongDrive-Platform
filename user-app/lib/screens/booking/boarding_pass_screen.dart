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

  @override
  void initState() {
    super.initState();
    _loadBoardingPass();
    _rideStartedSub = UserSocketService.onRideStarted.listen((data) {
      if (!mounted) return;
      if (data['bookingId'] == widget.bookingData['bookingId']) {
        Navigator.of(context).pushReplacementNamed(
          '/active-ride',
          arguments: data['bookingId'],
        );
      }
    });
  }

  @override
  void dispose() {
    _rideStartedSub?.cancel();
    super.dispose();
  }

  Future<void> _loadBoardingPass() async {
    try {
      final id = widget.bookingData['bookingId'] ?? '';
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

    final String bookingId = _passData!['bookingId'] ?? 'CAB-XXXX';
    final String status = _passData!['status'] ?? 'Pending';
    final String from = _passData!['pickup']?['address'] ?? 'Unknown Pickup';
    final String to = _passData!['destination']?['address'] ?? 'Unknown Destination';
    
    final journeyDateStr = _passData!['journey']?['date'];
    DateTime? journeyDate;
    if (journeyDateStr != null) {
      journeyDate = DateTime.tryParse(journeyDateStr);
    }
    final String timeString = _passData!['journey']?['time'] ?? '08:30 AM';
    
    final String dateString = journeyDate != null 
        ? '${journeyDate.day.toString().padLeft(2, '0')} ${_getMonthName(journeyDate.month).toUpperCase()} ${journeyDate.year}'
        : '15 AUG 2026';
        
    final int passengers = widget.bookingData['passengers'] ?? 2;
    final int luggage = widget.bookingData['luggage'] ?? 2;
    final String model = _passData!['vehicle']?['model'] ?? widget.bookingData['car']?['model'] ?? 'Toyota Etios';
    final String distance = _passData!['journey']?['distanceKm'] != null 
        ? '${_passData!['journey']['distanceKm']} KM'
        : widget.bookingData['car']?['distance'] ?? widget.bookingData['distance']?['distanceText'] ?? 'N/A';
    
    final String passengerName = _passData!['passenger']?['name'] ?? widget.bookingData['passengerName'] ?? widget.bookingData['customer']?['fullName'] ?? 'Passenger';
    final String ridePin = _passData!['passenger']?['ridePin'] ?? 'N/A';
    
    final String carNumber = _passData!['vehicle']?['registrationNumber'] ?? 'GJ01AB1234';
    final String driverName = _passData!['vehicle']?['driverName'] ?? 'Rajesh Kumar';
    
    final double totalFare = (_passData!['pricing']?['totalFare'] ?? 0).toDouble();
    final double advancePaid = (_passData!['pricing']?['advancePaid'] ?? 0).toDouble();
    final double remainingAmount = (_passData!['pricing']?['remainingAmount'] ?? 0).toDouble();
    final String paymentStatus = _passData!['paymentStatus'] ?? 'Pending';

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
                      color: AppColors.success.withOpacity(0.1),
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
                      border: Border.all(color: AppColors.primaryGold.withOpacity(0.5), width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryGold.withOpacity(0.1),
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
                            color: AppColors.primaryGold.withOpacity(0.1),
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
                                  right: BorderSide(color: AppColors.primaryGold.withOpacity(0.5), width: 2),
                                  top: BorderSide(color: AppColors.primaryGold.withOpacity(0.5), width: 2),
                                  bottom: BorderSide(color: AppColors.primaryGold.withOpacity(0.5), width: 2),
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
                                  left: BorderSide(color: AppColors.primaryGold.withOpacity(0.5), width: 2),
                                  top: BorderSide(color: AppColors.primaryGold.withOpacity(0.5), width: 2),
                                  bottom: BorderSide(color: AppColors.primaryGold.withOpacity(0.5), width: 2),
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
                              if (_passData!['vehicle'] != null) ...[
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
                                  Expanded(child: _buildPassDetail(colors, 'Passengers', '$passengers ($luggage bags)')),
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
                                  Expanded(child: _buildPassDetail(colors, 'Base Fare', '₹${(_passData!['pricing']?['baseFare'] ?? 2000).toDouble().toStringAsFixed(0)}')),
                                  Expanded(child: _buildPassDetail(colors, 'Distance Charge', '₹${(_passData!['pricing']?['distanceCharge'] ?? 0).toDouble().toStringAsFixed(0)}')),
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
                                  color: AppColors.primaryGold.withOpacity(0.1),
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
                    label: 'Go to My Bookings',
                    onPressed: () {
                      Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
                      Navigator.of(context).pushNamed('/my-rides');
                    },
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
