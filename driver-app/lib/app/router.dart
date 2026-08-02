import 'package:go_router/go_router.dart';

import '../features/splash/splash_screen.dart';
import '../features/onboarding/onboarding_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/auth/reset_password_screen.dart';
import '../features/tabs/tab_shell.dart';
import '../features/registration/registration_provider.dart';
import '../features/registration/steps/personal_step.dart';
import '../features/registration/steps/address_step.dart';
import '../features/registration/steps/account_step.dart';
import '../features/registration/steps/vehicle_basic_step.dart';
import '../features/registration/steps/vehicle_specs_step.dart';
import '../features/registration/steps/docs_identity_step.dart';
import '../features/registration/steps/docs_vehicle_step.dart';
import '../features/registration/steps/photo_step.dart';
import '../features/registration/steps/review_step.dart';
import '../features/rides/ride_details_screen.dart';
import '../features/rides/current_ride_screen.dart';
import '../features/rides/incoming_request_screen.dart';
import '../features/profile/edit_profile_screen.dart';
import '../features/profile/documents_screen.dart';
import '../features/profile/notifications_screen.dart';
import '../features/profile/help_support_screen.dart';
import '../features/profile/privacy_policy_screen.dart';
import '../features/profile/terms_screen.dart';

/// Phase 6 — replaces the plain `Navigator`/`routes:` map that lived in
/// `main.dart` through Phase 5. Route *paths* are unchanged (every string
/// below matches the old route name exactly), so this is a like-for-like
/// swap: no screen had to be visually redesigned, only its navigation calls
/// updated (see each screen for `context.push`/`context.go` in place of the
/// old `Navigator.of(context)...`, and `GoRouterState.of(context).extra` in
/// place of `ModalRoute.of(context)?.settings.arguments`).
///
/// Data-passing convention: every route that used to receive a `Map` or a
/// `RegistrationData` via `arguments:` now receives the same object via
/// `extra:`. `extra` is go_router's direct equivalent of Navigator
/// arguments -- same "any Dart object, not serialized" behaviour -- so no
/// screen's internal logic needed to change, only the two or three lines
/// that read/send it.
///
/// Bug fixed while wiring this up: the old `/auth/register` route always
/// built a *brand new* `RegistrationData()`, even when re-entered via a
/// step's Back button or the Review screen's "Edit" link on Step 1 -- which
/// silently discarded everything the user had typed. The `/auth/register`
/// route below now reuses the instance passed via `extra` if one exists,
/// and only creates a fresh one the very first time (arriving from Login's
/// "Create Account" link, which passes no `extra`). This also let us drop
/// the vestigial `ChangeNotifierProvider`/`Consumer` wrapper and the
/// `provider` package dependency entirely -- nothing in the step screens
/// ever read from `Provider.of`, they always took `registration` as a
/// plain constructor field.
final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/auth/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    // extra: {'phone': String} -- set by ForgotPasswordScreen on send, and
    // again by OtpScreen itself on resend.
    GoRoute(path: '/auth/otp', builder: (context, state) => const OtpScreen()),
    // extra: {'phone': String} -- set by OtpScreen on successful verify.
    GoRoute(
      path: '/auth/reset-password',
      builder: (context, state) => const ResetPasswordScreen(),
    ),

    // --- Registration wizard (9 steps) ---
    GoRoute(
      path: '/auth/register',
      builder: (context, state) {
        final existing = state.extra as RegistrationData?;
        return PersonalStep(registration: existing ?? RegistrationData());
      },
    ),
    GoRoute(
      path: '/auth/register/address',
      builder: (context, state) => AddressStep(registration: state.extra as RegistrationData),
    ),
    GoRoute(
      path: '/auth/register/account',
      builder: (context, state) => AccountStep(registration: state.extra as RegistrationData),
    ),
    GoRoute(
      path: '/auth/register/vehicle-basic',
      builder: (context, state) =>
          VehicleBasicStep(registration: state.extra as RegistrationData),
    ),
    GoRoute(
      path: '/auth/register/vehicle-specs',
      builder: (context, state) =>
          VehicleSpecsStep(registration: state.extra as RegistrationData),
    ),
    GoRoute(
      path: '/auth/register/docs-identity',
      builder: (context, state) =>
          DocsIdentityStep(registration: state.extra as RegistrationData),
    ),
    GoRoute(
      path: '/auth/register/docs-vehicle',
      builder: (context, state) =>
          DocsVehicleStep(registration: state.extra as RegistrationData),
    ),
    GoRoute(
      path: '/auth/register/photos',
      builder: (context, state) => PhotoStep(registration: state.extra as RegistrationData),
    ),
    GoRoute(
      path: '/auth/register/review',
      builder: (context, state) => ReviewStep(registration: state.extra as RegistrationData),
    ),

    // --- Main app ---
    // "home base" after login/register success -- reached via context.go()
    // everywhere (not context.push/pushReplacement) so the entire auth
    // stack is cleared and the back button can't pop into it.
    GoRoute(
      path: '/tabs',
      builder: (context, state) {
        final tabParam = state.uri.queryParameters['tab'];
        final initialTab = int.tryParse(tabParam ?? '') ?? 0;
        return TabShell(initialTab: initialTab);
      },
    ),

    // extra: {'rideId': String} -- set by RidesScreen's onTap.
    GoRoute(path: '/rides/details', builder: (context, state) => const RideDetailsScreen()),
    GoRoute(path: '/rides/current', builder: (context, state) => const CurrentRideScreen()),
    // extra: {'rideId': String} -- set by Dashboard's "New Ride" quick action.
    GoRoute(path: '/rides/incoming', builder: (context, state) => const IncomingRequestScreen()),

    // --- Profile > Settings menu screens ---
    GoRoute(path: '/profile/edit', builder: (context, state) => const EditProfileScreen()),
    GoRoute(path: '/profile/documents', builder: (context, state) => const DocumentsScreen()),
    GoRoute(path: '/profile/notifications', builder: (context, state) => const NotificationsScreen()),
    GoRoute(path: '/profile/help', builder: (context, state) => const HelpSupportScreen()),
    GoRoute(path: '/profile/privacy', builder: (context, state) => const PrivacyPolicyScreen()),
    GoRoute(path: '/profile/terms', builder: (context, state) => const TermsScreen()),
  ],
);
