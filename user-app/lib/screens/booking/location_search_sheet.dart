// lib/screens/booking/location_search_sheet.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/data/places_service.dart';

class LocationSearchResult {
  final String address;
  final LatLng latLng;

  const LocationSearchResult({required this.address, required this.latLng});
}

class LocationSearchSheet extends StatefulWidget {
  final String initialQuery;
  final String hintText;

  const LocationSearchSheet({
    super.key,
    this.initialQuery = '',
    this.hintText = 'Where are you going?',
  });

  @override
  State<LocationSearchSheet> createState() => _LocationSearchSheetState();
}

class _LocationSearchSheetState extends State<LocationSearchSheet> {
  late final TextEditingController _controller;
  final FocusNode _focusNode = FocusNode();
  
  List<PlaceSuggestion> _suggestions = [];
  bool _isSearching = false;
  String? _errorMsg;
  Timer? _debounce;
  bool _isGettingLocation = false;

  final List<PlaceSuggestion> _popularDestinations = const [
    PlaceSuggestion(placeId: 'ChIJbZJhwcCEWDkRmi0oV9ZzKIM', mainText: 'Ahmedabad', secondaryText: 'Gujarat, India'),
    PlaceSuggestion(placeId: 'ChIJwe1EZjDG5zsRaYxkjY_tpF0', mainText: 'Mumbai', secondaryText: 'Maharashtra, India'),
    PlaceSuggestion(placeId: 'ChIJT4D0UDBz4TsRPN24GfQ57xU', mainText: 'Surat', secondaryText: 'Gujarat, India'),
    PlaceSuggestion(placeId: 'ChIJ5w-2wD_qXDkRxuFf3g6X_eU', mainText: 'Vadodara', secondaryText: 'Gujarat, India'),
    PlaceSuggestion(placeId: 'ChIJe4M5a-6xZzkRi2o_i-fQcK4', mainText: 'Udaipur', secondaryText: 'Rajasthan, India'),
  ];

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialQuery);
    _focusNode.requestFocus();
    if (widget.initialQuery.isNotEmpty) {
      _onQueryChanged(widget.initialQuery);
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onQueryChanged(String query) {
    _debounce?.cancel();
    if (query.trim().isEmpty) {
      setState(() {
        _suggestions = [];
        _errorMsg = null;
      });
      return;
    }
    
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      setState(() {
        _isSearching = true;
        _errorMsg = null;
      });
      
      final results = await PlacesService.autocomplete(query);
      
      if (!mounted) return;
      setState(() {
        _suggestions = results;
        _isSearching = false;
        if (results.isEmpty) {
          _errorMsg = 'No places found for "$query"';
        }
      });
    });
  }

  Future<void> _onSuggestionTap(PlaceSuggestion suggestion) async {
    setState(() => _isSearching = true);
    final resolved = await PlacesService.placeDetails(suggestion.placeId);
    if (!mounted) return;
    setState(() => _isSearching = false);

    if (resolved == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Couldn't load place details. Please try again.")),
      );
      return;
    }

    Navigator.of(context).pop(LocationSearchResult(
      address: resolved.address.isNotEmpty ? resolved.address : suggestion.fullText,
      latLng: resolved.latLng,
    ));
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _isGettingLocation = true);
    
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Location services are disabled.');
      }
      
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }
      if (permission == LocationPermission.deniedForever) {
        throw Exception('Location permissions are permanently denied, we cannot request permissions.');
      }

      final pos = await Geolocator.getCurrentPosition();
      final latLng = LatLng(pos.latitude, pos.longitude);
      final address = await PlacesService.reverseGeocode(latLng);
      
      if (!mounted) return;
      
      Navigator.of(context).pop(LocationSearchResult(
        address: address ?? 'Current Location',
        latLng: latLng,
      ));
    } catch (e) {
      if (!mounted) return;
      setState(() => _isGettingLocation = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final hasQuery = _controller.text.trim().isNotEmpty;
    
    return Container(
      decoration: BoxDecoration(
        color: colors.surfaceSecondary,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            const SizedBox(height: 12),
            Center(
              child: Container(
                width: 40,
                height: 5,
                decoration: BoxDecoration(
                  color: colors.divider,
                  borderRadius: BorderRadius.circular(2.5),
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Search Input Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back, color: colors.textPrimary),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: colors.surfaceCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: colors.inputBorder),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.search, color: colors.textSecondary, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: _controller,
                              focusNode: _focusNode,
                              onChanged: _onQueryChanged,
                              style: AppTextStyles.body.copyWith(color: colors.textPrimary),
                              decoration: InputDecoration(
                                hintText: widget.hintText,
                                hintStyle: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                              ),
                            ),
                          ),
                          if (hasQuery)
                            GestureDetector(
                              onTap: () {
                                _controller.clear();
                                _onQueryChanged('');
                              },
                              child: Icon(Icons.close, color: colors.textSecondary, size: 20),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            if (_isSearching)
              const Padding(
                padding: EdgeInsets.only(top: 8),
                child: LinearProgressIndicator(color: AppColors.primaryGold, minHeight: 2),
              )
            else
              const SizedBox(height: 10),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                children: [
                  // Current Location Button
                  if (!hasQuery) ...[
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: AppColors.primaryGold.withValues(alpha: 0.1), shape: BoxShape.circle),
                        child: _isGettingLocation
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryGold))
                            : const Icon(Icons.my_location, color: AppColors.primaryGold, size: 18),
                      ),
                      title: Text('Use Current Location', style: AppTextStyles.body.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.w600)),
                      onTap: _isGettingLocation ? null : _useCurrentLocation,
                    ),
                    const SizedBox(height: 16),
                    Text('Popular Destinations', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                    const SizedBox(height: 8),
                    ..._popularDestinations.map((p) => _buildSuggestionTile(p, colors)),
                  ],

                  // Search Results
                  if (hasQuery && _suggestions.isNotEmpty)
                    ..._suggestions.map((p) => _buildSuggestionTile(p, colors)),

                  // Error / Empty State
                  if (hasQuery && !_isSearching && _errorMsg != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 32),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.location_off_outlined, size: 48, color: colors.textSecondary),
                            const SizedBox(height: 16),
                            Text(_errorMsg!, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuggestionTile(PlaceSuggestion suggestion, AppColorPalette colors) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: colors.surfaceCard, shape: BoxShape.circle, border: Border.all(color: colors.divider)),
        child: Icon(Icons.location_on_outlined, color: colors.textSecondary, size: 18),
      ),
      title: Text(suggestion.mainText, style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600)),
      subtitle: suggestion.secondaryText.isNotEmpty
          ? Text(suggestion.secondaryText, style: AppTextStyles.caption.copyWith(color: colors.textSecondary))
          : null,
      onTap: () => _onSuggestionTap(suggestion),
    );
  }
}

Future<LocationSearchResult?> showLocationSearchSheet(BuildContext context, {String initialQuery = '', String hintText = 'Where are you going?'}) {
  return showModalBottomSheet<LocationSearchResult>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    useSafeArea: true,
    builder: (context) => LocationSearchSheet(initialQuery: initialQuery, hintText: hintText),
  );
}
