import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../app/theme.dart';
import '../../core/data/directions_service.dart';
import '../../core/models/ride.dart';
import '../../core/widgets/app_button.dart';

/// Real in-app turn-by-turn navigation — the driver's live location drives
/// a rotating, tilted "chase camera" (like Google/Apple/Uber/Ola/Rapido
/// navigation), a top banner shows the current turn instruction, and a
/// bottom bar shows remaining distance/ETA. No handoff to an external maps
/// app — everything here renders inside this screen.
///
/// How it works:
/// - `DirectionsService` gives us the road-following route + turn-by-turn
///   steps (each with a maneuver, an instruction, and where it ends).
/// - `Geolocator.getPositionStream` streams live GPS fixes; each fix moves
///   the driver marker, re-points the camera bearing to the direction of
///   travel, and checks whether we've reached the end of the current step
///   (within `_stepAdvanceRadiusMeters`) — if so, we advance to the next
///   instruction.
/// - Remaining distance/ETA are recomputed from the *current* step's
///   leftover distance plus the distance of every step still ahead, so
///   they count down as the driver actually drives, not just once at load.
class InAppNavigationScreen extends StatefulWidget {
  final Ride ride;
  final LatLng destination;
  final String destinationLabel;

  const InAppNavigationScreen({
    super.key,
    required this.ride,
    required this.destination,
    required this.destinationLabel,
  });

  @override
  State<InAppNavigationScreen> createState() => _InAppNavigationScreenState();
}

class _InAppNavigationScreenState extends State<InAppNavigationScreen> {
  static const double _stepAdvanceRadiusMeters = 25;
  static const double _arrivalRadiusMeters = 30;
  // Rough average speed used only to convert "remaining meters" into an
  // ETA between GPS fixes, so the ETA doesn't sit frozen between updates.
  static const double _fallbackSpeedMetersPerSecond = 8.3; // ~30 km/h

  GoogleMapController? _mapController;
  StreamSubscription<Position>? _positionSub;

  RouteResult? _route;
  bool _loadingRoute = true;
  bool _locationReady = false;
  String? _locationError;

  LatLng? _driverPos;
  double _heading = 0;
  int _currentStepIndex = 0;
  bool _arrived = false;
  double _remainingMeters = 0;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _ensureLocationPermission();
    await _loadRoute();
    _startLocationUpdates();
  }

  Future<void> _ensureLocationPermission() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) setState(() => _locationError = 'Turn on location services to navigate.');
      return;
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        setState(() => _locationError = 'Location permission is denied. Enable it in Settings to navigate.');
      }
      return;
    }

    final granted = permission == LocationPermission.always || permission == LocationPermission.whileInUse;
    if (mounted) setState(() => _locationReady = granted);
  }

  Future<void> _loadRoute() async {
    LatLng origin = LatLng(widget.ride.pickupLat ?? widget.destination.latitude,
        widget.ride.pickupLng ?? widget.destination.longitude);
    if (_locationReady) {
      try {
        final pos = await Geolocator.getCurrentPosition();
        origin = LatLng(pos.latitude, pos.longitude);
      } catch (_) {
        // Keep the pickup-based fallback above.
      }
    }

    final result = await DirectionsService.fetchRoute(origin: origin, destination: widget.destination);
    if (!mounted) return;
    setState(() {
      _route = result;
      _remainingMeters = result?.distanceMeters ?? 0;
      _loadingRoute = false;
      _driverPos ??= origin;
    });
    if (result != null) _recenterCamera();
  }

  void _startLocationUpdates() {
    if (!_locationReady) return;
    const settings = LocationSettings(
      accuracy: LocationAccuracy.bestForNavigation,
      distanceFilter: 5, // metres — avoid redrawing on GPS jitter
    );
    _positionSub = Geolocator.getPositionStream(locationSettings: settings).listen(_onPosition);
  }

  void _onPosition(Position position) {
    final newPos = LatLng(position.latitude, position.longitude);
    // `heading` is -1 when the device can't determine it (e.g. stationary
    // on some Android devices) — keep the last known heading rather than
    // snapping the camera back to 0/north.
    final heading = position.heading >= 0 ? position.heading : _heading;

    setState(() {
      _driverPos = newPos;
      _heading = heading;
    });

    _advanceStepIfNeeded(newPos);
    _updateRemainingDistance(newPos);
    _checkArrival(newPos);
    _followCamera(newPos, heading);
  }

  void _advanceStepIfNeeded(LatLng pos) {
    final steps = _route?.steps;
    if (steps == null || steps.isEmpty || _currentStepIndex >= steps.length) return;

    final step = steps[_currentStepIndex];
    final distToStepEnd = Geolocator.distanceBetween(
      pos.latitude,
      pos.longitude,
      step.endLocation.latitude,
      step.endLocation.longitude,
    );

    if (distToStepEnd < _stepAdvanceRadiusMeters && _currentStepIndex < steps.length - 1) {
      setState(() => _currentStepIndex++);
    }
  }

  void _updateRemainingDistance(LatLng pos) {
    final steps = _route?.steps;
    if (steps == null || steps.isEmpty || _currentStepIndex >= steps.length) return;

    // Distance left on the step we're currently driving...
    final step = steps[_currentStepIndex];
    double remaining = Geolocator.distanceBetween(
      pos.latitude,
      pos.longitude,
      step.endLocation.latitude,
      step.endLocation.longitude,
    );
    // ...plus every full step still ahead of it.
    for (var i = _currentStepIndex + 1; i < steps.length; i++) {
      remaining += steps[i].distanceMeters;
    }
    setState(() => _remainingMeters = remaining);
  }

  void _checkArrival(LatLng pos) {
    final distToDest = Geolocator.distanceBetween(
      pos.latitude,
      pos.longitude,
      widget.destination.latitude,
      widget.destination.longitude,
    );
    if (distToDest < _arrivalRadiusMeters && !_arrived) {
      setState(() => _arrived = true);
    }
  }

  Future<void> _followCamera(LatLng pos, double heading) async {
    if (_mapController == null) return;
    await _mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(target: pos, zoom: 17.5, tilt: 55, bearing: heading),
      ),
    );
  }

  Future<void> _recenterCamera() async {
    if (_mapController == null || _driverPos == null) return;
    await _mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(target: _driverPos!, zoom: 17.5, tilt: 55, bearing: _heading),
      ),
    );
  }

  Future<void> _applyDarkStyle(GoogleMapController controller) async {
    // ignore: deprecated_member_use
    await controller.setMapStyle(_darkNavStyle);
  }

  @override
  void dispose() {
    _positionSub?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  IconData _maneuverIcon(String maneuver) {
    if (maneuver.contains('uturn')) return Icons.u_turn_left;
    if (maneuver.contains('sharp-left')) return Icons.turn_sharp_left;
    if (maneuver.contains('sharp-right')) return Icons.turn_sharp_right;
    if (maneuver.contains('slight-left')) return Icons.turn_slight_left;
    if (maneuver.contains('slight-right')) return Icons.turn_slight_right;
    if (maneuver.contains('left')) return Icons.turn_left;
    if (maneuver.contains('right')) return Icons.turn_right;
    if (maneuver.contains('roundabout')) return Icons.roundabout_left;
    if (maneuver.contains('merge')) return Icons.merge;
    if (maneuver.contains('ramp')) return Icons.ramp_right;
    if (maneuver.contains('fork')) return Icons.fork_right;
    return Icons.straight;
  }

  String _formatRemainingDistance(double meters) {
    if (meters >= 1000) return '${(meters / 1000).toStringAsFixed(1)} km';
    return '${meters.round()} m';
  }

  String _formatEta(double meters) {
    final seconds = meters / _fallbackSpeedMetersPerSecond;
    final minutes = (seconds / 60).ceil();
    if (minutes < 1) return '<1 min';
    if (minutes < 60) return '$minutes min';
    final hours = minutes ~/ 60;
    final mins = minutes % 60;
    return '${hours}h ${mins}m';
  }

  @override
  Widget build(BuildContext context) {
    final steps = _route?.steps ?? const [];
    final currentStep = (steps.isNotEmpty && _currentStepIndex < steps.length) ? steps[_currentStepIndex] : null;
    final topInset = MediaQuery.of(context).padding.top;
    final showInstructionArea = _locationError == null && (currentStep != null || _arrived);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          if (_locationError != null)
            _CenteredMessage(
              icon: Icons.location_off_outlined,
              message: _locationError!,
              onClose: () => Navigator.of(context).pop(),
            )
          else if (_loadingRoute || _driverPos == null)
            Center(child: CircularProgressIndicator(color: AppColors.gold))
          else
            GoogleMap(
              initialCameraPosition: CameraPosition(target: _driverPos!, zoom: 17.5, tilt: 55),
              onMapCreated: (c) {
                _mapController = c;
                _applyDarkStyle(c);
                _recenterCamera();
              },
              polylines: {
                if (_route != null)
                  Polyline(
                    polylineId: const PolylineId('nav-route'),
                    points: _route!.points,
                    color: AppColors.gold,
                    width: 6,
                    jointType: JointType.round,
                    startCap: Cap.roundCap,
                    endCap: Cap.roundCap,
                  ),
              },
              markers: {
                Marker(
                  markerId: const MarkerId('destination'),
                  position: widget.destination,
                  icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
                  infoWindow: InfoWindow(title: widget.destinationLabel),
                ),
                if (_driverPos != null)
                  Marker(
                    markerId: const MarkerId('driver'),
                    position: _driverPos!,
                    icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
                    rotation: _heading,
                    anchor: const Offset(0.5, 0.5),
                    flat: true,
                    zIndex: 2,
                  ),
              },
              myLocationEnabled: false,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              compassEnabled: false,
              mapToolbarEnabled: false,
              liteModeEnabled: false,
            ),

          // --- Top turn instruction banner ---
          if (currentStep != null && !_arrived && _locationError == null)
            Positioned(
              top: topInset + 12,
              left: 16,
              right: 16,
              child: _InstructionBanner(
                icon: _maneuverIcon(currentStep.maneuver),
                instruction: currentStep.instruction,
                distanceText: currentStep.distanceText,
              ),
            ),

          if (_arrived)
            Positioned(
              top: topInset + 12,
              left: 16,
              right: 16,
              child: _ArrivedBanner(label: widget.destinationLabel),
            ),

          // --- Close button (top-right; sits beside the banner once one
          // is showing, or alone in the corner before the route loads) ---
          if (_locationError == null)
            Positioned(
              top: topInset + 12,
              right: 16,
              child: showInstructionArea
                  ? const SizedBox.shrink()
                  : _CloseButton(onTap: () => Navigator.of(context).pop()),
            ),

          // --- Bottom ETA / distance bar ---
          if (!_loadingRoute && _locationError == null)
            Positioned(
              left: 16,
              right: 16,
              bottom: 20,
              child: _BottomEtaBar(
                distanceLabel: _formatRemainingDistance(_remainingMeters),
                etaLabel: _formatEta(_remainingMeters),
                destinationLabel: widget.destinationLabel,
                arrived: _arrived,
                onEnd: () => Navigator.of(context).pop(),
              ),
            ),

          // --- Recenter button ---
          if (!_loadingRoute && _locationError == null && !_arrived)
            Positioned(
              right: 16,
              bottom: 110,
              child: _RecenterButton(onTap: _recenterCamera),
            ),
        ],
      ),
    );
  }
}

class _InstructionBanner extends StatelessWidget {
  final IconData icon;
  final String instruction;
  final String distanceText;

  const _InstructionBanner({required this.icon, required this.instruction, required this.distanceText});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.borderSubtle2),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 6))],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.goldTint),
              child: Icon(icon, color: AppColors.gold, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(distanceText,
                      style: TextStyle(color: AppColors.gold, fontSize: 13, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(
                    instruction,
                    style:
                        TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w600, height: 1.3),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            _CloseButton(onTap: () => Navigator.of(context).pop()),
          ],
        ),
      ),
    );
  }
}

class _ArrivedBanner extends StatelessWidget {
  final String label;
  const _ArrivedBanner({required this.label});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.success.withOpacity(0.15),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.success),
        ),
        child: Row(
          children: [
            const Icon(Icons.flag_circle, color: AppColors.success, size: 28),
            const SizedBox(width: 12),
            Expanded(
              child: Text('You have arrived at $label',
                  style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700)),
            ),
            _CloseButton(onTap: () => Navigator.of(context).pop()),
          ],
        ),
      ),
    );
  }
}

class _CloseButton extends StatelessWidget {
  final VoidCallback onTap;
  const _CloseButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black54,
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: const Padding(
          padding: EdgeInsets.all(8),
          child: Icon(Icons.close, color: Colors.white, size: 22),
        ),
      ),
    );
  }
}

class _RecenterButton extends StatelessWidget {
  final VoidCallback onTap;
  const _RecenterButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      shape: const CircleBorder(),
      elevation: 4,
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: const Padding(
          padding: EdgeInsets.all(12),
          child: Icon(Icons.my_location, color: AppColors.gold, size: 22),
        ),
      ),
    );
  }
}

class _BottomEtaBar extends StatelessWidget {
  final String distanceLabel;
  final String etaLabel;
  final String destinationLabel;
  final bool arrived;
  final VoidCallback onEnd;

  const _BottomEtaBar({
    required this.distanceLabel,
    required this.etaLabel,
    required this.destinationLabel,
    required this.arrived,
    required this.onEnd,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderSubtle2),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, -4))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  destinationLabel,
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(etaLabel,
                        style: TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.w800)),
                    const SizedBox(width: 8),
                    Text('· $distanceLabel',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 14, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(
            width: 120,
            child: AppButton(
              label: arrived ? 'Done' : 'End',
              height: 44,
              variant: AppButtonVariant.secondary,
              onPressed: onEnd,
            ),
          ),
        ],
      ),
    );
  }
}

class _CenteredMessage extends StatelessWidget {
  final IconData icon;
  final String message;
  final VoidCallback onClose;

  const _CenteredMessage({required this.icon, required this.message, required this.onClose});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: AppColors.textFaint),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary, fontSize: 15)),
            const SizedBox(height: 24),
            SizedBox(width: 160, child: AppButton(label: 'Close', onPressed: onClose, height: 46)),
          ],
        ),
      ),
    );
  }
}

/// Slightly higher-contrast dark style than the preview map's — navigation
/// mode needs the route line and driver marker to pop more since the
/// driver is glancing at this while moving.
const String _darkNavStyle = '''
[
  {"elementType": "geometry", "stylers": [{"color": "#0B0B0D"}]},
  {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]},
  {"elementType": "labels.text.fill", "stylers": [{"color": "#9CA3AF"}]},
  {"elementType": "labels.text.stroke", "stylers": [{"color": "#000000"}]},
  {"featureType": "administrative", "elementType": "geometry", "stylers": [{"color": "#27272A"}]},
  {"featureType": "poi", "stylers": [{"visibility": "off"}]},
  {"featureType": "road", "elementType": "geometry", "stylers": [{"color": "#1F1F23"}]},
  {"featureType": "road", "elementType": "geometry.stroke", "stylers": [{"color": "#2E2E33"}]},
  {"featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#46464E"}]},
  {"featureType": "transit", "stylers": [{"visibility": "off"}]},
  {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#000000"}]}
]
''';
