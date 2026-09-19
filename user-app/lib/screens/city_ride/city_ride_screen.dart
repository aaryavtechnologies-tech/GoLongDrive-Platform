import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../widgets/primary_button.dart';
import 'city_ride_art.dart';

enum _Step {
  locations,
  cars,
  review,
  searching,
  assigned,
  arrived,
  inProgress,
  completed,
}

/// Self-contained UI prototype. No location, booking, payment or socket services.
class CityRideScreen extends StatefulWidget {
  const CityRideScreen({super.key});
  @override
  State<CityRideScreen> createState() => _CityRideScreenState();
}

class _CityRideScreenState extends State<CityRideScreen> {
  _Step _step = _Step.locations;
  String _pickup = 'Navrangpura, Ahmedabad';
  String? _destination;
  int _car = 0;
  String _payment = 'Cash';
  int _rating = 0;
  Timer? _demoTimer;
  final _scrollController = ScrollController();

  void _goTo(_Step step) {
    setState(() => _step = step);
    if (_scrollController.hasClients) _scrollController.jumpTo(0);
  }

  static const _cars = [
    (
      name: 'City Mini',
      detail: 'Compact & easy',
      fare: 129,
      eta: '3 min',
      seats: '4 seats'
    ),
    (
      name: 'City Sedan',
      detail: 'A little more comfort',
      fare: 169,
      eta: '5 min',
      seats: '4 seats'
    ),
    (
      name: 'City XL',
      detail: 'Room for everyone',
      fare: 219,
      eta: '7 min',
      seats: '6 seats'
    ),
  ];

  @override
  void dispose() {
    _demoTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _selectLocation(bool pickup) async {
    final result = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _LocationSheet(
          pickup: pickup, initial: pickup ? _pickup : _destination ?? ''),
    );
    if (!mounted || result == null) return;
    _updateLocation(pickup, result);
  }

  void _updateLocation(bool pickup, String result) {
    ScaffoldMessenger.of(context).clearSnackBars();
    if (result.toLowerCase() ==
        (pickup ? _destination : _pickup)?.toLowerCase()) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Choose a different pickup and destination.')));
      return;
    }
    setState(() {
      if (pickup) {
        _pickup = result;
      } else {
        _destination = result;
      }
    });
  }

  Future<void> _selectPayment() async {
    final value = await showModalBottomSheet<String>(
        context: context,
        useSafeArea: true,
        builder: (context) => Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('How would you like to pay?',
                        style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 12),
                    for (final method in ['Cash', 'UPI'])
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Icon(method == 'Cash'
                            ? Icons.payments_outlined
                            : Icons.qr_code_rounded),
                        title: Text(method),
                        subtitle: Text(method == 'Cash'
                            ? 'Pay at the end of your ride'
                            : 'Pay with your preferred UPI app'),
                        trailing: Icon(_payment == method
                            ? Icons.radio_button_checked
                            : Icons.radio_button_off),
                        onTap: () => Navigator.pop(context, method),
                      ),
                    const SizedBox(height: 12),
                    const Text('Preview only. No payment will be collected.'),
                  ]),
            ));
    if (mounted && value != null) setState(() => _payment = value);
  }

  void _requestPreview() {
    _goTo(_Step.searching);
    _demoTimer = Timer(const Duration(seconds: 2), () {
      if (mounted) _goTo(_Step.assigned);
    });
  }

  void _advanceRidePreview() {
    switch (_step) {
      case _Step.assigned:
        _goTo(_Step.arrived);
      case _Step.arrived:
        _goTo(_Step.inProgress);
      case _Step.inProgress:
        _goTo(_Step.completed);
      default:
        break;
    }
  }

  void _bookAnotherRide() {
    setState(() {
      _step = _Step.locations;
      _destination = null;
      _car = 0;
      _payment = 'Cash';
      _rating = 0;
    });
  }

  Future<void> _cancelPreview() async {
    final cancel = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
              title: const Text('End this ride preview?'),
              content: const Text(
                  'No ride has been booked and there is no cancellation charge.'),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Keep exploring')),
                TextButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: const Text('End preview')),
              ],
            ));
    if (mounted && cancel == true) {
      _demoTimer?.cancel();
      _goTo(_Step.cars);
    }
  }

  void _back() {
    if (_step == _Step.searching ||
        _step == _Step.assigned ||
        _step == _Step.arrived) {
      _cancelPreview();
      return;
    }
    if (_step == _Step.locations) {
      Navigator.pop(context);
      return;
    }
    setState(
        () => _step = _step == _Step.review ? _Step.cars : _Step.locations);
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final car = _cars[_car];
    final title = switch (_step) {
      _Step.locations => 'Your city. Your way.',
      _Step.cars => 'A car for your everyday.',
      _Step.review => 'All set to head out?',
      _Step.searching => 'Finding your city ride…',
      _Step.assigned => 'Your ride is on its way.',
      _Step.arrived => 'Your driver has arrived.',
      _Step.inProgress => 'Enjoy the ride.',
      _Step.completed => 'You have arrived.',
    };
    return PopScope(
      canPop: _step == _Step.locations,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _back();
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
              onPressed: _back,
              tooltip: 'Back',
              icon: const Icon(Icons.arrow_back_rounded)),
          title: const Text('City rides'),
          actions: [
            Padding(
                padding: const EdgeInsets.only(right: 20),
                child: _pill('PREVIEW', c.surfaceElevated, c.textPrimary))
          ],
        ),
        body: SafeArea(
            top: false,
            child: Column(children: [
              Expanded(
                  child: ListView(
                      controller: _scrollController,
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                      children: [
                    Text(title,
                        style: AppTextStyles.largeHeading
                            .copyWith(color: c.textPrimary)),
                    const SizedBox(height: 8),
                    Text('Short trips. Only cars. A little more ease.',
                        style: AppTextStyles.bodySecondary
                            .copyWith(color: c.textSecondary)),
                    const SizedBox(height: 22),
                    ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: SizedBox(
                            height: _step == _Step.locations ? 205 : 145,
                            child: Stack(children: [
                              Positioned.fill(
                                  child:
                                      CityMap(showRoute: _destination != null)),
                              Positioned(
                                  left: 12,
                                  top: 12,
                                  child: _pill('AHMEDABAD · SAMPLE MAP',
                                      AppColors.mapRoad, AppColors.hero)),
                              Positioned(
                                  right: 12,
                                  bottom: 12,
                                  child: _pill(
                                      _destination == null
                                          ? 'Explore the neighbourhood'
                                          : 'Sample route · 4.8 km · 16 min',
                                      AppColors.hero,
                                      AppColors.heroText)),
                            ]))),
                    const SizedBox(height: 20),
                    if (_step == _Step.locations) ...[
                      _routeCard(c, editable: true),
                      const SizedBox(height: 24),
                      _eyebrow('A GOOD PLACE TO START', c),
                      const SizedBox(height: 8),
                      for (final place in [
                        'Sabarmati Riverfront',
                        'CG Square Mall',
                        'Ahmedabad One Mall'
                      ])
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: Container(
                              padding: const EdgeInsets.all(11),
                              decoration: BoxDecoration(
                                  color: c.surfaceElevated,
                                  borderRadius: BorderRadius.circular(14)),
                              child: Icon(Icons.north_east_rounded,
                                  color: c.accentIcon, size: 20)),
                          title: Text(place,
                              style: AppTextStyles.body.copyWith(
                                  color: c.textPrimary,
                                  fontWeight: FontWeight.w500)),
                          subtitle: Text('Ahmedabad · Sample destination',
                              style: AppTextStyles.caption
                                  .copyWith(color: c.textSecondary)),
                          trailing:
                              Icon(Icons.chevron_right, color: c.textSecondary),
                          onTap: () =>
                              _updateLocation(false, '$place, Ahmedabad'),
                        ),
                    ] else if (_step == _Step.cars) ...[
                      _routeCard(c, editable: true),
                      const SizedBox(height: 24),
                      _eyebrow('CHOOSE YOUR COMFORT', c),
                      const SizedBox(height: 12),
                      for (var i = 0; i < _cars.length; i++) _carTile(i, c),
                      const SizedBox(height: 4),
                      Text('Sample fares & arrival times · AC in every car',
                          style: AppTextStyles.caption
                              .copyWith(color: c.textSecondary)),
                    ] else if (_step == _Step.review) ...[
                      _routeCard(c),
                      const SizedBox(height: 20),
                      _panel(
                          c,
                          Column(children: [
                            Row(children: [
                              const CityCar(width: 85),
                              const SizedBox(width: 16),
                              Expanded(
                                  child: Text(car.name,
                                      style: AppTextStyles.subtitle
                                          .copyWith(color: c.textPrimary))),
                              Text(car.seats,
                                  style: AppTextStyles.caption
                                      .copyWith(color: c.textSecondary))
                            ]),
                            const SizedBox(height: 16),
                            Divider(color: c.divider),
                            _fareRow('Ride fare', '₹${car.fare - 10}', c),
                            _fareRow('Booking fee', '₹10', c),
                            Divider(color: c.divider),
                            _fareRow('Estimated total', '₹${car.fare}', c,
                                strong: true),
                          ])),
                      const SizedBox(height: 12),
                      _panel(
                          c,
                          ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: Icon(
                                  Icons.account_balance_wallet_outlined,
                                  color: c.accentIcon),
                              title: Text(_payment),
                              subtitle: const Text('Pay after your ride'),
                              trailing: const Icon(Icons.expand_more),
                              onTap: _selectPayment)),
                    ] else if (_step == _Step.searching) ...[
                      _panel(
                          c,
                          Column(children: [
                            const SizedBox(height: 8),
                            const CircularProgressIndicator(),
                            const SizedBox(height: 20),
                            Text('Pairing you with a nearby car',
                                style: AppTextStyles.subtitle
                                    .copyWith(color: c.textPrimary),
                                textAlign: TextAlign.center),
                            const SizedBox(height: 8),
                            Text(
                                'Playing the booking preview. No drivers are being contacted.',
                                style: AppTextStyles.bodySecondary
                                    .copyWith(color: c.textSecondary),
                                textAlign: TextAlign.center),
                            const SizedBox(height: 8)
                          ])),
                    ] else if (_step == _Step.assigned ||
                        _step == _Step.arrived) ...[
                      _driverPanel(c, car, arrived: _step == _Step.arrived),
                      const SizedBox(height: 16),
                      _routeCard(c),
                    ] else if (_step == _Step.inProgress) ...[
                      _rideProgressPanel(c, car),
                      const SizedBox(height: 16),
                      _routeCard(c),
                    ] else if (_step == _Step.completed) ...[
                      _completionPanel(c, car),
                    ],
                    const SizedBox(height: 20),
                    Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.info_outline,
                              size: 17, color: c.textSecondary),
                          const SizedBox(width: 8),
                          Expanded(
                              child: Text(
                                  'Backend-ready UI preview. Locations, fares and driver status changes use sample data until the booking APIs and socket events are connected.',
                                  style: AppTextStyles.caption
                                      .copyWith(color: c.textSecondary)))
                        ]),
                  ])),
              Container(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
                  decoration: BoxDecoration(
                      color: c.surface,
                      border: Border(top: BorderSide(color: c.divider))),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    if (_step == _Step.cars || _step == _Step.review)
                      Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('${car.name} · $_payment',
                                    style: AppTextStyles.body
                                        .copyWith(color: c.textPrimary)),
                                Text('₹${car.fare}',
                                    style: AppTextStyles.subtitle
                                        .copyWith(color: c.textPrimary))
                              ])),
                    PrimaryButton(
                      label: switch (_step) {
                        _Step.locations => 'Choose a car',
                        _Step.cars => 'Review ride',
                        _Step.review => 'Try booking preview',
                        _Step.searching => 'Cancel preview',
                        _Step.assigned => 'Preview driver arrival',
                        _Step.arrived => 'Start ride preview',
                        _Step.inProgress => 'Complete ride preview',
                        _Step.completed => 'Book another city ride',
                      },
                      onPressed:
                          _step == _Step.locations && _destination == null
                              ? null
                              : () {
                                  switch (_step) {
                                    case _Step.locations:
                                      _goTo(_Step.cars);
                                    case _Step.cars:
                                      _goTo(_Step.review);
                                    case _Step.review:
                                      _requestPreview();
                                    case _Step.searching:
                                      _cancelPreview();
                                    case _Step.assigned:
                                    case _Step.arrived:
                                    case _Step.inProgress:
                                      _advanceRidePreview();
                                    case _Step.completed:
                                      _bookAnotherRide();
                                  }
                                },
                    ),
                    if (_step == _Step.assigned || _step == _Step.arrived)
                      TextButton(
                          onPressed: _cancelPreview,
                          child: const Text('End ride preview')),
                  ])),
            ])),
      ),
    );
  }

  Widget _driverPanel(
    AppColorPalette c,
    ({String name, String detail, int fare, String eta, String seats}) car, {
    required bool arrived,
  }) =>
      _panel(
          c,
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _pill(
                arrived
                    ? 'DRIVER AT PICKUP'
                    : 'DRIVER · ${car.eta.toUpperCase()} AWAY',
                arrived
                    ? c.successIcon.withValues(alpha: .14)
                    : c.surfaceElevated,
                arrived ? c.successIcon : c.accentIcon),
            const SizedBox(height: 20),
            Row(children: [
              CircleAvatar(
                  radius: 28,
                  backgroundColor: c.surfaceElevated,
                  child: Icon(Icons.person_outline, color: c.accentIcon)),
              const SizedBox(width: 14),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text('Aarav Patel',
                        style: AppTextStyles.subtitle
                            .copyWith(color: c.textPrimary)),
                    Text('★ 4.9 · 1,248 city rides',
                        style: AppTextStyles.caption
                            .copyWith(color: c.textSecondary))
                  ])),
              _roundAction(Icons.call_outlined, 'Call', c),
              const SizedBox(width: 8),
              _roundAction(Icons.chat_bubble_outline, 'Message', c),
            ]),
            const SizedBox(height: 20),
            Text('${car.name} · White · GJ 01 AB 1234',
                style: AppTextStyles.body.copyWith(color: c.textPrimary)),
            const SizedBox(height: 6),
            Text(arrived ? 'Waiting near the pickup pin' : 'Approaching pickup',
                style: AppTextStyles.caption.copyWith(color: c.textSecondary)),
            const SizedBox(height: 16),
            Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: c.surfaceSecondary,
                    borderRadius: BorderRadius.circular(14)),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Ride PIN',
                          style: AppTextStyles.caption
                              .copyWith(color: c.textSecondary)),
                      Text('2 4 8 6',
                          style: AppTextStyles.subtitle
                              .copyWith(color: c.textPrimary, letterSpacing: 3))
                    ])),
          ]));

  Widget _rideProgressPanel(
          AppColorPalette c,
          ({
            String name,
            String detail,
            int fare,
            String eta,
            String seats
          }) car) =>
      _panel(
          c,
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _pill('TRIP IN PROGRESS · 8 MIN LEFT',
                c.accentIcon.withValues(alpha: .14), c.accentIcon),
            const SizedBox(height: 18),
            Text('Heading to ${_destination ?? 'your destination'}',
                style: AppTextStyles.subtitle.copyWith(color: c.textPrimary)),
            const SizedBox(height: 8),
            Text('3.1 km remaining · Estimated arrival 7:42 PM',
                style: AppTextStyles.caption.copyWith(color: c.textSecondary)),
            const SizedBox(height: 18),
            ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                    value: .58,
                    minHeight: 8,
                    color: c.accentIcon,
                    backgroundColor: c.surfaceSecondary)),
            const SizedBox(height: 20),
            Row(children: [
              Icon(Icons.shield_outlined, color: c.successIcon),
              const SizedBox(width: 10),
              Expanded(
                  child: Text('Ride tracking and SOS stay available here',
                      style: AppTextStyles.bodySecondary
                          .copyWith(color: c.textSecondary))),
              _roundAction(Icons.sos_outlined, 'SOS', c),
            ]),
          ]));

  Widget _completionPanel(
          AppColorPalette c,
          ({
            String name,
            String detail,
            int fare,
            String eta,
            String seats
          }) car) =>
      _panel(
          c,
          Column(children: [
            Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                    color: c.successIcon.withValues(alpha: .14),
                    shape: BoxShape.circle),
                child:
                    Icon(Icons.check_rounded, color: c.successIcon, size: 32)),
            const SizedBox(height: 16),
            Text('Ride complete',
                style:
                    AppTextStyles.mediumHeading.copyWith(color: c.textPrimary)),
            const SizedBox(height: 6),
            Text('Thanks for riding with Aarav.',
                style: AppTextStyles.bodySecondary
                    .copyWith(color: c.textSecondary)),
            const SizedBox(height: 20),
            Divider(color: c.divider),
            _fareRow('Trip fare', '₹${car.fare - 10}', c),
            _fareRow('Booking fee', '₹10', c),
            _fareRow('Paid via $_payment', '₹${car.fare}', c, strong: true),
            Divider(color: c.divider),
            const SizedBox(height: 12),
            Text('How was your city ride?',
                style: AppTextStyles.body.copyWith(color: c.textPrimary)),
            const SizedBox(height: 10),
            Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final value = index + 1;
                  return IconButton(
                      tooltip: '$value star${value == 1 ? '' : 's'}',
                      onPressed: () => setState(() => _rating = value),
                      icon: Icon(
                          value <= _rating
                              ? Icons.star_rounded
                              : Icons.star_border_rounded,
                          color: value <= _rating
                              ? c.warningIcon
                              : c.textSecondary));
                })),
          ]));

  Widget _roundAction(IconData icon, String tooltip, AppColorPalette c) =>
      Tooltip(
          message: tooltip,
          child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                  color: c.surfaceSecondary, shape: BoxShape.circle),
              child: Icon(icon, color: c.accentIcon, size: 19)));

  Widget _routeCard(AppColorPalette c, {bool editable = false}) => _panel(
      c,
      Column(children: [
        _locationRow('PICKUP', _pickup, Icons.trip_origin, c,
            editable ? () => _selectLocation(true) : null),
        Padding(
            padding: const EdgeInsets.only(left: 38),
            child: Divider(color: c.divider, height: 24)),
        _locationRow(
            'DROP-OFF',
            _destination ?? 'Where are you going?',
            Icons.location_on_outlined,
            c,
            editable ? () => _selectLocation(false) : null),
      ]));

  Widget _locationRow(String label, String value, IconData icon,
          AppColorPalette c, VoidCallback? onTap) =>
      InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(children: [
              Icon(icon, color: c.accentIcon, size: 22),
              const SizedBox(width: 16),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Text(label,
                        style: AppTextStyles.caption.copyWith(
                            color: c.textSecondary,
                            fontSize: 10,
                            letterSpacing: 1.5)),
                    const SizedBox(height: 5),
                    Text(value,
                        style: AppTextStyles.body.copyWith(
                            color: c.textPrimary, fontWeight: FontWeight.w500))
                  ])),
              if (onTap != null)
                Icon(Icons.edit_outlined, size: 17, color: c.textSecondary)
            ])),
      );

  Widget _carTile(int i, AppColorPalette c) {
    final item = _cars[i];
    final selected = _car == i;
    return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Semantics(
          selected: selected,
          button: true,
          child: Material(
              color: selected ? c.surfaceElevated : c.surface,
              borderRadius: BorderRadius.circular(18),
              child: InkWell(
                  onTap: () => setState(() => _car = i),
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 18),
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                            color: selected ? c.accentIcon : c.divider,
                            width: selected ? 1.5 : 1)),
                    child: Row(children: [
                      CityCar(
                          width: 68,
                          color: i == 1
                              ? AppColors.mapRiver
                              : i == 2
                                  ? AppColors.mapBlock
                                  : AppColors.lime),
                      const SizedBox(width: 14),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            Text(item.name,
                                style: AppTextStyles.subtitle
                                    .copyWith(color: c.textPrimary)),
                            const SizedBox(height: 4),
                            Text('${item.eta} · ${item.seats}',
                                style: AppTextStyles.caption
                                    .copyWith(color: c.textSecondary)),
                            const SizedBox(height: 4),
                            Text(item.detail,
                                style: AppTextStyles.caption
                                    .copyWith(color: c.textSecondary))
                          ])),
                      const SizedBox(width: 8),
                      Column(children: [
                        Text('₹${item.fare}',
                            style: AppTextStyles.subtitle
                                .copyWith(color: c.textPrimary)),
                        const SizedBox(height: 8),
                        Icon(
                            selected
                                ? Icons.check_circle
                                : Icons.circle_outlined,
                            size: 19,
                            color: selected ? c.accentIcon : c.inputBorder)
                      ])
                    ]),
                  ))),
        ));
  }

  Widget _fareRow(String label, String amount, AppColorPalette c,
          {bool strong = false}) =>
      Padding(
          padding: const EdgeInsets.symmetric(vertical: 9),
          child:
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(label,
                style: AppTextStyles.body
                    .copyWith(color: strong ? c.textPrimary : c.textSecondary)),
            Text(amount,
                style: AppTextStyles.body.copyWith(
                    color: c.textPrimary,
                    fontWeight: strong ? FontWeight.w700 : FontWeight.w400))
          ]));
  Widget _panel(AppColorPalette c, Widget child) => Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
          color: c.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: c.divider)),
      child: Material(color: Colors.transparent, child: child));
  Widget _eyebrow(String text, AppColorPalette c) => Text(text,
      style: AppTextStyles.caption.copyWith(
          color: c.textSecondary,
          fontSize: 10,
          fontWeight: FontWeight.w500,
          letterSpacing: 1.6));
  Widget _pill(String text, Color background, Color foreground) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
      decoration: BoxDecoration(
          color: background, borderRadius: BorderRadius.circular(20)),
      child: Text(text,
          style: AppTextStyles.caption.copyWith(
              color: foreground,
              fontSize: 9,
              fontWeight: FontWeight.w500,
              letterSpacing: .5)));
}

class _LocationSheet extends StatefulWidget {
  final bool pickup;
  final String initial;
  const _LocationSheet({required this.pickup, required this.initial});
  @override
  State<_LocationSheet> createState() => _LocationSheetState();
}

class _LocationSheetState extends State<_LocationSheet> {
  late final TextEditingController _controller =
      TextEditingController(text: widget.initial);
  static const _places = [
    'Navrangpura, Ahmedabad',
    'Sabarmati Riverfront, Ahmedabad',
    'CG Square Mall, Ahmedabad',
    'Ahmedabad One Mall, Ahmedabad',
    'Law Garden, Ahmedabad',
    'Paldi, Ahmedabad'
  ];
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppColors.of(context);
    final query = _controller.text.trim();
    final matches = _places
        .where((place) => place.toLowerCase().contains(query.toLowerCase()))
        .toList();
    return Padding(
        padding: EdgeInsets.fromLTRB(
            24, 16, 24, MediaQuery.viewInsetsOf(context).bottom + 24),
        child: SingleChildScrollView(
            child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Row(children: [
                Expanded(
                    child: Text(widget.pickup ? 'Set your pickup' : 'Where to?',
                        style: AppTextStyles.mediumHeading
                            .copyWith(color: c.textPrimary))),
                IconButton(
                    onPressed: () => Navigator.pop(context),
                    tooltip: 'Close',
                    icon: const Icon(Icons.close))
              ]),
              const SizedBox(height: 12),
              TextField(
                  controller: _controller,
                  autofocus: true,
                  textCapitalization: TextCapitalization.words,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                      hintText: 'Search or enter an address',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: IconButton(
                          tooltip: 'Clear address',
                          icon: const Icon(Icons.close, size: 18),
                          onPressed: () {
                            _controller.clear();
                            setState(() {});
                          }))),
              const SizedBox(height: 18),
              Text('SAMPLE LOCATIONS',
                  style: AppTextStyles.caption
                      .copyWith(color: c.textSecondary, letterSpacing: 1.5)),
              for (final place in matches)
                ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading:
                        Icon(Icons.location_on_outlined, color: c.accentIcon),
                    title: Text(place,
                        style:
                            AppTextStyles.body.copyWith(color: c.textPrimary)),
                    onTap: () => Navigator.pop(context, place)),
              if (matches.isEmpty)
                Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Text(
                        'No sample places match. You can use your typed address for the preview.',
                        style: AppTextStyles.bodySecondary
                            .copyWith(color: c.textSecondary))),
              const SizedBox(height: 12),
              PrimaryButton(
                  label: widget.pickup
                      ? 'Use this pickup'
                      : 'Use this destination',
                  onPressed: query.length < 3
                      ? null
                      : () => Navigator.pop(context, query)),
            ])));
  }
}
