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
  
  String? _selectedVehicleType;
  DateTime? _selectedDate;
  int _passengers = 1;
  bool _isBooking = false;

  void _bookPackage() async {
    if (_selectedVehicleType == null || _selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select vehicle type and date')),
      );
      return;
    }

    setState(() => _isBooking = true);
    try {
      await _service.bookTourPackage({
        'tourPackage': widget.package.id,
        'vehicleType': _selectedVehicleType,
        'pickupDate': _selectedDate!.toIso8601String(),
        'numberOfPassengers': _passengers,
        // Mock data for required fields by Booking.model
        'pickupAddress': 'User Location',
        'pickupCity': 'City',
        'pickupState': 'State',
        'pickupPincode': '000000',
        'dropAddress': 'Tour Locations',
        'dropCity': 'Various',
        'dropState': 'Various',
        'dropPincode': '000000',
        'pickupTime': '09:00 AM',
      });
      if (mounted) {
        setState(() => _isBooking = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tour Package booked successfully!')),
        );
        Navigator.pop(context);
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

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Package Details', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
        backgroundColor: colors.surface,
        iconTheme: IconThemeData(color: colors.textPrimary),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (pkg.imageUrl != null && pkg.imageUrl!.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(pkg.imageUrl!, height: 200, width: double.infinity, fit: BoxFit.cover),
              ),
            const SizedBox(height: 16),
            Text(pkg.title, style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
            const SizedBox(height: 8),
            Text('${pkg.days} Days / ${pkg.nights} Nights', style: AppTextStyles.body.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Text('Description', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
            const SizedBox(height: 8),
            Text(pkg.description, style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
            const SizedBox(height: 24),
            
            Text('Pricing', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
            const SizedBox(height: 8),
            ...pkg.pricing.map((p) => RadioListTile<String>(
              title: Text('${p.vehicleType} - ₹${p.price}', style: TextStyle(color: colors.textPrimary)),
              value: p.vehicleType,
              groupValue: _selectedVehicleType,
              activeColor: AppColors.primaryGold,
              onChanged: (val) => setState(() => _selectedVehicleType = val),
            )),
            
            const SizedBox(height: 16),
            Text('Travel Date', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
            const SizedBox(height: 8),
            InkWell(
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now().add(const Duration(days: 1)),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                );
                if (date != null) {
                  setState(() => _selectedDate = date);
                }
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(border: Border.all(color: colors.divider), borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    Icon(Icons.calendar_today, color: AppColors.primaryGold),
                    const SizedBox(width: 8),
                    Text(_selectedDate != null ? _selectedDate!.toString().split(' ')[0] : 'Select Date', style: TextStyle(color: colors.textPrimary)),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            Text('Passengers', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline),
                  color: AppColors.primaryGold,
                  onPressed: () {
                    if (_passengers > 1) setState(() => _passengers--);
                  },
                ),
                Text('$_passengers', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline),
                  color: AppColors.primaryGold,
                  onPressed: () => setState(() => _passengers++),
                ),
              ],
            ),
            
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isBooking ? null : _bookPackage,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGold,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isBooking 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Book Package', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
