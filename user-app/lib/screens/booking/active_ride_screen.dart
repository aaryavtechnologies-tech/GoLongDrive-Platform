import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/services/socket_service.dart';
import '../../core/services/booking_service.dart';
import '../../core/services/user_scope.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

class ActiveRideScreen extends StatefulWidget {
  final String bookingId;

  const ActiveRideScreen({super.key, required this.bookingId});

  @override
  State<ActiveRideScreen> createState() => _ActiveRideScreenState();
}

class _ActiveRideScreenState extends State<ActiveRideScreen> {
  StreamSubscription? _rideCompletedSub;
  StreamSubscription? _rideAwaitingPaymentSub;
  late Razorpay _razorpay;
  bool _isPaymentPending = false;
  Map<String, dynamic>? _rideDetails;
  bool _isProcessingPayment = false;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);

    _fetchRideDetails();

    _rideCompletedSub = UserSocketService.onRideCompleted.listen((data) {
      if (!mounted) return;
      if (data['bookingId'] == widget.bookingId) {
        Navigator.of(
          context,
        ).pushReplacementNamed('/ride-summary', arguments: widget.bookingId);
      }
    });

    _rideAwaitingPaymentSub = UserSocketService.onRideAwaitingPayment.listen((data) {
      if (!mounted) return;
      if (data['bookingId'] == widget.bookingId) {
        setState(() {
          _isPaymentPending = true;
        });
        _fetchRideDetails(); // Refresh to get final amount if needed
      }
    });
  }

  Future<void> _fetchRideDetails() async {
    try {
      final details = await BookingService.getRideDetails(widget.bookingId);
      if (mounted) {
        setState(() {
          _rideDetails = details;
          if (details['rideStatus'] == 'Awaiting Payment') {
            _isPaymentPending = true;
          }
        });
      }
    } catch (e) {
      debugPrint('Error fetching ride details: $e');
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    setState(() => _isProcessingPayment = true);
    try {
      await BookingService.verifyPayment({
        'paymentId': 'PAY_DUMMY_ID', // Requires actual integration to fetch order ID
        'gatewayOrderId': 'order_dummy',
        'gatewayPaymentId': response.paymentId,
        'gatewaySignature': response.signature ?? 'dummy_sig',
      });
      // Verification done, waiting for driver to 'complete' ride using PIN
      setState(() {
        _isPaymentPending = false;
        _isProcessingPayment = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment successful! Waiting for driver to finalize trip.')),
      );
    } catch (e) {
      setState(() => _isProcessingPayment = false);
      debugPrint('Verification failed: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment verification failed.')),
      );
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    setState(() => _isProcessingPayment = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Payment failed. Please try again.')),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    setState(() => _isProcessingPayment = false);
  }

  Future<void> _startPayment() async {
    if (_rideDetails == null) return;
    
    setState(() => _isProcessingPayment = true);
    final int amount = _rideDetails!['finalFare'] > 0 ? _rideDetails!['finalFare'] : _rideDetails!['estimatedFare'];
    
    try {
      // In a real app, call your backend API here to create a Razorpay order
      // and get the orderId. Here we use dummy order data.
      final orderRes = await BookingService.initiatePayment(
        bookingId: widget.bookingId,
        paymentMethod: 'Online',
      );

      var options = {
        'key': 'rzp_test_dummy_key',
        'amount': amount * 100, 
        'name': 'GoLongDrive',
        'description': 'Post-Ride Payment',
        'order_id': orderRes['order']?['orderId'], 
        'prefill': {
          'contact': '9876543210',
          'email': 'user@example.com'
        }
      };
      
      _razorpay.open(options);
    } catch (e) {
      debugPrint('Error: $e');
      setState(() => _isProcessingPayment = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to initiate payment.')),
      );
    }
  }

  @override
  void dispose() {
    _rideCompletedSub?.cancel();
    _rideAwaitingPaymentSub?.cancel();
    _razorpay.clear();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.of(context).background,
      appBar: AppBar(
        title: Text(
          'Trip in Progress',
          style: AppTextStyles.mediumHeading.copyWith(
            color: AppColors.of(context).textPrimary,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading:
            false, // User shouldn't navigate back during active ride
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.directions_car,
              size: 80,
              color: AppColors.primaryGold,
            ),
            const SizedBox(height: 24),
            Text(
              _isPaymentPending ? 'Payment Required' : 'Your ride is in progress.',
              style: AppTextStyles.largeHeading.copyWith(
                color: AppColors.of(context).textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Text(
              _isPaymentPending 
                ? 'Please complete the payment to finish the trip.'
                : 'Sit back and relax.\nThe trip will complete automatically when you arrive.',
              style: AppTextStyles.bodySecondary.copyWith(
                color: AppColors.of(context).textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            if (!_isPaymentPending) ...[
              const CircularProgressIndicator(color: AppColors.primaryGold),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                decoration: BoxDecoration(
                  color: AppColors.primaryGold.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.3)),
                ),
                child: Column(
                  children: [
                    Text(
                      'Your Ride PIN',
                      style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      UserScope.of(context).userProfile?['ridePin'] ?? '----',
                      style: AppTextStyles.largeHeading.copyWith(
                        color: AppColors.of(context).textPrimary,
                        letterSpacing: 8,
                      ),
                    ),
                  ],
                ),
              ),
            ] else
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: ElevatedButton(
                  onPressed: _isProcessingPayment ? null : _startPayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGold,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isProcessingPayment 
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('PAY NOW', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
