// lib/core/theme/app_colors.dart
import 'package:flutter/material.dart';
import 'theme_scope.dart';

/// Colors derived from the GoLongDrive logo:
/// black background, gold/amber car outline + accent stripe, white wordmark.
/// Every screen/widget must import and reuse these — never hardcode hex
/// values directly in a screen or widget file.
///
/// NOTE ON THEMING: the static consts below are the original dark palette
/// and are still what most screens reference directly (`AppColors.black`,
/// `AppColors.nearBlack`, ...) — those screens are NOT yet theme-reactive
/// and will keep rendering dark regardless of the toggle in ProfileScreen.
/// Screens that should respond to the light/dark toggle must instead read
/// `AppColors.of(context)` (returns an [AppColorPalette]) and use its
/// fields — see profile_screen.dart for the pattern. Migrating a screen is
/// mechanical: add `final colors = AppColors.of(context);` at the top of
/// `build`, then swap `AppColors.black` -> `colors.background`,
/// `AppColors.nearBlack` -> `colors.surface`, `AppColors.textPrimary` ->
/// `colors.textPrimary`, `AppColors.textSecondary` -> `colors.textSecondary`.
///
/// ICON / STATUS COLORS: in light mode the card surface itself is gold
/// (see [AppColorPalette.surface] below), so raw `AppColors.primaryGold`,
/// `AppColors.warning`, `AppColors.error` and `AppColors.success` icons can
/// end up nearly invisible against it (gold-on-gold, orange-on-gold).
/// Any icon that sits on a card/surface/circle-avatar background — not
/// directly on the plain page background — must use the reactive
/// `colors.accentIcon` / `colors.errorIcon` / `colors.warningIcon` /
/// `colors.successIcon` fields instead of the static brand/status consts.
/// Same for borders: use `colors.inputBorder` instead of the static
/// `AppColors.inputBorder` wherever a border needs to stay visible on a
/// white/gold light-mode background.
class AppColors {
  AppColors._();

  // Core brand colors
  static const Color primaryGold = Color(0xFFF5B300); // main accent (buttons, highlights, active states)
  static const Color primaryGoldDark = Color(0xFFD99A00); // darker shade for gradients/pressed states
  static const Color black = Color(0xFF000000); // logo background / app background
  static const Color nearBlack = Color(0xFF121212); // surfaces slightly lighter than pure black (cards, sheets)

  // Text colors
  static const Color textPrimary = Color(0xFFFFFFFF); // headings, primary text on dark bg
  static const Color textSecondary = Color(0xFFB3B3B3); // subtitles, captions, hints
  static const Color textOnGold = Color(0xFF000000); // text/icons placed on top of gold buttons

  // Borders & dividers
  static const Color divider = Color(0xFF2A2A2A);
  static const Color inputBorder = Color(0xFF3A3A3A);
  static const Color inputBorderFocused = primaryGold;

  // Status colors
  static const Color success = Color(0xFF2ECC71);
  static const Color error = Color(0xFFFF5252);
  static const Color warning = Color(0xFFFFB020);

  // Gradient for primary buttons, matching the logo's gold tone
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryGold, primaryGoldDark],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  /// The theme-reactive palette for the current [ThemeScope]. Falls back to
  /// the dark palette if called with no ThemeScope ancestor (shouldn't
  /// happen for anything under GoLongDriveApp).
  static AppColorPalette of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ThemeScope>();
    final isDark = scope?.notifier?.isDark ?? true;
    return isDark ? AppColorPalette.dark : AppColorPalette.light;
  }
}

/// The subset of app colors that actually change between dark and light
/// mode. Per the design spec: light mode swaps the black background for
/// white and card surfaces for gold (same gold as the accent color), and
/// flips text to black — it does NOT introduce a second gold shade or
/// change the *hue* of status colors, but several fields below DO shift
/// shade/darkness in light mode purely so they stay legible against the
/// white background and the gold card surface.
class AppColorPalette {
  final Color background;
  final Color surface; // card background
  final Color textPrimary;
  final Color textSecondary;
  final Color divider;
  final Color inputBorder;

  // Contrast-safe variants for icons that sit on top of [surface]. In dark
  // mode these equal the original static brand/status colors (unchanged
  // look). In light mode, [surface] is gold, so a gold or orange icon on
  // top of it would disappear — these are deepened so they stay visible on
  // both the white page background and the gold card surface.
  final Color accentIcon;
  final Color errorIcon;
  final Color warningIcon;
  final Color successIcon;

  const AppColorPalette({
    required this.background,
    required this.surface,
    required this.textPrimary,
    required this.textSecondary,
    required this.divider,
    required this.inputBorder,
    required this.accentIcon,
    required this.errorIcon,
    required this.warningIcon,
    required this.successIcon,
  });

  static const dark = AppColorPalette(
    background: AppColors.black,
    surface: AppColors.nearBlack,
    textPrimary: AppColors.textPrimary,
    textSecondary: AppColors.textSecondary,
    divider: AppColors.divider,
    inputBorder: AppColors.inputBorder,
    accentIcon: AppColors.primaryGold,
    errorIcon: AppColors.error,
    warningIcon: AppColors.warning,
    successIcon: AppColors.success,
  );

  static const light = AppColorPalette(
    background: Colors.white,
    // Gentle, muted light-yellow card — NOT the bold primaryGold. A
    // full-saturation gold card next to a white page background was too
    // harsh/eye-straining; this is a soft cream-yellow tint instead
    // (matches the reference screenshot). Accent gold itself (buttons,
    // primaryGold) is unchanged — only the card *surface* color moved.
    surface: Color(0xFFFBF0D6),
    textPrimary: Colors.black,
    textSecondary: Color(0xFF3D3D3D),
    // Softened to match the gentler card tone above.
    divider: Color(0xFFEFE0B8),
    // Static AppColors.inputBorder (0xFF3A3A3A) is nearly invisible on a
    // white background — use a mid grey that still reads as a border here.
    inputBorder: Color(0xFFBDBDBD),
    // Deep amber/brown instead of gold: reads clearly on both white page
    // background and the soft-yellow card surface.
    accentIcon: Color(0xFF7A4E00),
    // Deeper red than the dark-mode error color, for contrast on the card.
    errorIcon: Color(0xFFB3261E),
    // Deep amber instead of orange-gold, so it doesn't blend into the card.
    warningIcon: Color(0xFF8A5300),
    // Deeper green than the dark-mode success color, for contrast on the card.
    successIcon: Color(0xFF1E7B3E),
  );
}
