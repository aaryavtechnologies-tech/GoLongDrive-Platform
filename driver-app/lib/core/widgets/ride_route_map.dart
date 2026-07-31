import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../app/theme.dart';
import '../data/directions_service.dart';
import '../data/geocoding_service.dart';
import '../models/ride.dart';
import '../utils/navigation_launcher.dart';
import 'app_button.dart';
import 'card_decoration.dart';
import '../../features/navigation/in_app_navigation_screen.dart';

/// Which leg of the trip "Start Navigation" should point at. The driver
/// needs different directions depending on where they are in the trip:
/// before pickup they need to get to the rider, after pickup they need to
/// get to the drop.
enum NavTarget { pickup, drop }

/// Google Map card showing a pickup marker (gold) and drop marker (white),
/// auto-framed to fit both. Falls back to the old icon placeholder if the
/// ride has no coordinates (`ride.hasRouteCoordinates == false`), so this
/// is a safe drop-in replacement everywhere the map placeholder was used.
///
/// The route line follows actual roads (via the Google Directions API)
/// instead of being a straight line between pickup and drop — see
/// `DirectionsService`. If no Directions API key is configured, or the
/// lookup fails for any reason, this quietly falls back to the old
/// straight line so the map never breaks.
///
/// Requires a Maps SDK API key configured natively — see MAPS_SETUP.md at
/// the repo root for the two-file change needed (AndroidManifest.xml /
/// AppDelegate.swift). Without a key the widget still compiles and runs;
/// Google's SDK just renders a "For development purposes only" watermark.
class RideRouteMap extends StatefulWidget {
  final Ride ride;
  final double height;
  final double borderRadius;
  final bool showDriverLocation;

  const RideRouteMap({
    super.key,
    required this.ride,
    this.height = 180,
    this.borderRadius = 20,
    this.showDriverLocation = false,
  });

  @override
  State<RideRouteMap> createState() => _RideRouteMapState();
}

class _RideRouteMapState extends State<RideRouteMap> {
  GoogleMapController? _controller;
  bool _locationPermissionGranted = false;

  // --- Real road-following route (falls back to a straight line until
  // this resolves, or forever if it fails / no key is configured) ---
  List<LatLng>? _routePoints;

  @override
  void initState() {
    super.initState();
    if (widget.showDriverLocation) _requestLocationPermission();
    _loadRoute();
  }

  @override
  void didUpdateWidget(covariant RideRouteMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.ride.id != widget.ride.id) {
      _routePoints = null;
      _loadRoute();
    }
  }

  Future<void> _loadRoute() async {
    final ride = widget.ride;
    if (!ride.hasRouteCoordinates) return;

    final pickup = LatLng(ride.pickupLat!, ride.pickupLng!);
    final drop = LatLng(ride.dropLat!, ride.dropLng!);
    final result = await DirectionsService.fetchRoute(origin: pickup, destination: drop);
    if (!mounted || result == null) return;

    setState(() => _routePoints = result.points);

    // Re-fit the camera now that we know the real route's extent (it can
    // bow out well beyond the pickup/drop bounding box on winding roads).
    await _fitToPoints(result.points);
  }

  /// google_maps_flutter's `myLocationEnabled: true` throws if the OS
  /// permission hasn't already been granted — it does not prompt for you.
  /// This asks via geolocator first; the blue dot only turns on once
  /// permission actually comes back granted, so the map never crashes on a
  /// fresh install.
  Future<void> _requestLocationPermission() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    final granted = permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
    if (mounted && granted) setState(() => _locationPermissionGranted = true);
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  LatLngBounds _boundsFor(LatLng a, LatLng b) {
    return LatLngBounds(
      southwest: LatLng(math.min(a.latitude, b.latitude), math.min(a.longitude, b.longitude)),
      northeast: LatLng(math.max(a.latitude, b.latitude), math.max(a.longitude, b.longitude)),
    );
  }

  LatLngBounds _boundsForPoints(List<LatLng> points) {
    var minLat = points.first.latitude, maxLat = points.first.latitude;
    var minLng = points.first.longitude, maxLng = points.first.longitude;
    for (final p in points) {
      minLat = math.min(minLat, p.latitude);
      maxLat = math.max(maxLat, p.latitude);
      minLng = math.min(minLng, p.longitude);
      maxLng = math.max(maxLng, p.longitude);
    }
    return LatLngBounds(
      southwest: LatLng(minLat, minLng),
      northeast: LatLng(maxLat, maxLng),
    );
  }

  Future<void> _fitToRoute(LatLng pickup, LatLng drop) async {
    // Small delay lets the map finish its first layout pass before we ask
    // it to animate the camera — calling this too early is a no-op on some
    // platforms.
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted || _controller == null) return;
    await _controller!.animateCamera(
      CameraUpdate.newLatLngBounds(_boundsFor(pickup, drop), 56),
    );
  }

  Future<void> _fitToPoints(List<LatLng> points) async {
    if (!mounted || _controller == null || points.isEmpty) return;
    await _controller!.animateCamera(
      CameraUpdate.newLatLngBounds(_boundsForPoints(points), 56),
    );
  }

  Future<void> _applyDarkStyle(GoogleMapController controller) async {
    // Using the controller method (not the newer `style:` constructor
    // param) deliberately — it's supported on every google_maps_flutter
    // version back to 0.5.16, so it won't break on whatever exact version
    // ends up resolved in pubspec.lock. It's marked deprecated on very
    // recent releases in favor of the constructor param, but deprecation
    // is a lint warning, not a compile error, so this stays safe either way.
    // ignore: deprecated_member_use
    await controller.setMapStyle(_darkMapStyle);
  }

  @override
  Widget build(BuildContext context) {
    final ride = widget.ride;

    if (!ride.hasRouteCoordinates) {
      return Container(
        height: widget.height,
        decoration: cardDecoration(radius: widget.borderRadius, bg: AppColors.surfaceAlt),
        child: Center(
          child: Icon(Icons.map_outlined, size: 40, color: AppColors.textFaint),
        ),
      );
    }

    final pickup = LatLng(ride.pickupLat!, ride.pickupLng!);
    final drop = LatLng(ride.dropLat!, ride.dropLng!);

    // Road-following route once it's loaded; a straight line as an
    // immediate placeholder so the map never looks empty while it loads
    // (or forever, if no Directions API key is configured).
    final routeLine = _routePoints ?? [pickup, drop];

    return ClipRRect(
      borderRadius: BorderRadius.circular(widget.borderRadius),
      child: Container(
        height: widget.height,
        decoration: BoxDecoration(border: Border.all(color: AppColors.borderSubtle2)),
        child: GoogleMap(
          initialCameraPosition: CameraPosition(target: pickup, zoom: 12),
          onMapCreated: (controller) {
            _controller = controller;
            _applyDarkStyle(controller);
            if (_routePoints != null) {
              _fitToPoints(_routePoints!);
            } else {
              _fitToRoute(pickup, drop);
            }
          },
          markers: {
            Marker(
              markerId: const MarkerId('pickup'),
              position: pickup,
              icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow),
              infoWindow: InfoWindow(title: 'Pickup', snippet: ride.pickupAddress),
            ),
            Marker(
              markerId: const MarkerId('drop'),
              position: drop,
              icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
              infoWindow: InfoWindow(title: 'Drop', snippet: ride.dropAddress),
            ),
          },
          polylines: {
            Polyline(
              polylineId: const PolylineId('route'),
              points: routeLine,
              color: AppColors.gold,
              width: 4,
              jointType: JointType.round,
              startCap: Cap.roundCap,
              endCap: Cap.roundCap,
            ),
          },
          myLocationEnabled: widget.showDriverLocation && _locationPermissionGranted,
          myLocationButtonEnabled: false,
          zoomControlsEnabled: false,
          mapToolbarEnabled: false,
          compassEnabled: false,
          liteModeEnabled: false,
        ),
      ),
    );
  }
}

/// Opens the big "Navigation" map card as a full-screen overlay dialog.
/// Tapping the ✕ in the top-right corner (or the scrim behind the card)
/// closes it and returns to whichever screen (Ride Details / Current Ride)
/// it was opened from. This is the "let the driver see full navigation
/// in-app" entry point — same `RideRouteMap` widget, just rendered large,
/// with a "Start Navigation" button that hands off to the device's native
/// turn-by-turn navigation (Google Maps / Apple Maps) — the same thing
/// Uber/Ola/Rapido's driver apps do when you tap "Start Trip"/"Navigate".
void showFullMapCard(
  BuildContext context,
  Ride ride, {
  bool showDriverLocation = false,
  NavTarget navTarget = NavTarget.pickup,
}) {
  if (!ride.hasRouteCoordinates) return;

  showDialog(
    context: context,
    barrierColor: Colors.black.withOpacity(0.7),
    builder: (dialogContext) {
      final screenHeight = MediaQuery.of(dialogContext).size.height;
      final destination = navTarget == NavTarget.pickup
          ? LatLng(ride.pickupLat!, ride.pickupLng!)
          : LatLng(ride.dropLat!, ride.dropLng!);
      final destinationLabel = navTarget == NavTarget.pickup ? ride.pickupAddress : ride.dropAddress;

      return Dialog(
        insetPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 40),
        backgroundColor: Colors.transparent,
        child: Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: Border.all(color: AppColors.borderSubtle2),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 18, 12, 12),
                      child: Row(
                        children: [
                          Icon(Icons.navigation_outlined, color: AppColors.gold, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Navigation',
                              style: TextStyle(
                                color: AppColors.textPrimary,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: screenHeight * 0.52,
                      width: double.infinity,
                      child: RideRouteMap(
                        ride: ride,
                        height: screenHeight * 0.52,
                        borderRadius: 0,
                        showDriverLocation: showDriverLocation,
                      ),
                    ),
                    // Everything below the map scrolls instead of
                    // overflowing — the map is a fixed height, but the
                    // address block + coordinate debug strip + buttons
                    // together can be taller than the remaining dialog
                    // space on shorter screens (this used to throw a
                    // "RenderFlex overflowed" error there).
                    Flexible(
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Column(
                                    children: [
                                      const Icon(Icons.circle, size: 10, color: AppColors.gold),
                                      Container(width: 1.5, height: 24, color: AppColors.divider),
                                      Icon(Icons.location_on, size: 12, color: AppColors.textMuted),
                                    ],
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(ride.pickupAddress,
                                            style: TextStyle(color: AppColors.textPrimary, fontSize: 13, height: 1.3)),
                                        const SizedBox(height: 12),
                                        Text(ride.dropAddress,
                                            style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.3)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                              child: _CoordinateDebugStrip(ride: ride),
                            ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
                              child: AppButton(
                                label: 'Start Navigation',
                                height: 52,
                                rightIcon: const Icon(Icons.navigation, size: 18, color: Colors.black),
                                onPressed: () {
                                  Navigator.of(dialogContext).pop();
                                  Navigator.of(context, rootNavigator: true).push(
                                    MaterialPageRoute(
                                      builder: (_) => InAppNavigationScreen(
                                        ride: ride,
                                        destination: destination,
                                        destinationLabel: destinationLabel,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                              child: TextButton.icon(
                                onPressed: () {
                                  NavigationLauncher.start(destination: destination, label: destinationLabel);
                                },
                                icon: Icon(Icons.open_in_new, size: 15, color: AppColors.textMuted),
                                label: Text('Open in Google Maps instead',
                                    style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // --- Close (✕) button, top-right ---
            Positioned(
              top: 10,
              right: 10,
              child: Material(
                color: Colors.black54,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: () => Navigator.of(dialogContext).pop(),
                  child: const Padding(
                    padding: EdgeInsets.all(8),
                    child: Icon(Icons.close, color: Colors.white, size: 22),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    },
  );
}

/// Small "tap to open full navigation" affordance overlaid on a preview
/// `RideRouteMap`. Wrap any `RideRouteMap(...)` usage with this to make it
/// tappable — a plain `InkWell`/`GestureDetector` wrapper around
/// `RideRouteMap` alone won't reliably catch the tap because `GoogleMap`
/// claims its own gesture arena for pan/zoom, so this places an opaque
/// full-size tap layer *above* the map instead.
class RideRouteMapTappable extends StatefulWidget {
  final Ride ride;
  final double height;
  final double borderRadius;
  final bool showDriverLocation;
  final NavTarget navTarget;

  const RideRouteMapTappable({
    super.key,
    required this.ride,
    this.height = 180,
    this.borderRadius = 20,
    this.showDriverLocation = false,
    this.navTarget = NavTarget.pickup,
  });

  @override
  State<RideRouteMapTappable> createState() => _RideRouteMapTappableState();
}

class _RideRouteMapTappableState extends State<RideRouteMapTappable> {
  // The ride actually used to render/navigate, once we know whether it
  // already has coordinates or needed a geocoding fallback. Null while
  // still resolving, and stays null forever if resolution fails (no
  // coordinates AND geocoding couldn't locate the address either).
  Ride? _resolvedRide;
  bool _resolving = false;

  @override
  void initState() {
    super.initState();
    _resolve();
  }

  @override
  void didUpdateWidget(covariant RideRouteMapTappable oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.ride.id != widget.ride.id) {
      _resolvedRide = null;
      _resolve();
    }
  }

  Future<void> _resolve() async {
    if (widget.ride.hasRouteCoordinates) {
      setState(() => _resolvedRide = widget.ride);
      return;
    }
    // No coordinates on this ride at all — try geocoding the address text
    // as a fallback instead of leaving the driver with a permanent "no map
    // available" placeholder.
    setState(() => _resolving = true);
    final resolved = await GeocodingService.geocodeRide(widget.ride);
    if (!mounted) return;
    setState(() {
      _resolvedRide = resolved;
      _resolving = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final ride = _resolvedRide;
    return Stack(
      children: [
        RideRouteMap(
          ride: ride ?? widget.ride,
          height: widget.height,
          borderRadius: widget.borderRadius,
          showDriverLocation: widget.showDriverLocation,
        ),
        if (ride != null && ride.hasRouteCoordinates)
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(widget.borderRadius),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => showFullMapCard(
                    context,
                    ride,
                    showDriverLocation: widget.showDriverLocation,
                    navTarget: widget.navTarget,
                  ),
                  child: Align(
                    alignment: Alignment.bottomRight,
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.fullscreen, color: Colors.white, size: 14),
                            SizedBox(width: 4),
                            Text('Navigate', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          )
        else if (_resolving)
          Positioned.fill(
            child: Align(
              alignment: Alignment.bottomRight,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      ),
                      SizedBox(width: 6),
                      Text('Locating…', style: TextStyle(color: Colors.white, fontSize: 11)),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Shows the *exact* pickup/drop coordinates this ride is navigating with,
/// right next to the address text, so a mismatch between the two (address
/// says "Jalandhar", numbers point somewhere else entirely) is visible at a
/// glance instead of only showing up once "Start Navigation" opens the
/// wrong place. Also flags when those coordinates were geocoded from the
/// address text as a fallback (`ride.isGeocoded`), since that's an
/// approximation rather than an exact recorded location.
class _CoordinateDebugStrip extends StatelessWidget {
  final Ride ride;

  const _CoordinateDebugStrip({required this.ride});

  String _fmt(double? v) => v == null ? '—' : v.toStringAsFixed(4);

  @override
  Widget build(BuildContext context) {
    if (!ride.hasRouteCoordinates) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderSubtle2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                ride.isGeocoded ? Icons.warning_amber_rounded : Icons.verified_outlined,
                size: 13,
                color: ride.isGeocoded ? AppColors.gold : AppColors.textFaint,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  ride.isGeocoded
                      ? 'Approximate — geocoded from the address text (no coordinates were provided for this ride)'
                      : 'Exact coordinates this ride is navigating with',
                  style: TextStyle(color: AppColors.textFaint, fontSize: 10.5, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Pickup   ${_fmt(ride.pickupLat)}, ${_fmt(ride.pickupLng)}\n'
            'Drop     ${_fmt(ride.dropLat)}, ${_fmt(ride.dropLng)}',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11.5,
              fontFamily: 'monospace',
              height: 1.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "If these numbers don't land on the address above, the ride's "
            'stored coordinates are wrong at the source — this screen '
            'always navigates to the numbers, never the address text.',
            style: TextStyle(color: AppColors.textFaint, fontSize: 9.5, height: 1.3),
          ),
        ],
      ),
    );
  }
}

/// Dark map style JSON (Google's "Night" preset, lightly retinted toward
/// the app's near-black/gold palette) so the map doesn't look like a jarring
/// white rectangle dropped into an otherwise all-dark UI.
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
