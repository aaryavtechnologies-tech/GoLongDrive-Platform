// lib/widgets/otp_input.dart
import 'package:flutter/material.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';

/// 6-digit OTP input used on Verify Email and Reset Password screens.
/// Active box highlights in gold; completed boxes stay gold-bordered.
/// [onCompleted] fires once all 6 digits are entered (mock-verify locally,
/// no backend call here).
class OtpInput extends StatelessWidget {
  final TextEditingController controller;
  final void Function(String)? onCompleted;
  final void Function(String)? onChanged;

  const OtpInput({
    super.key,
    required this.controller,
    this.onCompleted,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Semantics(
      label: 'One-time verification code, 6 digits',
      child: PinCodeTextField(
        appContext: context,
        length: 6,
        controller: controller,
        keyboardType: TextInputType.number,
        animationType: AnimationType.scale,
        animationDuration: const Duration(milliseconds: 250),
        textStyle: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary),
        pinTheme: PinTheme(
          shape: PinCodeFieldShape.box,
          borderRadius: BorderRadius.circular(14),
          fieldHeight: 52,
          fieldWidth: 46,
          activeColor: AppColors.primaryGold,
          selectedColor: AppColors.primaryGold,
          inactiveColor: colors.inputBorder,
          activeFillColor: colors.surface,
          selectedFillColor: colors.surface,
          inactiveFillColor: colors.surface,
        ),
        enableActiveFill: true,
        onChanged: onChanged ?? (_) {},
        onCompleted: onCompleted,
      ),
    );
  }
}
