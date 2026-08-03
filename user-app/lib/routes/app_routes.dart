// lib/routes/app_routes.dart
import 'package:flutter/material.dart';

import '../screens/splash/splash_screen.dart';
import '../screens/onboarding/onboarding_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/verify_email_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/account_details_screen.dart';
import '../screens/profile/payment_methods_screen.dart';
import '../screens/profile/ride_history_screen.dart';
import '../screens/profile/notifications_screen.dart';
import '../screens/profile/help_support_screen.dart';
import '../screens/rides/my_rides_screen.dart';
import '../screens/rides/ride_details_screen.dart';
import '../screens/booking/set_locations_screen.dart';
import '../screens/booking/trip_details_screen.dart';
import '../screens/booking/confirm_ride_screen.dart';
import '../screens/booking/driver_assigned_screen.dart';
import '../models/ride_request.dart';
import '../models/ride_history_item.dart';

/// Single source of truth for named navigation.
///
/// Flow this wires up:
/// Splash -> Onboarding -> Login -> Home
/// Login -> Register -> VerifyEmail -> Login
/// Login -> ForgotPassword (handles OTP + reset internally) -> Login
/// Home -> Profile
/// Home -> SetLocations -> TripDetails -> ConfirmRide -> DriverAssigned
///         -> (back to) Home
///   (TripDetails, ConfirmRide, and DriverAssigned all take a `RideRequest`
///   argument, built up incrementally via `RideRequest.copyWith` at each
///   step — see models/ride_request.dart for the field-by-field breakdown.)
/// Home -> MyRides (Upcoming / Past tabs)
/// Profile -> AccountDetails / PaymentMethods / RideHistory /
///            Notifications / HelpSupport
/// RideHistory -> RideDetails
/// MyRides (Past tab) -> RideDetails
class AppRoutes {
  AppRoutes._();

  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String verifyEmail = '/verify-email';
  static const String forgotPassword = '/forgot-password';
  static const String home = '/home';
  static const String profile = '/profile';
  static const String setLocations = '/set-locations';
  static const String tripDetails = '/trip-details';
  static const String confirmRide = '/confirm-ride';
  static const String driverAssigned = '/driver-assigned';
  static const String accountDetails = '/account-details';
  static const String paymentMethods = '/payment-methods';
  static const String rideHistory = '/ride-history';
  static const String notifications = '/notifications';
  static const String helpSupport = '/help-support';
  static const String myRides = '/my-rides';
  static const String rideDetails = '/ride-details';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return _page(const SplashScreen(), settings);

      case onboarding:
        return _page(const OnboardingScreen(), settings);

      case login:
        return _page(const LoginScreen(), settings);

      case register:
        return _page(const RegisterScreen(), settings);

      case verifyEmail:
        final args = settings.arguments;
        final email = args is String
            ? args
            : (args is Map && args['email'] is String
                ? args['email'] as String
                : '');
        return _page(VerifyEmailScreen(email: email), settings);

      case forgotPassword:
        return _page(ForgotPasswordScreen(), settings);

      case home:
        return _page(const HomeScreen(), settings);

      case profile:
        return _page(const ProfileScreen(), settings);

      case accountDetails:
        return _page(const AccountDetailsScreen(), settings);

      case paymentMethods:
        return _page(const PaymentMethodsScreen(), settings);

      case rideHistory:
        return _page(const RideHistoryScreen(), settings);

      case notifications:
        return _page(const NotificationsScreen(), settings);

      case helpSupport:
        return _page(const HelpSupportScreen(), settings);

      case myRides:
        return _page(const MyRidesScreen(), settings);

      case rideDetails:
        final args = settings.arguments;
        if (args is! RideHistoryItem) {
          return _page(_missingArgsScreen('Ride Details needs a RideHistoryItem'), settings);
        }
        return _page(RideDetailsScreen(ride: args), settings);

      case setLocations:
        return _page(const SetLocationsScreen(), settings);

      case tripDetails:
        final args = settings.arguments;
        if (args is! RideRequest) {
          return _page(_missingArgsScreen('Trip Details needs a RideRequest'), settings);
        }
        return _page(TripDetailsScreen(request: args), settings);

      case confirmRide:
        final args = settings.arguments;
        if (args is! RideRequest) {
          return _page(_missingArgsScreen('Confirm Ride needs a RideRequest'), settings);
        }
        return _page(ConfirmRideScreen(request: args), settings);

      case driverAssigned:
        final args = settings.arguments;
        if (args is! RideRequest) {
          return _page(_missingArgsScreen('Driver Assigned needs a RideRequest'), settings);
        }
        return _page(DriverAssignedScreen(request: args), settings);

      default:
        return _page(
          Scaffold(
            body: Center(
              child: Text('No route defined for "${settings.name}"'),
            ),
          ),
          settings,
        );
    }
  }

  static Widget _missingArgsScreen(String message) {
    return Scaffold(body: Center(child: Text(message)));
  }

  static PageRoute<dynamic> _page(Widget child, RouteSettings settings) {
    return MaterialPageRoute(builder: (_) => child, settings: settings);
  }
}
