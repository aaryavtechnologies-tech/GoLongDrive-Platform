import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../app/theme.dart';
import '../constants/app_legal_info.dart';

/// Prominent In-App Location Disclosure required by Google Play for apps
/// that utilize foreground location services while driving/navigating.
class LocationDisclosureDialog {
  LocationDisclosureDialog._();

  static const String _prefKey = 'location_prominent_disclosure_accepted';

  /// Returns true if the driver has already accepted the prominent disclosure.
  static Future<bool> hasAcceptedDisclosure() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefKey) ?? false;
  }

  /// Sets the disclosure status as accepted.
  static Future<void> setAcceptedDisclosure() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefKey, true);
  }

  /// Displays the prominent disclosure dialog BEFORE any location permission prompt.
  /// Returns `true` if the driver taps "Agree & Continue", `false` if "No Thanks".
  static Future<bool> showProminentDisclosure(BuildContext context) async {
    final accepted = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.surfaceAlt,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.location_on, color: AppColors.gold, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Location Access',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${AppLegalInfo.appName} collects real-time location data to provide core driving and dispatch functionality:',
                  style: TextStyle(color: AppColors.textPrimary, fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 12),
                _bulletItem('Ride Dispatch', 'To match and dispatch nearby customer trip requests to your vehicle.'),
                const SizedBox(height: 8),
                _bulletItem('Live Navigation', 'To provide turn-by-turn Google Maps route guidance and voice instructions from pickup to drop-off.'),
                const SizedBox(height: 8),
                _bulletItem('Fare Calculation', 'To measure exact driving distance and time traveled for accurate trip earnings.'),
                const SizedBox(height: 8),
                _bulletItem('Passenger Safety', 'To broadcast your live vehicle position to the assigned passenger during active trips.'),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Text(
                    '• Ongoing Tracking: Location is tracked via a foreground service while your status is "Online" or during active trips, including when the app is in the background or screen is awake for navigation.\n'
                    '• Your Control: Location tracking stops immediately when you switch to "Offline" or log out.\n'
                    '• Privacy Guarantee: Your location data is strictly protected and never sold to third parties.',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.35),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(
                'No Thanks',
                style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Agree & Continue', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );

    if (accepted == true) {
      await setAcceptedDisclosure();
      return true;
    }
    return false;
  }

  static Widget _bulletItem(String title, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 4, right: 8),
          child: Icon(Icons.check_circle_outline, color: AppColors.gold, size: 14),
        ),
        Expanded(
          child: Text.rich(
            TextSpan(
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
              children: [
                TextSpan(text: '$title: ', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                TextSpan(text: desc),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
