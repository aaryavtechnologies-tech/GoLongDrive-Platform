// lib/screens/booking/confirm_ride_screen.dart
//
// Step 3 of booking: shows the real road route between pickup and drop
// (falls back to a straight line if the Directions API call fails — see
// DirectionsService's debugPrint logging for why), then lets the rider pick
// a specific CAR (not just a generic tier) grouped by category, with a live
// fare estimate for each based on the trip length set on TripDetailsScreen.
//
// ============================================================================
// BACKEND HOOKUP
// ============================================================================
// - Car list: `mockCarModels` in models/ride_request.dart. Replace with a
//   real fleet/availability fetch (ideally filtered by pickup city + the
//   rider's chosen date range) once that backend exists.
// - Fare: `RideRequest.estimatedFare` = (perDayRate * days) + (perKmRate *
//   distanceKm), computed entirely client-side. Treat this as an ESTIMATE
//   ONLY. Before charging anyone, call a real quote/pricing endpoint with
//   (carId, pickup, drop, startDate, returnDate) and use ITS number —
//   client-side math should never be the final source of truth for a price
//   a rider is charged.
// - Distance: from DirectionsService (Google Directions API), same as
//   before this change — unaffected by the pricing rework.
// ============================================================================
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/directions_service.dart';
import '../../models/ride_request.dart';
import '../../widgets/primary_button.dart';
import '../../routes/app_routes.dart';

class ConfirmRideScreen extends StatefulWidget {
  final RideRequest request;

  const ConfirmRideScreen({super.key, required this.request});

  @override
  State<ConfirmRideScreen> createState() => _ConfirmRideScreenState();
}

class _ConfirmRideScreenState extends State<ConfirmRideScreen> {
  GoogleMapController? _mapController;
  RouteResult? _route;
  bool _loadingRoute = true;
  CarModel? _selected;
  bool _confirming = false;
  bool _hideMap = false; // Toggle for testing without API keys

  double get _distanceKm {
    if (_route != null) return _route!.distanceMeters / 1000;
    // Straight-line fallback if the Directions API call failed.
    final meters = Geolocator.distanceBetween(
      widget.request.pickupLatLng.latitude,
      widget.request.pickupLatLng.longitude,
      widget.request.dropLatLng.latitude,
      widget.request.dropLatLng.longitude,
    );
    return meters / 1000;
  }

  int get _numberOfDays => widget.request.numberOfDays ?? 1;

  /// Fare for a given car: (per-day rate * days) + (per-km rate * distance),
  /// rounded to the nearest ₹10 so fares read like real pricing rather than
  /// a raw float. See file header for the BACKEND HOOKUP note on this being
  /// a client-side estimate only.
  int _fareFor(CarModel car) {
    final raw = (car.perDayRate * _numberOfDays) + (car.perKmRate * _distanceKm);
    return (raw / 10).round() * 10;
  }

  Map<VehicleCategory, List<CarModel>> get _carsByCategory {
    final map = <VehicleCategory, List<CarModel>>{};
    for (final category in VehicleCategory.values) {
      final cars = mockCarModels.where((c) => c.category == category).toList();
      if (cars.isNotEmpty) map[category] = cars;
    }
    return map;
  }

  @override
  void initState() {
    super.initState();
    _loadRoute();
  }

  Future<void> _loadRoute() async {
    final result = await DirectionsService.fetchRoute(
      origin: widget.request.pickupLatLng,
      destination: widget.request.dropLatLng,
    );
    if (!mounted) return;
    setState(() {
      _route = result;
      _loadingRoute = false;
    });
    await _fitToRoute();
  }

  LatLngBounds _bounds() {
    final points = _route?.points ?? [widget.request.pickupLatLng, widget.request.dropLatLng];
    var minLat = points.first.latitude, maxLat = points.first.latitude;
    var minLng = points.first.longitude, maxLng = points.first.longitude;
    for (final p in points) {
      minLat = math.min(minLat, p.latitude);
      maxLat = math.max(maxLat, p.latitude);
      minLng = math.min(minLng, p.longitude);
      maxLng = math.max(maxLng, p.longitude);
    }
    return LatLngBounds(southwest: LatLng(minLat, minLng), northeast: LatLng(maxLat, maxLng));
  }

  Future<void> _fitToRoute() async {
    await Future.delayed(const Duration(milliseconds: 250));
    if (!mounted || _mapController == null) return;
    await _mapController!.animateCamera(CameraUpdate.newLatLngBounds(_bounds(), 60));
  }

  Future<void> _applyDarkStyle(GoogleMapController controller) async {
    // ignore: deprecated_member_use
    await controller.setMapStyle(_darkMapStyle);
  }

  void _confirm() {
    if (_confirming || _selected == null) return;
    setState(() => _confirming = true);
    // No real matching backend yet — DriverAssignedScreen generates a mock
    // driver itself after a simulated "searching" delay so this flow feels
    // complete end-to-end. The fully-populated RideRequest below (car +
    // distance filled in) is what a real POST /api/bookings would send.
    Navigator.of(context).pushReplacementNamed(
      AppRoutes.driverAssigned,
      arguments: widget.request.copyWith(
        selectedCar: _selected,
        distanceKm: _distanceKm,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final routeLine = _route?.points ?? [widget.request.pickupLatLng, widget.request.dropLatLng];
    // MediaQuery-driven sizing keeps the map proportionate instead of a
    // fixed pixel height that eats too much of a short phone's screen or
    // looks tiny on a tablet-sized device.
    final screenHeight = MediaQuery.of(context).size.height;
    final mapHeight = math.max(200.0, math.min(260.0, screenHeight * 0.28));

    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: const Text('Choose your car'),
        actions: [
          IconButton(
            icon: Icon(_hideMap ? Icons.map : Icons.map_outlined),
            onPressed: () => setState(() => _hideMap = !_hideMap),
            tooltip: 'Toggle Map',
          ),
        ],
      ),
      body: Column(
        children: [
          if (!_hideMap)
            SizedBox(
              height: mapHeight,
              width: double.infinity,
              child: Stack(
                children: [
                  GoogleMap(
                    initialCameraPosition: CameraPosition(target: widget.request.pickupLatLng, zoom: 13),
                    onMapCreated: (c) {
                      _mapController = c;
                      _applyDarkStyle(c);
                      _fitToRoute();
                    },
                    markers: {
                      Marker(
                        markerId: const MarkerId('pickup'),
                        position: widget.request.pickupLatLng,
                        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow),
                        infoWindow: InfoWindow(title: 'Pickup', snippet: widget.request.pickupAddress),
                      ),
                      Marker(
                        markerId: const MarkerId('drop'),
                        position: widget.request.dropLatLng,
                        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
                        infoWindow: InfoWindow(title: 'Drop', snippet: widget.request.dropAddress),
                      ),
                    },
                    polylines: {
                      Polyline(
                        polylineId: const PolylineId('route'),
                        points: routeLine,
                        color: AppColors.primaryGold,
                        width: 4,
                        jointType: JointType.round,
                        startCap: Cap.roundCap,
                        endCap: Cap.roundCap,
                      ),
                    },
                    myLocationButtonEnabled: false,
                    zoomControlsEnabled: false,
                    mapToolbarEnabled: false,
                    compassEnabled: false,
                  ),
                  if (_loadingRoute)
                    const Positioned(
                      top: 12,
                      left: 12,
                      child: _Chip(label: 'Finding best route…', icon: Icons.route),
                    ),
                ],
              ),
            ),
          Expanded(
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 14, 20, 8),
                    child: _TripSummaryCard(
                      request: widget.request,
                      distanceLabel: _loadingRoute
                          ? 'Calculating distance…'
                          : '${_distanceKm.toStringAsFixed(1)} km'
                              '${_route != null ? ' · ${_route!.durationText}' : ''}',
                      days: _numberOfDays,
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 4),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text('Choose a car', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final entry = _carsByCategory.entries.elementAt(index);
                        return _CategorySection(
                          category: entry.key,
                          cars: entry.value,
                          selected: _selected,
                          fareFor: _fareFor,
                          onSelect: (car) => setState(() => _selected = car),
                        );
                      },
                      childCount: _carsByCategory.length,
                    ),
                  ),
                ),
              ],
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: PrimaryButton(
                label: _selected != null
                    ? 'Confirm ${_selected!.name} · ₹${_fareFor(_selected!)}'
                    : 'Select a car to continue',
                isLoading: _confirming,
                onPressed: (_confirming || _selected == null) ? null : _confirm,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final IconData icon;
  const _Chip({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.primaryGold),
          const SizedBox(width: 6),
          Text(label, style: AppTextStyles.caption.copyWith(color: Colors.white)),
        ],
      ),
    );
  }
}

/// Route + trip-length recap shown above the car list, so the fare on each
/// car card below makes sense at a glance (distance and day count are both
/// inputs to the fare formula).
class _TripSummaryCard extends StatelessWidget {
  final RideRequest request;
  final String distanceLabel;
  final int days;

  const _TripSummaryCard({
    required this.request,
    required this.distanceLabel,
    required this.days,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Icon(Icons.circle, size: 10, color: colors.accentIcon),
                  Container(width: 1.5, height: 22, color: colors.divider),
                  Icon(Icons.square, size: 10, color: colors.textSecondary),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(request.pickupAddress, style: AppTextStyles.body.copyWith(color: colors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 8),
                    Text(request.dropAddress, style: AppTextStyles.body.copyWith(color: colors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Divider(color: colors.divider, height: 1),
          const SizedBox(height: 10),
          // Wrap instead of a fixed Row so this never overflows on narrow
          // phones — the day-count chip simply drops to the next line if
          // the distance text is long.
          Wrap(
            spacing: 14,
            runSpacing: 6,
            children: [
              _MetaChip(icon: Icons.route, label: distanceLabel),
              _MetaChip(icon: Icons.event_available_rounded, label: '$days day${days == 1 ? '' : 's'}'),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _MetaChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: colors.accentIcon),
        const SizedBox(width: 6),
        Text(label, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
      ],
    );
  }
}

/// One category block: header (name + subtitle) followed by that
/// category's car cards. Purely a display grouping — `VehicleCategory`
/// itself carries no pricing, each `CarModel` does.
class _CategorySection extends StatelessWidget {
  final VehicleCategory category;
  final List<CarModel> cars;
  final CarModel? selected;
  final int Function(CarModel) fareFor;
  final ValueChanged<CarModel> onSelect;

  const _CategorySection({
    required this.category,
    required this.cars,
    required this.selected,
    required this.fareFor,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(category.label, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700, color: colors.textPrimary)),
          const SizedBox(height: 2),
          Text(category.subtitle, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
          const SizedBox(height: 10),
          for (final car in cars)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _CarOption(
                car: car,
                fare: fareFor(car),
                selected: selected?.id == car.id,
                onTap: () => onSelect(car),
              ),
            ),
        ],
      ),
    );
  }
}

/// A single selectable car row: name, seat count, per-day/per-km rates, and
/// the computed total fare for this trip. Uses a `RadioListTile`-style
/// custom layout (matching the app's existing hand-rolled selectable-card
/// pattern) rather than Flutter's built-in Radio widget, for full control
/// over spacing and dark-theme styling.
class _CarOption extends StatelessWidget {
  final CarModel car;
  final int fare;
  final bool selected;
  final VoidCallback onTap;

  const _CarOption({
    required this.car,
    required this.fare,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Semantics(
      button: true,
      selected: selected,
      label: '${car.name}, ₹$fare total for this trip',
      child: Material(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: selected ? AppColors.primaryGold : colors.inputBorder,
                width: selected ? 1.6 : 1,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 44,
                  width: 44,
                  decoration: BoxDecoration(color: colors.background, borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.directions_car_filled_outlined, color: AppColors.primaryGold, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        car.name,
                        style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: colors.textPrimary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${car.seatCount} seats · ₹${car.perDayRate.toStringAsFixed(0)}/day + '
                        '₹${car.perKmRate.toStringAsFixed(0)}/km',
                        style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('₹$fare', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700, color: colors.textPrimary)),
                    const SizedBox(height: 4),
                    Icon(
                      selected ? Icons.radio_button_checked : Icons.radio_button_off,
                      color: selected ? colors.accentIcon : colors.textSecondary,
                      size: 20,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

const String _darkMapStyle = '''
[
  {"elementType": "geometry", "stylers": [{"color": "#121214"}]},
  {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]},
  {"elementType": "labels.text.fill", "stylers": [{"color": "#71717A"}]},
  {"elementType": "labels.text.stroke", "stylers": [{"color": "#09090B"}]},
  {"featureType": "administrative", "elementType": "geometry", "stylers": [{"color": "#27272A"}]},
  {"featureType": "poi", "stylers": [{"visibility": "off"}]},
  {"featureType": "road", "elementType": "geometry", "stylers": [{"color": "#18181B"}]},
  {"featureType": "road", "elementType": "geometry.stroke", "stylers": [{"color": "#27272A"}]},
  {"featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#3F3F46"}]},
  {"featureType": "transit", "stylers": [{"visibility": "off"}]},
  {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#000000"}]}
]
''';
