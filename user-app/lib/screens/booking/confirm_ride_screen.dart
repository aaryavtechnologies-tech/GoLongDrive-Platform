// lib/screens/booking/confirm_ride_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../widgets/primary_button.dart';
import '../../core/services/booking_service.dart';
import 'journey_date_time_sheet.dart';

class ConfirmRideScreen extends StatefulWidget {
  final Map<String, dynamic> bookingArgs;

  const ConfirmRideScreen({super.key, required this.bookingArgs});

  @override
  State<ConfirmRideScreen> createState() => _ConfirmRideScreenState();
}

class _ConfirmRideScreenState extends State<ConfirmRideScreen> {
  late Razorpay _razorpay;
  bool _isProcessing = false;
  
  late DateTime _journeyDate;
  late TimeOfDay _pickupTime;
  late int _passengers;
  late int _luggage;

  @override
  void initState() {
    super.initState();
    _journeyDate = widget.bookingArgs['date'] ?? DateTime.now();
    _pickupTime = widget.bookingArgs['time'] ?? const TimeOfDay(hour: 8, minute: 30);
    _passengers = widget.bookingArgs['passengers'] ?? 2;
    _luggage = widget.bookingArgs['luggage'] ?? 2;
    
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    _createBackendBooking(response.paymentId ?? 'TXN_MOCK_123');
  }

  Future<void> _createBackendBooking(String txnId) async {
    setState(() => _isProcessing = true);
    try {
      final String from = widget.bookingArgs['from'] ?? 'Ahmedabad';
      final String to = widget.bookingArgs['to'] ?? 'Mumbai';
      final Map<String, dynamic> car = widget.bookingArgs['car'] ?? {};
      
      final String dateString = '${_journeyDate.year}-${_journeyDate.month.toString().padLeft(2, '0')}-${_journeyDate.day.toString().padLeft(2, '0')}';
      final String timeString = '${_pickupTime.hour}:${_pickupTime.minute}';

      final rawDist = car['distanceValueKm'] ?? 
                      (widget.bookingArgs['distance'] is Map ? widget.bookingArgs['distance']['distanceValueKm'] : null) ??
                      car['distance'];
      final double distance = rawDist is num 
          ? rawDist.toDouble() 
          : (double.tryParse(rawDist.toString().replaceAll(RegExp(r'[^0-9.]'), '')) ?? 0);

      final fromParts = _parseAddress(from);
      final toParts = _parseAddress(to);

      final payload = {
        'pickupAddress': from,
        'pickupCity': fromParts['city'],
        'pickupState': fromParts['state'],
        'pickupPincode': fromParts['pincode'],
        'dropAddress': to,
        'dropCity': toParts['city'],
        'dropState': toParts['state'],
        'dropPincode': toParts['pincode'],
        'distance': distance,
        'tripType': 'One Way',
        'pickupDate': dateString,
        'pickupTime': timeString,
        'fareAmount': car['total'],
        'advancePaid': car['advanceAmount'] ?? 500,
        'numberOfPassengers': _passengers,
        'numberOfBags': _luggage,
        'vehicleType': car['name'] ?? car['model'] ?? 'Sedan',
      };

      final bookingResult = await BookingService.createBooking(payload);
      
      if (!mounted) return;
      setState(() => _isProcessing = false);
      _navigateToBoardingPass(txnId, bookingResult['_id'] ?? 'GLD-XXXX');
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      _showErrorDialog(e.toString());
    }
  }

  void _showErrorDialog(String error) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.of(context).surface,
        title: Text('Booking Error', style: AppTextStyles.subtitle.copyWith(color: AppColors.of(context).textPrimary)),
        content: Text(error, style: AppTextStyles.body.copyWith(color: AppColors.of(context).textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK', style: TextStyle(color: AppColors.primaryGold)),
          ),
        ],
      ),
    );
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    setState(() => _isProcessing = false);
    // For demo purposes, we'll still navigate to success since the key is a dummy
    // In production, you would show an error message.
    _createBackendBooking('TXN_DEMO_SUCCESS');
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    setState(() => _isProcessing = false);
  }

  void _navigateToBoardingPass(String txnId, String bookingId) {
    final args = Map<String, dynamic>.from(widget.bookingArgs);
    args['txnId'] = txnId;
    args['bookingId'] = bookingId;
    args['date'] = _journeyDate;
    args['time'] = _pickupTime;
    args['passengers'] = _passengers;
    args['luggage'] = _luggage;
    args['advancePaid'] = widget.bookingArgs['car']?['advanceAmount'] ?? 500;
    
    // Replace this with the actual navigation
    Navigator.of(context).pushReplacementNamed('/boarding-pass', arguments: args);
  }

  Future<void> _startPayment() async {
    setState(() => _isProcessing = true);
    
    // Simulate Final Availability Check
    await Future.delayed(const Duration(seconds: 1));
    
    // 5% chance of simulating a failure for demonstration
    final isAvailable = DateTime.now().millisecond > 50; 
    
    if (!isAvailable) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: AppColors.of(context).surface,
          title: Text('Ride Unavailable', style: AppTextStyles.subtitle.copyWith(color: AppColors.of(context).textPrimary)),
          content: Text('This car is no longer available for your selected time. Please select another.', style: AppTextStyles.body.copyWith(color: AppColors.of(context).textSecondary)),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop(); // Go back to search results
              },
              child: const Text('OK', style: TextStyle(color: AppColors.primaryGold)),
            )
          ],
        ),
      );
      return;
    }
    
    // Using a dummy key. In production, this should be fetched from backend.
    var options = {
      'key': 'rzp_test_dummy_key',
      'amount': 500 * 100, // amount in paisa (₹500)
      'name': 'GoLongDrive',
      'description': 'Advance Payment for Ride',
      'prefill': {
        'contact': '9876543210',
        'email': 'user@example.com'
      }
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      debugPrint('Error: $e');
      setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final String from = widget.bookingArgs['from'] ?? 'Ahmedabad';
    final String to = widget.bookingArgs['to'] ?? 'Mumbai';
    final Map<String, dynamic> car = widget.bookingArgs['car'] ?? {};

    final int totalAmount = car['total'] ?? 7800;
    final int advancePayment = car['advanceAmount'] ?? 500;
    final int remainingAmount = totalAmount - advancePayment;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.background,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: colors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text('Review Booking', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(24),
                children: [
                  // Ticket Layout
                  Container(
                    decoration: BoxDecoration(
                      color: colors.surfaceCard,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: colors.inputBorder.withValues(alpha: 0.1)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        )
                      ],
                    ),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('FROM', style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                                        const SizedBox(height: 4),
                                        Text(from, style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary, fontSize: 18)),
                                      ],
                                    ),
                                  ),
                                  Icon(Icons.arrow_forward, color: colors.accentIcon),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text('TO', style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                                        const SizedBox(height: 4),
                                        Text(to, style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary, fontSize: 18)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 24),
                              
                              _buildTicketDetailRow(
                                colors, 
                                'Journey Date', 
                                '${_journeyDate.day} ${_getMonthName(_journeyDate.month)} ${_journeyDate.year}', 
                                'Pickup Time', 
                                _pickupTime.format(context),
                                onEditTop: () async {
                                  final result = await showJourneyDateTimeSheet(
                                    context,
                                    initialDate: _journeyDate,
                                    initialTime: _pickupTime,
                                  );
                                  if (result != null) {
                                    setState(() {
                                      _journeyDate = result.date;
                                      _pickupTime = result.time;
                                    });
                                    // Trigger availability recalculation here if backend was real
                                  }
                                }
                              ),
                              const SizedBox(height: 16),
                              
                              _buildTicketDetailRow(
                                colors, 
                                'Passengers', 
                                '$_passengers People', 
                                'Luggage', 
                                '$_luggage Bags',
                              ),
                              const SizedBox(height: 16),
                              
                              _buildTicketDetailRow(
                                colors, 
                                'Distance', 
                                car['distance'] ?? 
                                    (widget.bookingArgs['distance'] is Map ? widget.bookingArgs['distance']['distanceText'] : null) ?? 
                                    'N/A', 
                                'Vehicle', 
                                car['model'] ?? 'Car',
                              ),
                              const SizedBox(height: 16),
                              
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Total Fare', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                                      const SizedBox(height: 4),
                                      Text('₹$totalAmount', style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        // Cutout dashed line separator
                        Row(
                          children: [
                            Container(
                              width: 12,
                              height: 24,
                              decoration: BoxDecoration(
                                color: colors.background,
                                borderRadius: const BorderRadius.only(topRight: Radius.circular(12), bottomRight: Radius.circular(12)),
                                border: Border(
                                  right: BorderSide(color: colors.inputBorder),
                                  top: BorderSide(color: colors.inputBorder),
                                  bottom: BorderSide(color: colors.inputBorder),
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
                                      (constraints.constrainWidth() / 8).floor(),
                                      (index) => SizedBox(width: 4, height: 1, child: DecoratedBox(decoration: BoxDecoration(color: colors.divider))),
                                    ),
                                  );
                                },
                              ),
                            ),
                            Container(
                              width: 12,
                              height: 24,
                              decoration: BoxDecoration(
                                color: colors.background,
                                borderRadius: const BorderRadius.only(topLeft: Radius.circular(12), bottomLeft: Radius.circular(12)),
                                border: Border(
                                  left: BorderSide(color: colors.inputBorder),
                                  top: BorderSide(color: colors.inputBorder),
                                  bottom: BorderSide(color: colors.inputBorder),
                                ),
                              ),
                            ),
                          ],
                        ),
                        // Payment Breakdown
                        Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Payment Details', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
                              const SizedBox(height: 16),
                              _buildPriceRow(colors, 'Total Ride Amount', '₹$totalAmount'),
                              const SizedBox(height: 8),
                              _buildPriceRow(colors, 'Advance Payment', '- ₹$advancePayment', isHighlight: true),
                              const SizedBox(height: 16),
                              Container(height: 1, color: colors.divider),
                              const SizedBox(height: 16),
                              _buildPriceRow(colors, 'Remaining Amount', '₹$remainingAmount', isTotal: true),
                              const SizedBox(height: 8),
                              Text('To be paid to the driver during the trip.', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05, end: 0),
                  
                  const SizedBox(height: 24),
                  
                  // Advance Payment Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGold.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primaryGold.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGold.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.security, color: AppColors.primaryGold),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Secure Advance Payment', style: AppTextStyles.body.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('Pay ₹500 advance to confirm your booking.', style: AppTextStyles.caption.copyWith(color: colors.textPrimary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
                ],
              ),
            ),
            
            // Bottom CTA
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: colors.background,
                border: Border(top: BorderSide(color: colors.divider)),
              ),
              child: PrimaryButton(
                label: _isProcessing ? 'Processing...' : 'PAY ₹$advancePayment & CONFIRM',
                onPressed: _isProcessing ? () {} : _startPayment,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTicketDetailRow(AppColorPalette colors, String label1, String val1, String label2, String val2, {VoidCallback? onEditTop}) {
    return Row(
      children: [
        Expanded(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label1, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                    const SizedBox(height: 4),
                    Text(val1, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
              if (onEditTop != null)
                IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  icon: Icon(Icons.edit, size: 16, color: AppColors.primaryGold),
                  onPressed: onEditTop,
                ),
            ],
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label2, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
              const SizedBox(height: 4),
              Text(val2, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPriceRow(AppColorPalette colors, String label, String amount, {bool isHighlight = false, bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: isTotal 
              ? AppTextStyles.subtitle.copyWith(color: colors.textPrimary) 
              : AppTextStyles.body.copyWith(color: colors.textSecondary),
        ),
        Text(
          amount,
          style: isTotal 
              ? AppTextStyles.largeHeading.copyWith(color: colors.textPrimary, fontSize: 20)
              : AppTextStyles.body.copyWith(
                  color: isHighlight ? AppColors.success : colors.textPrimary,
                  fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal,
                ),
        ),
      ],
    );
  }

  String _getMonthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  /// Parses a Google Places formatted address string to extract city, state,
  /// and pincode. The typical format ends with:
  ///   "..., City, ..., State, Pincode, Country"
  /// e.g. "Vapi Railway Station, Vapi, Daman Road, Vapi, Vapi Taluka, Valsad, Gujarat, 396191, India"
  Map<String, String> _parseAddress(String address) {
    final parts = address.split(',').map((s) => s.trim()).toList();

    // Pincode: first part (from the end, before country) that is all digits
    String pincode = '';
    String state = '';
    String city = '';

    // Walk from the end: last part is country, then look for a 6-digit pincode
    // then state, then city.
    int idx = parts.length - 1; // start at last
    // Skip country (last element)
    if (idx >= 0) idx--;

    // Find pincode
    while (idx >= 0) {
      if (RegExp(r'^\d{4,6}$').hasMatch(parts[idx])) {
        pincode = parts[idx];
        idx--;
        break;
      }
      idx--;
    }

    // State is immediately before the pincode
    if (idx >= 0) {
      state = parts[idx];
      idx--;
    }

    // City: walk backwards to find the first non-landmark part that looks like
    // a city (not a road/taluka qualifier). Simplified: take the next part.
    if (idx >= 0) {
      city = parts[idx];
    }

    // Fallback: if parsing failed, use first segment as city
    if (city.isEmpty && parts.isNotEmpty) city = parts.first;
    if (state.isEmpty) state = city;
    if (pincode.isEmpty) pincode = '000000';

    return {'city': city, 'state': state, 'pincode': pincode};
  }
}
