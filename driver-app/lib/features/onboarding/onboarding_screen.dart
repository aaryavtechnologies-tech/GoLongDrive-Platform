import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/app_button.dart';

/// Matches app/(onboarding)/index.tsx: 3-slide horizontal PageView carousel,
/// black -> #111111 gradient bg, animated dot indicator, Skip button.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingItem {
  final String title;
  final String description;
  final IconData icon;
  _OnboardingItem(this.title, this.description, this.icon);
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  final _items = [
    _OnboardingItem(
      'Accept Rides Easily',
      'Get ride requests nearby and accept them with a single tap to start earning immediately.',
      Icons.location_on_outlined,
    ),
    _OnboardingItem(
      'Track Your Earnings',
      'Monitor your daily, weekly, and monthly earnings in real-time directly from your dashboard.',
      Icons.account_balance_wallet_outlined,
    ),
    _OnboardingItem(
      '24/7 Driver Support',
      'We are here to help you around the clock with our dedicated support team to keep you moving.',
      Icons.headset_mic_outlined,
    ),
  ];

  void _completeOnboarding() {
    // TODO: persist hasSeenOnboarding = true once storage is wired up.
    context.pushReplacement('/login');
  }

  void _next() {
    if (_index < _items.length - 1) {
      _controller.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    } else {
      _completeOnboarding();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: DecoratedBox(
        decoration: BoxDecoration(gradient: AppGradients.onboardingBg(context)),
        child: SafeArea(
          child: Column(
            children: [
              SizedBox(
                height: 60,
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: _index < _items.length - 1
                        ? TextButton(
                            onPressed: _completeOnboarding,
                            child: Text(
                              'Skip',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          )
                        : const SizedBox(),
                  ),
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: _controller,
                  itemCount: _items.length,
                  onPageChanged: (i) => setState(() => _index = i),
                  itemBuilder: (context, i) {
                    final item = _items[i];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Center(
                        child: SingleChildScrollView(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 160,
                                height: 160,
                                margin: const EdgeInsets.only(bottom: 48),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: AppGradients.iconHalo(),
                              border: Border.all(color: AppColors.gold.withOpacity(0.3)),
                            ),
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                // two concentric "halo" rings
                                Container(
                                  width: 160 * 1.2,
                                  height: 160 * 1.2,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: AppColors.gold.withOpacity(0.08)),
                                  ),
                                ),
                                Container(
                                  width: 160 * 1.4,
                                  height: 160 * 1.4,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: AppColors.gold.withOpacity(0.05)),
                                  ),
                                ),
                                Icon(item.icon, size: 64, color: AppColors.gold),
                              ],
                            ),
                          ),
                          Text(
                            item.title,
                            textAlign: TextAlign.center,
                            style: AppText.onboardingTitle,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            item.description,
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 16, color: AppColors.textSecondary, height: 1.75),
                          ),
                        ],
                      ),
                    )));
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(32, 16, 32, 40),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_items.length, (i) {
                        final active = i == _index;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          margin: const EdgeInsets.symmetric(horizontal: 6),
                          height: 8,
                          width: active ? 32 : 8,
                          decoration: BoxDecoration(
                            color: AppColors.gold.withOpacity(active ? 1 : 0.3),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 40),
                    AppButton(
                      label: _index == _items.length - 1 ? 'Get Started' : 'Next',
                      onPressed: _next,
                      rightIcon: _index < _items.length - 1
                          ? const Icon(Icons.chevron_right, color: Colors.black, size: 20)
                          : null,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
