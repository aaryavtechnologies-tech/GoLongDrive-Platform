// lib/models/user_account.dart

/// The rider's own profile data, shown/edited on Account Details.
///
/// ============================= BACKEND HOOKUP =============================
/// UI-only for now — seeded with [UserAccount.mock] instead of a real
/// fetch. To wire this up:
///   1. Add a `GET /api/user/profile` (or similar) call — e.g. in a new
///      `lib/core/data/user_service.dart` following the same pattern as
///      `places_service.dart` / `directions_service.dart` (return null on
///      failure, `debugPrint` the real error, never throw into the UI).
///   2. Replace `UserAccount.mock` in `account_details_screen.dart`'s
///      `initState` with the result of that call (fall back to mock only if
///      the call fails, so the screen never crashes with no data).
///   3. On "Save Changes", POST/PATCH the edited fields instead of just
///      popping a SnackBar — see the `_saveChanges()` TODO in
///      `account_details_screen.dart`.
/// ===========================================================================
class UserAccount {
  final String fullName;
  final String email;
  final String mobile;
  final String? gender;
  final String? dateOfBirth; // display string, e.g. "12 Jan 1998"
  final String? emergencyContactName;
  final String? emergencyContactPhone;

  const UserAccount({
    required this.fullName,
    required this.email,
    required this.mobile,
    this.gender,
    this.dateOfBirth,
    this.emergencyContactName,
    this.emergencyContactPhone,
  });

  /// Placeholder profile shown until a real fetch is wired in.
  static const UserAccount mock = UserAccount(
    fullName: 'Guest User',
    email: 'guest.user@example.com',
    mobile: '9000000000',
    gender: null,
    dateOfBirth: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
  );

  UserAccount copyWith({
    String? fullName,
    String? email,
    String? mobile,
    String? gender,
    String? dateOfBirth,
    String? emergencyContactName,
    String? emergencyContactPhone,
  }) {
    return UserAccount(
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      mobile: mobile ?? this.mobile,
      gender: gender ?? this.gender,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      emergencyContactName: emergencyContactName ?? this.emergencyContactName,
      emergencyContactPhone:
          emergencyContactPhone ?? this.emergencyContactPhone,
    );
  }
}
