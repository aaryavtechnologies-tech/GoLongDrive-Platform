import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../routes/app_routes.dart';
import 'city_ride_art.dart';

class CityRideEntry extends StatelessWidget {
  const CityRideEntry({super.key});
  @override
  Widget build(BuildContext context) => Material(
        color: AppColors.hero,
        borderRadius: BorderRadius.circular(24),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => Navigator.of(context).pushNamed(AppRoutes.cityRide),
          child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                              color: AppColors.lime, shape: BoxShape.circle)),
                      const SizedBox(width: 8),
                      Text('INTRODUCING CITY RIDES',
                          style: AppTextStyles.caption.copyWith(
                              color: AppColors.lime,
                              fontSize: 10,
                              letterSpacing: 1.6,
                              fontWeight: FontWeight.w500)),
                    ]),
                    const SizedBox(height: 18),
                    Text('Small trips.\nA better way to go.',
                        style: AppTextStyles.largeHeading.copyWith(
                            color: AppColors.heroText,
                            fontSize: 29,
                            height: 1.15)),
                    const SizedBox(height: 12),
                    Text('Your everyday car ride,\nright around the corner.',
                        style: AppTextStyles.body.copyWith(
                            color: AppColors.heroText.withValues(alpha: .75))),
                    const SizedBox(height: 20),
                    Row(children: [
                      Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 15, vertical: 13),
                          decoration: BoxDecoration(
                              color: AppColors.lime,
                              borderRadius: BorderRadius.circular(12)),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Text('Book a city ride',
                                style: AppTextStyles.body.copyWith(
                                    color: AppColors.hero,
                                    fontWeight: FontWeight.w600)),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward,
                                color: AppColors.hero, size: 18)
                          ])),
                      const SizedBox(width: 12),
                      const Expanded(
                          child: FittedBox(
                              fit: BoxFit.scaleDown,
                              child: CityCar(width: 125))),
                    ]),
                    const SizedBox(height: 14),
                    Text('CAR-ONLY  /  SHORT DISTANCE  /  UI PREVIEW',
                        style: AppTextStyles.caption.copyWith(
                            color: AppColors.heroText.withValues(alpha: .7),
                            fontSize: 9,
                            letterSpacing: 1)),
                  ])),
        ),
      );
}
