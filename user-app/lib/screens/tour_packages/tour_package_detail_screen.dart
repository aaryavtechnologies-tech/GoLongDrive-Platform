import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/tour_package.dart';
import '../../core/services/tour_package_service.dart';

class TourPackageDetailScreen extends StatefulWidget {
  final TourPackage package;

  const TourPackageDetailScreen({super.key, required this.package});

  @override
  State<TourPackageDetailScreen> createState() => _TourPackageDetailScreenState();
}

class _TourPackageDetailScreenState extends State<TourPackageDetailScreen> {
  final TourPackageService _service = TourPackageService();
  final TextEditingController _pickupAddressController = TextEditingController();

  DateTime? _selectedDate;
  TimeOfDay _selectedTime = const TimeOfDay(hour: 9, minute: 0);
  int _passengers = 1;
  String? _selectedVehicleType;
  bool _isBooking = false;

  @override
  void initState() {
    super.initState();
    _passengers = widget.package.numberOfPersons > 0 ? widget.package.numberOfPersons : 2;
    _selectedDate = DateTime.now().add(const Duration(days: 2));
    if (widget.package.pricing.isNotEmpty) {
      _selectedVehicleType = widget.package.pricing.first.vehicleType;
    }
  }

  @override
  void dispose() {
    _pickupAddressController.dispose();
    super.dispose();
  }

  double get _calculatedFare {
    if (_selectedVehicleType != null && widget.package.pricing.isNotEmpty) {
      final tier = widget.package.pricing.firstWhere(
        (p) => p.vehicleType == _selectedVehicleType,
        orElse: () => widget.package.pricing.first,
      );
      return tier.price.toDouble();
    }
    if (widget.package.pricePerPerson > 0) {
      return widget.package.pricePerPerson * _passengers;
    }
    return widget.package.price > 0 ? widget.package.price : 0.0;
  }

  void _bookPackage() async {
    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select your departure date')),
      );
      return;
    }

    setState(() => _isBooking = true);
    try {
      final timeStr = _selectedTime.format(context);
      final bookingPayload = {
        'tourPackage': widget.package.id,
        'numberOfPassengers': _passengers,
        'pickupDate': _selectedDate!.toIso8601String(),
        'pickupTime': timeStr,
        'pickupAddress': _pickupAddressController.text.trim().isNotEmpty
            ? _pickupAddressController.text.trim()
            : (widget.package.route ?? widget.package.title),
        'vehicleType': _selectedVehicleType ?? 'Tour Cab',
      };

      final result = await _service.bookTourPackage(bookingPayload);

      if (mounted) {
        setState(() => _isBooking = false);
        final bookingData = result['booking'] ?? {};
        final bookingId = bookingData['bookingId'] ?? '';

        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppColors.of(context).surface,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle_rounded, color: Colors.green, size: 50),
                ),
                const SizedBox(height: 16),
                Text(
                  'Booking Request Sent!',
                  style: AppTextStyles.subtitle.copyWith(
                    color: AppColors.of(context).textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                if (bookingId.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    'Booking ID: #$bookingId',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.primaryGold,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                Text(
                  'No upfront payment was required. Our team will call you shortly to confirm your booking and assign your driver.',
                  style: AppTextStyles.bodySecondary.copyWith(
                    color: AppColors.of(context).textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(ctx); // Close dialog
                      Navigator.pop(context); // Go back from detail
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGold,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Text(
                      'Done',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isBooking = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Booking failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final pkg = widget.package;
    final imageUrl = pkg.fullImageUrl;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text(
          'Package Details',
          style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary, fontWeight: FontWeight.bold),
        ),
        backgroundColor: colors.surface,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.textPrimary),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Header
            Stack(
              children: [
                if (imageUrl != null && imageUrl.isNotEmpty)
                  Image.network(
                    imageUrl,
                    height: 230,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 230,
                      color: colors.surfaceElevated,
                      child: const Center(
                        child: Icon(Icons.landscape_rounded, size: 60, color: Colors.grey),
                      ),
                    ),
                  )
                else
                  Container(
                    height: 230,
                    color: colors.surfaceElevated,
                    child: Center(
                      child: Icon(
                        Icons.landscape_rounded,
                        size: 70,
                        color: AppColors.primaryGold.withValues(alpha: 0.5),
                      ),
                    ),
                  ),
                Positioned(
                  bottom: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      '${pkg.days} Days / ${pkg.nights} Nights',
                      style: const TextStyle(
                        color: AppColors.primaryGold,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title & Route
                  Text(
                    pkg.title,
                    style: AppTextStyles.mediumHeading.copyWith(
                      color: colors.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 22,
                    ),
                  ),
                  if (pkg.route != null && pkg.route!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.route_rounded, color: AppColors.primaryGold, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            pkg.route!,
                            style: AppTextStyles.body.copyWith(
                              color: colors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],

                  const SizedBox(height: 16),

                  // Pricing Highlight Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: colors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: colors.divider.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Package Price',
                              style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '₹${pkg.price.toInt()}',
                              style: AppTextStyles.priceLarge.copyWith(
                                color: colors.textPrimary,
                                fontSize: 24,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          height: 40,
                          width: 1,
                          color: colors.divider.withValues(alpha: 0.5),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Per Person Rate',
                              style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '₹${pkg.pricePerPerson.toInt()}',
                              style: AppTextStyles.subtitle.copyWith(
                                color: AppColors.primaryGold,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'for ${pkg.numberOfPersons} persons',
                              style: AppTextStyles.caption.copyWith(color: colors.textSecondary, fontSize: 10),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Description
                  Text(
                    'About This Tour',
                    style: AppTextStyles.subtitle.copyWith(
                      color: colors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    pkg.description,
                    style: AppTextStyles.body.copyWith(
                      color: colors.textSecondary,
                      height: 1.5,
                    ),
                  ),

                  // Places to Explore
                  if (pkg.placesToExplore.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text(
                      'Places You Will Explore',
                      style: AppTextStyles.subtitle.copyWith(
                        color: colors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: pkg.placesToExplore.map((place) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: colors.surface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: colors.divider.withValues(alpha: 0.5)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.place_rounded, size: 14, color: AppColors.primaryGold),
                              const SizedBox(width: 6),
                              Text(
                                place,
                                style: AppTextStyles.caption.copyWith(
                                  color: colors.textPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],

                  // What's Included
                  if (pkg.includes.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text(
                      'What is Included',
                      style: AppTextStyles.subtitle.copyWith(
                        color: colors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: colors.divider.withValues(alpha: 0.4)),
                      ),
                      child: Column(
                        children: pkg.includes.map((item) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle_rounded, color: Colors.green, size: 18),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    item,
                                    style: AppTextStyles.body.copyWith(
                                      color: colors.textPrimary,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],

                  // What is NOT Included (Exclusions)
                  if (pkg.excludes.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text(
                      'What is Not Included',
                      style: AppTextStyles.subtitle.copyWith(
                        color: colors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: colors.divider.withValues(alpha: 0.4)),
                      ),
                      child: Column(
                        children: pkg.excludes.map((item) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                const Icon(Icons.cancel_rounded, color: Colors.redAccent, size: 18),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    item,
                                    style: AppTextStyles.body.copyWith(
                                      color: colors.textSecondary,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],

                  // Vehicle Options (if available)
                  if (pkg.pricing.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text(
                      'Choose Your Vehicle Type',
                      style: AppTextStyles.subtitle.copyWith(
                        color: colors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Column(
                      children: pkg.pricing.map((tier) {
                        final isSelected = _selectedVehicleType == tier.vehicleType;
                        return InkWell(
                          onTap: () => setState(() => _selectedVehicleType = tier.vehicleType),
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primaryGold.withValues(alpha: 0.12) : colors.surface,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isSelected ? AppColors.primaryGold : colors.divider.withValues(alpha: 0.5),
                                width: isSelected ? 1.5 : 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.directions_car_rounded,
                                  color: isSelected ? AppColors.primaryGold : colors.textSecondary,
                                  size: 22,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    tier.vehicleType,
                                    style: TextStyle(
                                      color: colors.textPrimary,
                                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                                Text(
                                  '₹${tier.price.toInt()}',
                                  style: TextStyle(
                                    color: isSelected ? AppColors.primaryGold : colors.textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],

                  const SizedBox(height: 28),

                  // BOOKING SECTION
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: colors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Book This Tour',
                          style: AppTextStyles.subtitle.copyWith(
                            color: colors.textPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Date Picker
                        Text(
                          'Select Departure Date',
                          style: AppTextStyles.caption.copyWith(color: colors.textSecondary, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        InkWell(
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _selectedDate ?? DateTime.now().add(const Duration(days: 2)),
                              firstDate: DateTime.now(),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) {
                              setState(() => _selectedDate = date);
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: colors.background,
                              border: Border.all(color: colors.divider.withValues(alpha: 0.6)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_today_rounded, color: AppColors.primaryGold, size: 18),
                                const SizedBox(width: 10),
                                Text(
                                  _selectedDate != null
                                      ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                                      : 'Choose Date',
                                  style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Travelers Counter
                        Text(
                          'Number of Travelers',
                          style: AppTextStyles.caption.copyWith(color: colors.textSecondary, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: colors.background,
                            border: Border.all(color: colors.divider.withValues(alpha: 0.6)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.people_outline_rounded, color: AppColors.primaryGold, size: 20),
                                  const SizedBox(width: 10),
                                  Text(
                                    '$_passengers Persons',
                                    style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline),
                                    color: AppColors.primaryGold,
                                    onPressed: () {
                                      if (_passengers > 1) setState(() => _passengers--);
                                    },
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle_outline),
                                    color: AppColors.primaryGold,
                                    onPressed: () => setState(() => _passengers++),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Optional pickup location
                        Text(
                          'Pickup Address / City (Optional)',
                          style: AppTextStyles.caption.copyWith(color: colors.textSecondary, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _pickupAddressController,
                          style: TextStyle(color: colors.textPrimary),
                          decoration: InputDecoration(
                            hintText: 'Enter your pickup address or city',
                            hintStyle: TextStyle(color: colors.textSecondary.withValues(alpha: 0.6)),
                            prefixIcon: const Icon(Icons.my_location_rounded, color: AppColors.primaryGold, size: 18),
                            filled: true,
                            fillColor: colors.background,
                            contentPadding: const EdgeInsets.all(14),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: colors.divider.withValues(alpha: 0.6)),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: colors.divider.withValues(alpha: 0.6)),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Estimated Total
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Estimated Total Fare:',
                              style: AppTextStyles.body.copyWith(
                                color: colors.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              '₹${_calculatedFare.toInt()}',
                              style: AppTextStyles.priceLarge.copyWith(
                                color: AppColors.primaryGold,
                                fontSize: 22,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Informational Banner: No payment required upfront
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGold.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.info_outline_rounded, color: AppColors.primaryGold, size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'No upfront payment required. Submit booking request and our manager will call you to confirm your itinerary.',
                                  style: AppTextStyles.caption.copyWith(
                                    color: colors.textPrimary,
                                    fontSize: 11,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Submit Button
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: ElevatedButton(
                            onPressed: _isBooking ? null : _bookPackage,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryGold,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 2,
                            ),
                            child: _isBooking
                                ? const CircularProgressIndicator(color: Colors.white)
                                : const Text(
                                    'Submit Booking Request',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
