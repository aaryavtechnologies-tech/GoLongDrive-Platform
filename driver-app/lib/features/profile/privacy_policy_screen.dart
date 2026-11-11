import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme.dart';
import '../../core/constants/app_legal_info.dart';
import '../../core/widgets/card_decoration.dart';

/// Privacy Policy Screen for GoLongDrive Driver.
/// Displays developer identification card, policy summary, and provides a direct
/// link to view the full, official policy hosted at https://golongdrive.online/driver-policy.
/// Fully functional WITHOUT requiring user authentication.
class PrivacyPolicyScreen extends StatefulWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  State<PrivacyPolicyScreen> createState() => _PrivacyPolicyScreenState();
}

class _PrivacyPolicyScreenState extends State<PrivacyPolicyScreen> {
  bool _isLaunching = false;
  String? _launchError;

  Future<void> _openFullPolicy() async {
    setState(() {
      _isLaunching = true;
      _launchError = null;
    });

    try {
      final uri = Uri.parse(AppLegalInfo.privacyPolicyUrl);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        throw Exception('Could not open browser');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _launchError = 'Could not open browser. Please visit:\n${AppLegalInfo.privacyPolicyUrl}';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLaunching = false);
      }
    }
  }

  static const _summarySections = [
    (
      '1. Information Collected from Drivers',
      'We collect personal details (full name, phone number, email, address, date of birth), vehicle details (brand, model, registration plate number, fuel type), KYC documentation (Aadhaar, Commercial Driving License, Vehicle RC, Insurance, PUC, and selfie photo), and banking details (account number, IFSC code, UPI ID) to verify driver eligibility and disburse earnings.',
    ),
    (
      '2. Location & Foreground Services',
      'GoLongDrive Driver collects precise GPS location data continuously while you are Online or on an active trip using an Android Foreground Service with type location (FOREGROUND_SERVICE_LOCATION). This is required to dispatch nearby passenger bookings, provide turn-by-turn navigation, measure trip distance for transparent fare calculation, and show your live arrival to passengers. Location tracking stops immediately when you go Offline or log out. We never sell location data to third parties.',
    ),
    (
      '3. Trip Security & Passenger Calling',
      'Trips begin only when the driver inputs the passenger\'s 4-digit Ride Confirmation PIN upon arrival. When calling the passenger for pickup coordination, the app launches your phone\'s native telephone dialer via standard tel: intents (CALL_PHONE permission is not required or requested). The driver and passenger see each other\'s real contact numbers on caller ID.',
    ),
    (
      '4. Driver Earnings & Manual Payouts',
      'Your trip earnings are recorded in your in-app driver wallet. When you submit a payout request (minimum ₹100), payouts are processed manually by our platform administration via direct bank transfer (NEFT/IMPS) or UPI to your verified bank account.',
    ),
    (
      '5. Driver Account & Data Deletion',
      'You have the right to request deletion of your account and personal data at any time directly through the app (Profile → Delete Account), via our public web deletion portal at https://golongdrive.online/account-deletion, or by emailing support@golongdrive.online. Personal data and location logs are permanently purged within 30 days, while statutory billing records are retained as required by Indian tax and transport laws.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 24, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    onPressed: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go('/login');
                      }
                    },
                  ),
                  const SizedBox(width: 4),
                  Text('Driver Privacy Policy', style: AppText.cardHeadline),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                children: [
                  // App & Publisher Identification Card
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceAlt,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.gold.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Official Policy',
                                style: TextStyle(
                                  color: AppColors.gold,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const Spacer(),
                            Text(
                              'Nov 11, 2026',
                              style: TextStyle(color: AppColors.textFaint, fontSize: 11),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          AppLegalInfo.appName,
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        _infoRow('Publisher on Google Play', AppLegalInfo.publisherName),
                        const SizedBox(height: 4),
                        _infoRow('Publisher Address', AppLegalInfo.publisherAddress),
                        const SizedBox(height: 4),
                        _infoRow('Developed & Operated by', AppLegalInfo.operatorName),
                        const SizedBox(height: 4),
                        _infoRow('Support Contact', AppLegalInfo.supportEmail),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _isLaunching ? null : _openFullPolicy,
                            icon: _isLaunching
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                                  )
                                : const Icon(Icons.open_in_browser, size: 18),
                            label: Text(
                              _isLaunching ? 'Opening Web Policy...' : 'Open Full Official Policy (Web)',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.gold,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        if (_launchError != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            _launchError!,
                            style: const TextStyle(color: AppColors.error, fontSize: 11),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  Text('Policy Overview', style: AppText.sectionTitle),
                  const SizedBox(height: 12),

                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: cardDecoration(radius: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (var i = 0; i < _summarySections.length; i++) ...[
                          Text(
                            _summarySections[i].$1,
                            style: TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 14.5,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _summarySections[i].$2,
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 13,
                              height: 1.45,
                            ),
                          ),
                          if (i != _summarySections.length - 1) ...[
                            const SizedBox(height: 16),
                            Divider(color: AppColors.divider, height: 1),
                            const SizedBox(height: 16),
                          ],
                        ],
                      ],
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

  Widget _infoRow(String label, String value) {
    return RichText(
      text: TextSpan(
        style: TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.35),
        children: [
          TextSpan(text: '$label: ', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          TextSpan(text: value),
        ],
      ),
    );
  }
}
