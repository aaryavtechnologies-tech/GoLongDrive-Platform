import 'package:flutter/widgets.dart';
import 'user_controller.dart';

class UserScope extends InheritedNotifier<UserController> {
  const UserScope({
    super.key,
    required UserController controller,
    required super.child,
  }) : super(notifier: controller);

  static UserController of(BuildContext context, {bool listen = true}) {
    final scope = listen
        ? context.dependOnInheritedWidgetOfExactType<UserScope>()
        : context.getInheritedWidgetOfExactType<UserScope>();
    assert(scope != null, 'UserScope.of() called with no UserScope ancestor');
    return scope!.notifier!;
  }
}
