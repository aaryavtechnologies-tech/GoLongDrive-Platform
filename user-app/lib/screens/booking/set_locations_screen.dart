// lib/screens/booking/set_locations_screen.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/places_service.dart';
import '../../models/ride_request.dart';
import '../../widgets/primary_button.dart';
import '../../routes/app_routes.dart';

enum _ActiveField { pickup, drop }

/// Step 1 of booking: pickup (auto-filled from the rider's GPS position,
/// but editable — a rider can be booking for a different location than
/// where they're standing) and destination, both backed by Google Places
/// Autocomplete. Search results only ever set real coordinates (from Place
/// Details / reverse geocoding) — free-typed text alone never becomes a
/// pickup/drop point, so the next screen always has real lat/lng to route
/// with.
class SetLocationsScreen extends StatefulWidget {
  const SetLocationsScreen({super.key});

  @override
  State<SetLocationsScreen> createState() => _SetLocationsScreenState();
}

class _SetLocationsScreenState extends State<SetLocationsScreen> {
  final _pickupController = TextEditingController();
  final _dropController = TextEditingController();
  final _pickupFocus = FocusNode();
  final _dropFocus = FocusNode();

  _ActiveField _activeField = _ActiveField.drop;
  List<PlaceSuggestion> _suggestions = [];
  bool _searching = false;
  Timer? _debounce;

  LatLng? _pickupLatLng;
  LatLng? _dropLatLng;

  bool _locatingPickup = true;
  String? _locationError;

  @override
  void initState() {
    super.initState();
    _dropFocus.requestFocus();
    _pickupFocus.addListener(() {
      if (_pickupFocus.hasFocus) setState(() => _activeField = _ActiveField.pickup);
    });
    _dropFocus.addListener(() {
      if (_dropFocus.hasFocus) setState(() => _activeField = _ActiveField.drop);
    });
    _loadCurrentLocationAsPickup();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _pickupController.dispose();
    _dropController.dispose();
    _pickupFocus.dispose();
    _dropFocus.dispose();
    super.dispose();
  }

  Future<void> _loadCurrentLocationAsPickup() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _locatingPickup = false;
          _locationError = 'Turn on location services, or search a pickup point below.';
        });
        return;
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever || permission == LocationPermission.denied) {
        setState(() {
          _locatingPickup = false;
          _locationError = 'Location permission denied — search a pickup point below.';
        });
        return;
      }

      final pos = await Geolocator.getCurrentPosition();
      final latLng = LatLng(pos.latitude, pos.longitude);
      final address = await PlacesService.reverseGeocode(latLng);
      if (!mounted) return;
      setState(() {
        _pickupLatLng = latLng;
        _pickupController.text = address ?? 'Your current location';
        _locatingPickup = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _locatingPickup = false;
        _locationError = "Couldn't get your location — search a pickup point below.";
      });
    }
  }

  void _onQueryChanged(String query) {
    _debounce?.cancel();
    if (query.trim().isEmpty) {
      setState(() => _suggestions = []);
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      setState(() => _searching = true);
      final results = await PlacesService.autocomplete(query);
      if (!mounted) return;
      setState(() {
        _suggestions = results;
        _searching = false;
      });
    });
  }

  Future<void> _onSuggestionTap(PlaceSuggestion suggestion) async {
    setState(() => _searching = true);
    final resolved = await PlacesService.placeDetails(suggestion.placeId);
    if (!mounted) return;
    setState(() => _searching = false);

    if (resolved == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Couldn't load that place — try another result.")),
      );
      return;
    }

    setState(() {
      _suggestions = [];
      if (_activeField == _ActiveField.pickup) {
        _pickupController.text = resolved.address.isNotEmpty ? resolved.address : suggestion.fullText;
        _pickupLatLng = resolved.latLng;
        _dropFocus.requestFocus();
      } else {
        _dropController.text = resolved.address.isNotEmpty ? resolved.address : suggestion.fullText;
        _dropLatLng = resolved.latLng;
        _pickupFocus.unfocus();
        _dropFocus.unfocus();
      }
    });
  }

  void _swapLocations() {
    setState(() {
      final tempText = _pickupController.text;
      final tempLatLng = _pickupLatLng;
      _pickupController.text = _dropController.text;
      _pickupLatLng = _dropLatLng;
      _dropController.text = tempText;
      _dropLatLng = tempLatLng;
    });
  }

  bool get _canContinue => _pickupLatLng != null && _dropLatLng != null;

  void _continue() {
    if (!_canContinue) return;
    // NOTE: this now pushes TripDetails (not ConfirmRide directly) since
    // GoLongDrive bills per day + per km — the rider needs to set a date
    // range before a fare/car can be shown. See routes/app_routes.dart for
    // the full booking-flow order.
    Navigator.of(context).pushNamed(
      AppRoutes.tripDetails,
      arguments: RideRequest(
        pickupAddress: _pickupController.text,
        pickupLatLng: _pickupLatLng!,
        dropAddress: _dropController.text,
        dropLatLng: _dropLatLng!,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(title: const Text('Set your trip')),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
              child: _LocationFieldStack(
                pickupController: _pickupController,
                dropController: _dropController,
                pickupFocus: _pickupFocus,
                dropFocus: _dropFocus,
                locatingPickup: _locatingPickup,
                onChanged: _onQueryChanged,
                onSwap: _swapLocations,
              ),
            ),
            if (_locationError != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: AppColors.warning, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_locationError!, style: AppTextStyles.caption.copyWith(color: AppColors.warning)),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 8),
            if (_searching) const LinearProgressIndicator(color: AppColors.primaryGold, minHeight: 2),
            Expanded(
              child: _suggestions.isEmpty
                  ? const SizedBox.shrink()
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      itemCount: _suggestions.length,
                      separatorBuilder: (_, __) => Divider(height: 1, color: colors.divider),
                      itemBuilder: (context, i) {
                        final s = _suggestions[i];
                        return ListTile(
                          leading: const Icon(Icons.location_on_outlined, color: AppColors.primaryGold),
                          title: Text(s.mainText, style: AppTextStyles.body.copyWith(color: colors.textPrimary)),
                          subtitle: s.secondaryText.isEmpty
                              ? null
                              : Text(s.secondaryText, style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                          onTap: () => _onSuggestionTap(s),
                        );
                      },
                    ),
            ),
            if (_suggestions.isEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: PrimaryButton(
                  label: 'Confirm Locations',
                  onPressed: _canContinue ? _continue : null,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// The pickup/drop text-field pair with the connecting dotted line and a
/// swap button, styled to match the rest of the app (nearBlack fields, gold
/// accents) rather than default Material text fields.
class _LocationFieldStack extends StatelessWidget {
  final TextEditingController pickupController;
  final TextEditingController dropController;
  final FocusNode pickupFocus;
  final FocusNode dropFocus;
  final bool locatingPickup;
  final ValueChanged<String> onChanged;
  final VoidCallback onSwap;

  const _LocationFieldStack({
    required this.pickupController,
    required this.dropController,
    required this.pickupFocus,
    required this.dropFocus,
    required this.locatingPickup,
    required this.onChanged,
    required this.onSwap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: colors.inputBorder),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Column(
            children: [
              Icon(Icons.circle, size: 10, color: colors.accentIcon),
              Container(width: 1.5, height: 44, color: colors.divider),
              Icon(Icons.square, size: 10, color: colors.textSecondary),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              children: [
                _PlainField(
                  controller: pickupController,
                  focusNode: pickupFocus,
                  hint: locatingPickup ? 'Locating you…' : 'Pickup location',
                  enabled: !locatingPickup,
                  trailing: locatingPickup
                      ? SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: colors.accentIcon),
                        )
                      : null,
                  onChanged: onChanged,
                ),
                Divider(height: 18, color: colors.divider),
                _PlainField(
                  controller: dropController,
                  focusNode: dropFocus,
                  hint: 'Where to?',
                  onChanged: onChanged,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onSwap,
            icon: Icon(Icons.swap_vert, color: colors.textSecondary),
            tooltip: 'Swap pickup and destination',
          ),
        ],
      ),
    );
  }
}

class _PlainField extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final String hint;
  final bool enabled;
  final Widget? trailing;
  final ValueChanged<String> onChanged;

  const _PlainField({
    required this.controller,
    required this.focusNode,
    required this.hint,
    required this.onChanged,
    this.enabled = true,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: controller,
            focusNode: focusNode,
            enabled: enabled,
            onChanged: onChanged,
            style: AppTextStyles.body.copyWith(color: colors.textPrimary),
            decoration: InputDecoration(
              isDense: true,
              border: InputBorder.none,
              hintText: hint,
              hintStyle: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
            ),
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}
