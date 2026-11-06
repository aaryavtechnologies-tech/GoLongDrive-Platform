import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/data/directions_service.dart';
import '../../core/services/booking_service.dart';
import '../../core/services/socket_service.dart';
import '../../core/services/user_scope.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

class ActiveRideScreen extends StatefulWidget {
  final String bookingId;

  const ActiveRideScreen({super.key, required this.bookingId});

  @override
  State<ActiveRideScreen> createState() => _ActiveRideScreenState();
}

class _ActiveRideScreenState extends State<ActiveRideScreen> {
  GoogleMapController? _mapController;
  StreamSubscription? _rideCompletedSub;
  StreamSubscription? _rideAwaitingPaymentSub;
  StreamSubscription? _driverArrivedSub;
  StreamSubscription? _driverLocationSub;

  late Razorpay _razorpay;
  bool _isPaymentPending = false;
  bool _isProcessingPayment = false;
  Map<String, dynamic>? _rideDetails;
  String? _paymentRecordId;
  String? _razorpayOrderId;

  LatLng? _driverLocation;
  double _driverHeading = 0;
  bool _driverHasArrived = false;
  List<LatLng> _routePoints = [];

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);

    UserSocketService.joinRide(widget.bookingId);
    _fetchRideDetails();

    _driverArrivedSub = UserSocketService.onDriverArrived.listen((data) {
      if (!mounted) return;
      if (data['bookingId'] == widget.bookingId) {
        setState(() {
          _driverHasArrived = true;
        });
        _showDriverArrivedDialog();
      }
    });

    _driverLocationSub = UserSocketService.onDriverLocation.listen((data) {
      if (!mounted) return;
      if (data['bookingId'] == widget.bookingId || data['latitude'] != null) {
        final double lat = (data['latitude'] as num).toDouble();
        final double lng = (data['longitude'] as num).toDouble();
        final double heading = (data['heading'] as num?)?.toDouble() ?? 0;
        setState(() {
          _driverLocation = LatLng(lat, lng);
          _driverHeading = heading;
        });
        _animateDriverCamera(LatLng(lat, lng));
      }
    });

    _rideAwaitingPaymentSub = UserSocketService.onRideAwaitingPayment.listen((data) {
      if (!mounted) return;
      if (data['bookingId'] == widget.bookingId) {
        setState(() {
          _isPaymentPending = true;
        });
        _fetchRideDetails().then((_) {
          _startPayment();
        });
      }
    });

    _rideCompletedSub = UserSocketService.onRideCompleted.listen((data) {
      if (!mounted) return;
      if (data['bookingId'] == widget.bookingId) {
        Navigator.of(context).pushReplacementNamed('/ride-summary', arguments: widget.bookingId);
      }
    });
  }

  Future<void> _fetchRideDetails() async {
    try {
      final details = await BookingService.getRideDetails(widget.bookingId);
      if (mounted) {
        setState(() {
          _rideDetails = details;
          final status = (details['rideStatus'] ?? '').toString();
          if (status == 'Awaiting Payment') {
            _isPaymentPending = true;
          } else if (status == 'Driver Arrived') {
            _driverHasArrived = true;
          }
        });
        _loadRoutePolyline();
      }
    } catch (e) {
      debugPrint('Error fetching ride details: $e');
    }
  }

  Future<void> _loadRoutePolyline() async {
    final details = _rideDetails;
    if (details == null) return;

    final pickupLat = (details['pickupLat'] ?? details['pickupLocation']?['coordinates']?[1])?.toDouble();
    final pickupLng = (details['pickupLng'] ?? details['pickupLocation']?['coordinates']?[0])?.toDouble();
    final dropLat = (details['dropLat'] ?? details['destinationLat'] ?? details['dropoffLocation']?['coordinates']?[1])?.toDouble();
    final dropLng = (details['dropLng'] ?? details['destinationLng'] ?? details['dropoffLocation']?['coordinates']?[0])?.toDouble();

    if (pickupLat != null && pickupLng != null && dropLat != null && dropLng != null) {
      final result = await DirectionsService.fetchRoute(
        origin: LatLng(pickupLat, pickupLng),
        destination: LatLng(dropLat, dropLng),
      );
      if (result != null && mounted) {
        setState(() {
          _routePoints = result.points;
        });
        _fitRouteBounds(LatLng(pickupLat, pickupLng), LatLng(dropLat, dropLng));
      }
    }
  }

  void _fitRouteBounds(LatLng p1, LatLng p2) {
    if (_mapController == null) return;
    final southWest = LatLng(
      p1.latitude < p2.latitude ? p1.latitude : p2.latitude,
      p1.longitude < p2.longitude ? p1.longitude : p2.longitude,
    );
    final northEast = LatLng(
      p1.latitude > p2.latitude ? p1.latitude : p2.latitude,
      p1.longitude > p2.longitude ? p1.longitude : p2.longitude,
    );
    _mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(southwest: southWest, northeast: northEast),
        70,
      ),
    );
  }

  void _animateDriverCamera(LatLng pos) {
    if (_mapController == null) return;
    _mapController!.animateCamera(CameraUpdate.newLatLng(pos));
  }

  void _showDriverArrivedDialog() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.of(context).surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.check_circle, color: AppColors.primaryGold, size: 28),
            const SizedBox(width: 10),
            Text('Driver Arrived!', style: AppTextStyles.mediumHeading.copyWith(color: AppColors.of(context).textPrimary)),
          ],
        ),
        content: Text(
          'Your driver has reached your pickup location. Please share your 4-digit Ride PIN with the driver to start the journey.',
          style: AppTextStyles.body.copyWith(color: AppColors.of(context).textSecondary),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGold,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('OK, Got It', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    setState(() => _isProcessingPayment = true);
    try {
      await BookingService.verifyPayment({
        'paymentId': _paymentRecordId ?? 'PAY_ID',
        'gatewayOrderId': response.orderId ?? _razorpayOrderId ?? '',
        'gatewayPaymentId': response.paymentId ?? '',
        'gatewaySignature': response.signature ?? '',
      });
      setState(() {
        _isPaymentPending = false;
        _isProcessingPayment = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment verified successfully! Finalizing ride...'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      setState(() => _isProcessingPayment = false);
      debugPrint('Verification error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment verification failed.')),
        );
      }
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    setState(() => _isProcessingPayment = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Payment failed: ${response.message ?? "Cancelled"}')),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    setState(() => _isProcessingPayment = false);
  }

  Future<void> _startPayment() async {
    if (_rideDetails == null) return;

    setState(() => _isProcessingPayment = true);
    final num fare = (_rideDetails!['finalFare'] != null && _rideDetails!['finalFare'] > 0)
        ? _rideDetails!['finalFare']
        : (_rideDetails!['estimatedFare'] ?? 100);

    try {
      final orderRes = await BookingService.initiatePayment(
        bookingId: widget.bookingId,
        paymentMethod: 'Online',
      );

      final String? rzpKey = orderRes['keyId'] ?? orderRes['key'] ?? 'rzp_test_51bU28k12xyz';
      final String? orderId = orderRes['order']?['id'] ?? orderRes['order']?['orderId'] ?? orderRes['gatewayOrderId'];
      _paymentRecordId = orderRes['payment']?['paymentId'] ?? orderRes['paymentId'];
      _razorpayOrderId = orderId;

      var options = {
        'key': rzpKey,
        'amount': (fare * 100).toInt(),
        'name': 'GoLongDrive',
        'description': 'Trip Payment - ${widget.bookingId}',
        if (orderId != null) 'order_id': orderId,
        'prefill': {
          'contact': UserScope.of(context).userProfile?['phoneNumber'] ?? '9876543210',
          'email': UserScope.of(context).userProfile?['email'] ?? 'customer@golongdrive.online',
        },
      };

      _razorpay.open(options);
    } catch (e) {
      debugPrint('Payment initiation error: $e');
      setState(() => _isProcessingPayment = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to initiate payment. Please retry.')),
        );
      }
    }
  }

  void _showBoardingPassSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _DigitalBoardingPassSheet(
        bookingId: widget.bookingId,
        rideDetails: _rideDetails,
        ridePin: UserScope.of(context).userProfile?['ridePin'] ?? _rideDetails?['customer']?['ridePin'] ?? '----',
      ),
    );
  }

  @override
  void dispose() {
    _driverArrivedSub?.cancel();
    _driverLocationSub?.cancel();
    _rideCompletedSub?.cancel();
    _rideAwaitingPaymentSub?.cancel();
    _razorpay.clear();
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final details = _rideDetails;
    final String ridePin = UserScope.of(context).userProfile?['ridePin'] ?? details?['customer']?['ridePin'] ?? '----';

    final pickupLat = (details?['pickupLat'] ?? details?['pickupLocation']?['coordinates']?[1])?.toDouble() ?? 23.0225;
    final pickupLng = (details?['pickupLng'] ?? details?['pickupLocation']?['coordinates']?[0])?.toDouble() ?? 72.5714;
    final dropLat = (details?['dropLat'] ?? details?['destinationLat'] ?? details?['dropoffLocation']?['coordinates']?[1])?.toDouble() ?? 23.0338;
    final dropLng = (details?['dropLng'] ?? details?['destinationLng'] ?? details?['dropoffLocation']?['coordinates']?[0])?.toDouble() ?? 72.5850;

    final LatLng pickupPos = LatLng(pickupLat, pickupLng);
    final LatLng dropPos = LatLng(dropLat, dropLng);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your ride is active. Navigation is locked to this trip.'),
            duration: Duration(seconds: 2),
            backgroundColor: AppColors.primaryGold,
          ),
        );
      },
      child: Scaffold(
        backgroundColor: colors.background,
        body: Stack(
          children: [
            // --- Live Google Map ---
            GoogleMap(
              initialCameraPosition: CameraPosition(
                target: _driverLocation ?? pickupPos,
                zoom: 15,
              ),
              onMapCreated: (ctrl) {
                _mapController = ctrl;
                if (_routePoints.isNotEmpty) {
                  _fitRouteBounds(pickupPos, dropPos);
                }
              },
              polylines: {
                if (_routePoints.isNotEmpty)
                  Polyline(
                    polylineId: const PolylineId('active-route'),
                    points: _routePoints,
                    color: AppColors.primaryGold,
                    width: 5,
                    jointType: JointType.round,
                    startCap: Cap.roundCap,
                    endCap: Cap.roundCap,
                  ),
              },
              markers: {
                Marker(
                  markerId: const MarkerId('pickup'),
                  position: pickupPos,
                  icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
                  infoWindow: InfoWindow(title: 'Pickup', snippet: details?['pickupAddress']),
                ),
                Marker(
                  markerId: const MarkerId('destination'),
                  position: dropPos,
                  icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
                  infoWindow: InfoWindow(title: 'Drop-off', snippet: details?['dropAddress']),
                ),
                if (_driverLocation != null)
                  Marker(
                    markerId: const MarkerId('live-driver'),
                    position: _driverLocation!,
                    rotation: _driverHeading,
                    icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
                    anchor: const Offset(0.5, 0.5),
                    flat: true,
                    infoWindow: const InfoWindow(title: 'Your Driver'),
                  ),
              },
              myLocationEnabled: false,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
            ),

            // --- Top App Bar Strip ---
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: colors.surface.withValues(alpha: 0.95),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: colors.inputBorder),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 8),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.primaryGold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _isPaymentPending
                                ? 'Awaiting Payment'
                                : (_driverHasArrived ? 'Driver Arrived' : 'Trip in Progress'),
                            style: AppTextStyles.caption.copyWith(
                              color: colors.textPrimary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    ElevatedButton.icon(
                      onPressed: _showBoardingPassSheet,
                      icon: const Icon(Icons.qr_code, size: 18, color: Colors.black),
                      label: const Text('Boarding Pass', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGold,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // --- Driver Arrived Alert Strip ---
            if (_driverHasArrived && !_isPaymentPending)
              Positioned(
                top: 75,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGold,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.25), blurRadius: 10),
                    ],
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.location_on, color: Colors.black, size: 24),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Driver has arrived at pickup! Share your Ride PIN with driver.',
                          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            // --- Bottom Sliding Card ---
            Positioned(
              left: 16,
              right: 16,
              bottom: 24,
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: colors.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: colors.inputBorder),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_isPaymentPending) ...[
                      // --- Payment Required Notice ---
                      Row(
                        children: [
                          const Icon(Icons.payment, color: AppColors.primaryGold, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Payment Required', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
                                Text('Trip ended. Complete payment to finish.', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                              ],
                            ),
                          ),
                          Text(
                            '₹${(details?['finalFare'] ?? details?['estimatedFare'] ?? 0)}',
                            style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _isProcessingPayment ? null : _startPayment,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryGold,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: _isProcessingPayment
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                            : const Text('PAY WITH RAZORPAY NOW', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      ),
                    ] else ...[
                      // --- Ride PIN Display Strip ---
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGold.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'SHARE WITH DRIVER',
                                  style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold, letterSpacing: 1),
                                ),
                                const SizedBox(height: 2),
                                Text('Ride Start PIN', style: AppTextStyles.body.copyWith(color: colors.textSecondary)),
                              ],
                            ),
                            const Spacer(),
                            Text(
                              ridePin,
                              style: AppTextStyles.largeHeading.copyWith(
                                color: colors.textPrimary,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 6,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // --- Driver Info Row ---
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: colors.background,
                              border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.5)),
                            ),
                            child: const Icon(Icons.person, color: AppColors.primaryGold, size: 28),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  details?['driver'] is Map
                                      ? (details!['driver']['fullName'] ?? 'Assigned Driver')
                                      : 'Assigned Driver',
                                  style: AppTextStyles.body.copyWith(fontWeight: FontWeight.bold, color: colors.textPrimary),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  '${details?['vehicleType'] ?? "Sedan"} · 4.8 ★',
                                  style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                          _actionIconButton(
                            icon: Icons.call,
                            onTap: () async {
                              final phone = details?['driver'] is Map ? details!['driver']['phoneNumber'] : null;
                              if (phone != null && phone.toString().isNotEmpty) {
                                final uri = Uri.parse('tel:$phone');
                                if (await canLaunchUrl(uri)) await launchUrl(uri);
                              }
                            },
                          ),
                          const SizedBox(width: 8),
                          _actionIconButton(
                            icon: Icons.qr_code,
                            onTap: _showBoardingPassSheet,
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _actionIconButton({required IconData icon, required VoidCallback onTap}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.of(context).background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.of(context).inputBorder),
      ),
      child: IconButton(
        icon: Icon(icon, color: AppColors.primaryGold, size: 20),
        onPressed: onTap,
      ),
    );
  }
}

/// Digital Boarding Pass Bottom Sheet with QR Code
class _DigitalBoardingPassSheet extends StatelessWidget {
  final String bookingId;
  final Map<String, dynamic>? rideDetails;
  final String ridePin;

  const _DigitalBoardingPassSheet({
    required this.bookingId,
    required this.rideDetails,
    required this.ridePin,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final pickup = rideDetails?['pickupAddress'] ?? 'Pickup Location';
    final drop = rideDetails?['dropAddress'] ?? 'Drop Location';
    final passengerName = rideDetails?['customer'] is Map
        ? (rideDetails!['customer']['fullName'] ?? 'Passenger')
        : 'Passenger';
    final vehicle = rideDetails?['vehicleType'] ?? 'Sedan';

    final qrPayload = jsonEncode({
      'bookingId': bookingId,
      'ridePin': ridePin,
      'passenger': passengerName,
      'vehicle': vehicle,
      'pickup': pickup,
      'drop': drop,
    });

    return Container(
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: colors.textSecondary.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),

          // Header
          Row(
            children: [
              const Icon(Icons.airplane_ticket, color: AppColors.primaryGold, size: 28),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('DIGITAL BOARDING PASS', style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                  Text(bookingId, style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
                ],
              ),
              const Spacer(),
              IconButton(
                icon: Icon(Icons.close, color: colors.textSecondary),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // QR Code
          Center(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 10),
                ],
              ),
              child: QrImageView(
                data: qrPayload,
                version: QrVersions.auto,
                size: 160.0,
                backgroundColor: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 4-Digit Ride PIN Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.primaryGold.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.4)),
            ),
            child: Column(
              children: [
                Text('RIDE PIN FOR DRIVER VERIFICATION', style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(ridePin, style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary, letterSpacing: 8, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Route Details
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colors.background,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: colors.inputBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.circle, color: AppColors.success, size: 12),
                    const SizedBox(width: 8),
                    Expanded(child: Text(pickup, style: AppTextStyles.bodySecondary.copyWith(color: colors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis)),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 5),
                  child: Container(width: 2, height: 16, color: colors.inputBorder),
                ),
                Row(
                  children: [
                    const Icon(Icons.location_on, color: AppColors.error, size: 12),
                    const SizedBox(width: 8),
                    Expanded(child: Text(drop, style: AppTextStyles.bodySecondary.copyWith(color: colors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis)),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Passenger: $passengerName', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                    Text('Vehicle: $vehicle', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
