// lib/screens/booking/boarding_pass_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../widgets/primary_button.dart';

class BoardingPassScreen extends StatelessWidget {
  final Map<String, dynamic> bookingData;

  const BoardingPassScreen({super.key, required this.bookingData});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final String bookingId = bookingData['bookingId'] ?? 'GLD-82931';
    final String from = bookingData['from'] ?? 'Ahmedabad';
    final String to = bookingData['to'] ?? 'Mumbai';
    final DateTime? journeyDate = bookingData['date'];
    final TimeOfDay? pickupTime = bookingData['time'];
    
    final String dateString = journeyDate != null 
        ? '${journeyDate.day.toString().padLeft(2, '0')} ${_getMonthName(journeyDate.month).toUpperCase()} ${journeyDate.year}'
        : '15 AUG 2026';
        
    final String timeString = pickupTime != null 
        ? pickupTime.format(context)
        : '08:30 AM';
    final int passengers = bookingData['passengers'] ?? 2;
    final int luggage = bookingData['luggage'] ?? 2;
    final String model = bookingData['car']?['model'] ?? 'Toyota Etios';
    final String distance = bookingData['car']?['distance'] ?? '520 KM';
    
    // Hardcoding some details for boarding pass
    final String passengerName = 'Himanshu';
    final String carNumber = 'GJ01AB1234';
    final String driverName = 'Rajesh Kumar';
    
    // QR data string
    final String qrData = 'ID:$bookingId|Pass:$passengerName|Route:$from-$to|Date:$dateString|Car:$carNumber';

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Success Header
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
                  ).animate().scale(duration: 400.ms, curve: Curves.elasticOut),
                  const SizedBox(height: 16),
                  Text('Booking Confirmed', style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary)),
                  const SizedBox(height: 8),
                  Text('Your ride has been successfully booked.', style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary)),
                ],
              ),
            ),
            
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                children: [
                  // Digital Boarding Pass
                  Container(
                    decoration: BoxDecoration(
                      color: colors.surfaceCard,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryGold.withValues(alpha: 0.1),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        )
                      ],
                    ),
                    child: Column(
                      children: [
                        // Pass Header
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGold.withValues(alpha: 0.1),
                            borderRadius: const BorderRadius.only(topLeft: Radius.circular(22), topRight: Radius.circular(22)),
                          ),
                          child: Center(
                            child: Text(
                              'GO LONG DRIVE',
                              style: AppTextStyles.subtitle.copyWith(
                                color: AppColors.primaryGold,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 2,
                              ),
                            ),
                          ),
                        ),
                        
                        // Route
                        Padding(
                          padding: const EdgeInsets.all(24),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(from.toUpperCase(), style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                                    const SizedBox(height: 4),
                                    Text(from.substring(0, 3).toUpperCase(), style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary, fontSize: 32)),
                                  ],
                                ),
                              ),
                              Icon(Icons.flight_takeoff, color: colors.accentIcon),
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(to.toUpperCase(), style: AppTextStyles.caption.copyWith(color: colors.textSecondary, letterSpacing: 1.2)),
                                    const SizedBox(height: 4),
                                    Text(to.substring(0, 3).toUpperCase(), style: AppTextStyles.largeHeading.copyWith(color: colors.textPrimary, fontSize: 32)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        // Cutout dashed line
                        Row(
                          children: [
                            Container(
                              width: 16,
                              height: 32,
                              decoration: BoxDecoration(
                                color: colors.background,
                                borderRadius: const BorderRadius.only(topRight: Radius.circular(16), bottomRight: Radius.circular(16)),
                                border: Border(
                                  right: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                  top: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                  bottom: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                ),
                              ),
                            ),
                            Expanded(
                              child: LayoutBuilder(
                                builder: (context, constraints) {
                                  return Flex(
                                    direction: Axis.horizontal,
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: List.generate(
                                      (constraints.constrainWidth() / 10).floor(),
                                      (index) => SizedBox(width: 5, height: 2, child: DecoratedBox(decoration: BoxDecoration(color: colors.divider))),
                                    ),
                                  );
                                },
                              ),
                            ),
                            Container(
                              width: 16,
                              height: 32,
                              decoration: BoxDecoration(
                                color: colors.background,
                                borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), bottomLeft: Radius.circular(16)),
                                border: Border(
                                  left: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                  top: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                  bottom: BorderSide(color: AppColors.primaryGold.withValues(alpha: 0.5), width: 2),
                                ),
                              ),
                            ),
                          ],
                        ),
                        
                        // Pass Details
                        Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Date', dateString)),
                                  Expanded(child: _buildPassDetail(colors, 'Time', timeString)),
                                  Expanded(child: _buildPassDetail(colors, 'Booking ID', bookingId)),
                                ],
                              ),
                              const SizedBox(height: 20),
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Passenger', passengerName)),
                                  Expanded(child: _buildPassDetail(colors, 'Vehicle', model)),
                                ],
                              ),
                              const SizedBox(height: 20),
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Car Number', carNumber)),
                                  Expanded(child: _buildPassDetail(colors, 'Driver', driverName)),
                                ],
                              ),
                              const SizedBox(height: 20),
                              Row(
                                children: [
                                  Expanded(child: _buildPassDetail(colors, 'Passengers', '$passengers')),
                                  Expanded(child: _buildPassDetail(colors, 'Luggage', '$luggage')),
                                  Expanded(child: _buildPassDetail(colors, 'Distance', distance)),
                                ],
                              ),
                              const SizedBox(height: 32),
                              
                              // QR Code
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: QrImageView(
                                  data: qrData,
                                  version: QrVersions.auto,
                                  size: 150.0,
                                ),
                              ).animate().fadeIn(delay: 600.ms, duration: 400.ms),
                              const SizedBox(height: 12),
                              Text('Show this code to the driver', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(delay: 200.ms, duration: 400.ms).slideY(begin: 0.1, end: 0),
                  
                  const SizedBox(height: 32),
                  
                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            // Mock Download action
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(color: colors.inputBorder),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.download, size: 18, color: colors.textPrimary),
                              const SizedBox(width: 8),
                              Text('Download', style: AppTextStyles.button.copyWith(color: colors.textPrimary)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            // Mock Share action
                          },
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: BorderSide(color: colors.inputBorder),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.share, size: 18, color: colors.textPrimary),
                              const SizedBox(width: 8),
                              Text('Share Pass', style: AppTextStyles.button.copyWith(color: colors.textPrimary)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  PrimaryButton(
                    label: 'Go to My Bookings',
                    onPressed: () {
                      Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
                      Navigator.of(context).pushNamed('/my-rides');
                    },
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPassDetail(AppColorPalette colors, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.caption.copyWith(color: colors.textSecondary, fontSize: 10)),
        const SizedBox(height: 4),
        Text(
          value, 
          style: AppTextStyles.body.copyWith(color: colors.textPrimary, fontWeight: FontWeight.w600),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  String _getMonthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }
}
