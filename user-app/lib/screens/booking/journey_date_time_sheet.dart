// lib/screens/booking/journey_date_time_sheet.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../widgets/primary_button.dart';

class JourneyDateTimeResult {
  final DateTime date;
  final TimeOfDay time;

  const JourneyDateTimeResult({required this.date, required this.time});
}

class JourneyDateTimeSheet extends StatefulWidget {
  final DateTime? initialDate;
  final TimeOfDay? initialTime;

  const JourneyDateTimeSheet({super.key, this.initialDate, this.initialTime});

  @override
  State<JourneyDateTimeSheet> createState() => _JourneyDateTimeSheetState();
}

class _JourneyDateTimeSheetState extends State<JourneyDateTimeSheet> {
  late DateTime _selectedDate;
  late TimeOfDay _selectedTime;

  late final DateTime _today;
  late final DateTime _maxDate;

  bool _showFullCalendar = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _today = DateTime(now.year, now.month, now.day);
    _maxDate = _today.add(const Duration(days: 30));

    if (widget.initialDate != null &&
        !widget.initialDate!.isBefore(_today) &&
        !widget.initialDate!.isAfter(_maxDate)) {
      _selectedDate = DateTime(widget.initialDate!.year, widget.initialDate!.month, widget.initialDate!.day);
    } else {
      _selectedDate = _today;
    }

    _selectedTime = widget.initialTime ?? _getDefaultValidTime(_selectedDate);
    
    // Ensure initial time is valid if today is selected
    if (_isToday(_selectedDate) && !_isTimeValidForToday(_selectedTime)) {
      _selectedTime = _getDefaultValidTime(_selectedDate);
    }
  }

  bool _isToday(DateTime date) {
    return date.year == _today.year && date.month == _today.month && date.day == _today.day;
  }

  bool _isTimeValidForToday(TimeOfDay time) {
    final now = TimeOfDay.now();
    if (time.hour > now.hour) return true;
    if (time.hour == now.hour && time.minute > now.minute) return true;
    return false;
  }

  TimeOfDay _getDefaultValidTime(DateTime date) {
    if (_isToday(date)) {
      final now = TimeOfDay.now();
      int nextHour = now.hour + 1;
      if (nextHour > 23) {
        // If it's very late, maybe default to 23:59 or just let them pick tomorrow
        return const TimeOfDay(hour: 23, minute: 59);
      }
      return TimeOfDay(hour: nextHour, minute: 0);
    }
    return const TimeOfDay(hour: 8, minute: 30); // Default for future dates
  }

  void _onDateSelected(DateTime date) {
    setState(() {
      _selectedDate = date;
      if (_isToday(date) && !_isTimeValidForToday(_selectedTime)) {
        _selectedTime = _getDefaultValidTime(date);
      }
    });
  }

  Future<void> _pickTime() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primaryGold,
              onPrimary: Colors.black,
              surface: AppColors.nearBlack,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      if (_isToday(_selectedDate) && !_isTimeValidForToday(picked)) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a future time for today.')),
        );
        return;
      }
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  void _confirm() {
    if (_isToday(_selectedDate) && !_isTimeValidForToday(_selectedTime)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a future time for today.')),
      );
      return;
    }
    Navigator.of(context).pop(JourneyDateTimeResult(date: _selectedDate, time: _selectedTime));
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      decoration: BoxDecoration(
        color: colors.surfaceSecondary,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(
                    color: colors.divider,
                    borderRadius: BorderRadius.circular(2.5),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Select Journey Date', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
                  IconButton(
                    icon: Icon(Icons.close, color: colors.textSecondary),
                    onPressed: () => Navigator.of(context).pop(),
                  )
                ],
              ),
              const SizedBox(height: 16),
              
              if (!_showFullCalendar) _buildQuickSelectOptions(colors),
              
              if (_showFullCalendar) _buildFullCalendar(colors),

              const SizedBox(height: 32),
              Text('Pickup Time', style: AppTextStyles.caption.copyWith(color: colors.textSecondary)),
              const SizedBox(height: 12),
              
              GestureDetector(
                onTap: _pickTime,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  decoration: BoxDecoration(
                    color: colors.surfaceCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: colors.inputBorder),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.access_time, color: colors.accentIcon, size: 20),
                          const SizedBox(width: 12),
                          Text(
                            _selectedTime.format(context),
                            style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary, fontSize: 22),
                          ),
                        ],
                      ),
                      Icon(Icons.edit, color: colors.textSecondary, size: 20),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 40),
              PrimaryButton(
                label: 'Confirm Selection',
                onPressed: _confirm,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickSelectOptions(AppColorPalette colors) {
    final tomorrow = _today.add(const Duration(days: 1));
    final dayAfter = _today.add(const Duration(days: 2));

    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildQuickDateCard('Today', _today, colors)),
            const SizedBox(width: 12),
            Expanded(child: _buildQuickDateCard('Tomorrow', tomorrow, colors)),
            const SizedBox(width: 12),
            Expanded(child: _buildQuickDateCard('Day After', dayAfter, colors)),
          ],
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => setState(() => _showFullCalendar = true),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: colors.surfaceCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colors.inputBorder),
            ),
            child: Center(
              child: Text(
                'Choose Date from Calendar',
                style: AppTextStyles.body.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickDateCard(String title, DateTime date, AppColorPalette colors) {
    final isSelected = date.year == _selectedDate.year && date.month == _selectedDate.month && date.day == _selectedDate.day;
    final formatter = DateFormat('d MMM');

    return GestureDetector(
      onTap: () => _onDateSelected(date),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGold.withValues(alpha: 0.1) : colors.surfaceCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? AppColors.primaryGold : colors.inputBorder),
        ),
        child: Column(
          children: [
            Text(title, style: AppTextStyles.caption.copyWith(color: isSelected ? AppColors.primaryGold : colors.textSecondary)),
            const SizedBox(height: 4),
            Text(formatter.format(date), style: AppTextStyles.body.copyWith(color: isSelected ? AppColors.primaryGold : colors.textPrimary, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildFullCalendar(AppColorPalette colors) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Calendar', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
            GestureDetector(
              onTap: () => setState(() => _showFullCalendar = false),
              child: Text('Close', style: AppTextStyles.link),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: colors.surfaceCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: colors.inputBorder),
          ),
          child: CalendarDatePicker(
            initialDate: _selectedDate,
            firstDate: _today,
            lastDate: _maxDate,
            onDateChanged: _onDateSelected,
          ),
        ),
      ],
    );
  }
}

Future<JourneyDateTimeResult?> showJourneyDateTimeSheet(
  BuildContext context, {
  DateTime? initialDate,
  TimeOfDay? initialTime,
}) {
  return showModalBottomSheet<JourneyDateTimeResult>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    useSafeArea: true,
    builder: (context) => JourneyDateTimeSheet(initialDate: initialDate, initialTime: initialTime),
  );
}
