// lib/screens/booking/driver_assigned_screen.dart
import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/ride_request.dart';
import '../../widgets/primary_button.dart';
import '../../widgets/secondary_button.dart';
import '../../routes/app_routes.dart';

/// Step 4 (final) of booking. There's no real driver-matching backend yet,
/// so this screen simulates one: a short "Finding your driver…" search,
/// then reveals a randomly generated mock driver — consistent with how the
/// rest of this app marks backend-dependent actions (SnackBar placeholders)
/// while still giving the flow a real, complete-feeling end state to land
/// on.
///
/// Once wired to a real backend, replace [_findDriver] with a socket/poll
/// against the actual matching service and this screen's UI (states,
/// layout, cancel flow) shouldn't need to change.
///
/// NOTE: the *vehicle* shown here is the car the rider actually selected on
/// ConfirmRideScreen (`request.selectedCar`) — only the driver's name,
/// rating, plate number, and ETA are mocked. Trip length and estimated
/// fare (`request.numberOfDays` / `request.estimatedFare`) are shown too so
/// the rider has a full trip summary at the end of the flow.
class DriverAssignedScreen extends StatefulWidget {
  final RideRequest request;

  const DriverAssignedScreen({super.key, required this.request});

  @override
  State<DriverAssignedScreen> createState() => _DriverAssignedScreenState();
}

class _DriverAssignedScreenState extends State<DriverAssignedScreen> {
  AssignedDriver? _driver;
  GoogleMapController? _mapController;

  static const _mockNames = ['Ramesh Kumar', 'Suresh Patil', 'Arjun Nair', 'Vikram Singh', 'Manoj Yadav'];

  @override
  void initState() {
    super.initState();
    _findDriver();
  }

  Future<void> _findDriver() async {
    await Future.delayed(const Duration(milliseconds: 2200));
    if (!mounted) return;
    final rand = Random();
    setState(() {
      _driver = AssignedDriver(
        name: _mockNames[rand.nextInt(_mockNames.length)],
        rating: 4.5 + rand.nextInt(5) / 10,
        // Real car the rider picked on ConfirmRideScreen — not mocked.
        // Fallback string only covers the (should-never-happen) case of
        // this screen being reached without a car selected.
        vehicleModel: widget.request.selectedCar?.name ?? 'Assigned vehicle',
        plateNumber: 'KA ${1 + rand.nextInt(9)}${String.fromCharCode(65 + rand.nextInt(26))}'
            '${String.fromCharCode(65 + rand.nextInt(26))} ${1000 + rand.nextInt(8999)}',
        etaMinutes: 3 + rand.nextInt(6),
      );
    });
  }

  void _call() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Calling driver — coming soon')),
    );
  }

  Future<void> _cancel() async {
    final colors = AppColors.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: colors.surface,
        title: Text('Cancel this ride?', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
        content: Text(
          'Your driver is already on the way. Cancelling now may still be fine, but please confirm.',
          style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text('Keep ride', style: AppTextStyles.link),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text('Cancel ride', style: AppTextStyles.errorText),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      Navigator.of(context).popUntil((route) => route.settings.name == AppRoutes.home);
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
            SizedBox(
              height: 280,
              width: double.infinity,
              child: GoogleMap(
                initialCameraPosition: CameraPosition(target: widget.request.pickupLatLng, zoom: 14),
                onMapCreated: (c) => _mapController = c,
                markers: {
                  Marker(
                    markerId: const MarkerId('pickup'),
                    position: widget.request.pickupLatLng,
                    icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow),
                    infoWindow: InfoWindow(title: 'Pickup', snippet: widget.request.pickupAddress),
                  ),
                },
                myLocationButtonEnabled: false,
                zoomControlsEnabled: false,
                mapToolbarEnabled: false,
                compassEnabled: false,
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
                child: _driver == null ? _SearchingState(request: widget.request) : _AssignedState(
                  driver: _driver!,
                  request: widget.request,
                  onCall: _call,
                  onCancel: _cancel,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}

class _SearchingState extends StatelessWidget {
  final RideRequest request;
  const _SearchingState({required this.request});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(
          width: 46,
          height: 46,
          child: CircularProgressIndicator(color: AppColors.primaryGold, strokeWidth: 3),
        ),
        const SizedBox(height: 20),
        Text('Finding your driver…', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary), textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(
          'Matching you with a nearby driver for\n${request.pickupAddress} → ${request.dropAddress}',
          style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
          textAlign: TextAlign.center,
        ),
      ],
    ).animate().fadeIn(duration: 250.ms);
  }
}

class _AssignedState extends StatelessWidget {
  final AssignedDriver driver;
  final RideRequest request;
  final VoidCallback onCall;
  final VoidCallback onCancel;

  const _AssignedState({
    required this.driver,
    required this.request,
    required this.onCall,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.success.withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.success),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: AppColors.success, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Driver assigned — arriving in ${driver.etaMinutes} min',
                    style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                height: 56,
                width: 56,
                decoration: BoxDecoration(color: colors.surface, shape: BoxShape.circle),
                child: Icon(Icons.person, color: colors.accentIcon, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(driver.name, style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.star, color: AppColors.primaryGold, size: 14),
                        const SizedBox(width: 4),
                        Text(driver.rating.toStringAsFixed(1), style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                      ],
                    ),
                  ],
                ),
              ),
              Material(
                color: colors.surface,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: onCall,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Icon(Icons.call, color: colors.accentIcon, size: 20),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: colors.surface, borderRadius: BorderRadius.circular(14)),
            child: Row(
              children: [
                Icon(Icons.directions_car_filled_outlined, color: colors.accentIcon, size: 20),
                const SizedBox(width: 10),
                Expanded(child: Text(driver.vehicleModel, style: AppTextStyles.body.copyWith(color: colors.textPrimary))),
                Text(driver.plateNumber, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary)),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  const Icon(Icons.circle, size: 10, color: AppColors.primaryGold),
                  Container(width: 1.5, height: 24, color: colors.divider),
                  Icon(Icons.square, size: 10, color: colors.textSecondary),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(request.pickupAddress, style: AppTextStyles.body.copyWith(color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 10),
                    Text(request.dropAddress, style: AppTextStyles.body.copyWith(color: colors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
          if (request.numberOfDays != null && request.estimatedFare != null) ...[
            const SizedBox(height: 18),
            _TripFareSummary(request: request),
          ],
          const SizedBox(height: 28),
          SecondaryButton(label: 'Cancel Ride', onPressed: onCancel),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }
}

/// Final trip recap — date range, day count, and the estimated total fare
/// (see RideRequest.estimatedFare / file-level BACKEND HOOKUP note in
/// models/ride_request.dart: this is a client-side estimate, replace with a
/// real quote-endpoint value once one exists).
class _TripFareSummary extends StatelessWidget {
  final RideRequest request;
  const _TripFareSummary({required this.request});

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _format(DateTime d) => '${d.day} ${_months[d.month - 1]}';

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final days = request.numberOfDays!;
    final fare = request.estimatedFare!.round();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: colors.surface, borderRadius: BorderRadius.circular(14)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.calendar_today_rounded, color: colors.accentIcon, size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${_format(request.startDate!)} → ${_format(request.returnDate!)} · $days day${days == 1 ? '' : 's'}',
                  style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Estimated total fare', style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
              Text('₹$fare', style: AppTextStyles.mediumHeading.copyWith(fontSize: 20, color: colors.textPrimary)),
            ],
          ),
        ],
      ),
    );
  }
}
