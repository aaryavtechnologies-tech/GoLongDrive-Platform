import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// An offline illustration, deliberately not a live/geographic map.
class CityMap extends StatelessWidget {
  final bool showRoute;
  const CityMap({super.key, this.showRoute = false});

  @override
  Widget build(BuildContext context) => Semantics(
        label: 'Illustrative city map. Not live navigation.',
        image: true,
        child: ExcludeSemantics(
            child: CustomPaint(
          painter: _CityMapPainter(showRoute),
          child: const SizedBox.expand(),
        )),
      );
}

class _CityMapPainter extends CustomPainter {
  final bool route;
  _CityMapPainter(this.route);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / 400, size.height / 270);
    canvas.drawRect(const Rect.fromLTWH(0, 0, 400, 270),
        Paint()..color = AppColors.mapPaper);
    final blocks = Paint()..color = AppColors.mapBlock;
    for (var x = -20.0; x < 400; x += 75) {
      for (var y = -20.0; y < 270; y += 60) {
        canvas.drawRRect(
            RRect.fromRectAndRadius(
                Rect.fromLTWH(x, y, 57, 42), const Radius.circular(8)),
            blocks);
      }
    }
    canvas.drawRRect(
        RRect.fromRectAndRadius(
            const Rect.fromLTWH(238, 27, 97, 74), const Radius.circular(22)),
        Paint()..color = AppColors.mapPark);
    final river = Path()
      ..moveTo(365, -10)
      ..cubicTo(300, 90, 420, 150, 334, 290);
    canvas.drawPath(
        river,
        Paint()
          ..color = AppColors.mapRiver
          ..style = PaintingStyle.stroke
          ..strokeWidth = 24);
    final road = Paint()
      ..color = AppColors.mapRoad
      ..strokeWidth = 12
      ..style = PaintingStyle.stroke;
    canvas.drawPath(
        Path()
          ..moveTo(-10, 240)
          ..lineTo(140, 105)
          ..lineTo(410, 135),
        road);
    canvas.drawPath(
        Path()
          ..moveTo(60, -10)
          ..lineTo(155, 280),
        road);
    canvas.drawPath(
        Path()
          ..moveTo(-10, 55)
          ..lineTo(410, 200),
        road..strokeWidth = 8);
    if (route) {
      final path = Path()
        ..moveTo(104, 184)
        ..lineTo(165, 126)
        ..lineTo(271, 138)
        ..lineTo(290, 82);
      canvas.drawPath(
          path,
          Paint()
            ..color = AppColors.mapRoad
            ..strokeWidth = 10
            ..style = PaintingStyle.stroke
            ..strokeJoin = StrokeJoin.round);
      canvas.drawPath(
          path,
          Paint()
            ..color = AppColors.primaryGold
            ..strokeWidth = 5
            ..style = PaintingStyle.stroke
            ..strokeJoin = StrokeJoin.round);
      canvas.drawCircle(
          const Offset(290, 82), 10, Paint()..color = AppColors.hero);
      canvas.drawCircle(
          const Offset(290, 82), 4, Paint()..color = AppColors.lime);
    }
    canvas.drawCircle(const Offset(104, 184), 22,
        Paint()..color = AppColors.primaryGold.withValues(alpha: .12));
    canvas.drawCircle(
        const Offset(104, 184), 9, Paint()..color = AppColors.mapRoad);
    canvas.drawCircle(
        const Offset(104, 184), 6, Paint()..color = AppColors.primaryGold);
    _label(canvas, 'NAVRANGPURA', const Offset(29, 32));
    _label(canvas, 'ELLISBRIDGE', const Offset(191, 229));
    _label(canvas, 'RIVERFRONT', const Offset(261, 46));
    for (final offset in [
      const Offset(65, 112),
      const Offset(216, 149),
      const Offset(155, 53)
    ]) {
      canvas.save();
      canvas.translate(offset.dx, offset.dy);
      canvas.rotate(-.3);
      canvas.drawRRect(
          RRect.fromRectAndRadius(
              const Rect.fromLTWH(-7, -12, 14, 24), const Radius.circular(4)),
          Paint()..color = AppColors.hero);
      canvas.drawRect(
          const Rect.fromLTWH(-5, -5, 10, 7), Paint()..color = AppColors.lime);
      canvas.restore();
    }
    canvas.restore();
  }

  void _label(Canvas canvas, String text, Offset offset) {
    final painter = TextPainter(
        text: TextSpan(
            text: text,
            style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 8,
                letterSpacing: 1.2,
                color: AppColors.hero)),
        textDirection: TextDirection.ltr)
      ..layout();
    painter.paint(canvas, offset);
  }

  @override
  bool shouldRepaint(_CityMapPainter oldDelegate) => route != oldDelegate.route;
}

class CityCar extends StatelessWidget {
  final double width;
  final Color color;
  const CityCar({super.key, this.width = 100, this.color = AppColors.lime});
  @override
  Widget build(BuildContext context) => SizedBox(
      width: width,
      height: width * .48,
      child: CustomPaint(painter: _CarPainter(color)));
}

class _CarPainter extends CustomPainter {
  final Color color;
  _CarPainter(this.color);
  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.width / 160, size.height / 77);
    canvas.drawOval(const Rect.fromLTWH(7, 60, 145, 12),
        Paint()..color = Colors.black.withValues(alpha: .12));
    final body = Path()
      ..moveTo(9, 48)
      ..quadraticBezierTo(9, 37, 24, 35)
      ..lineTo(47, 14)
      ..quadraticBezierTo(51, 10, 62, 10)
      ..lineTo(101, 10)
      ..quadraticBezierTo(109, 11, 117, 22)
      ..lineTo(129, 36)
      ..lineTo(148, 41)
      ..quadraticBezierTo(154, 44, 154, 55)
      ..lineTo(150, 61)
      ..lineTo(12, 61)
      ..close();
    canvas.drawPath(body, Paint()..color = color);
    canvas.drawPath(
        Path()
          ..moveTo(37, 34)
          ..lineTo(54, 17)
          ..lineTo(75, 17)
          ..lineTo(75, 34)
          ..close(),
        Paint()..color = AppColors.hero);
    canvas.drawPath(
        Path()
          ..moveTo(81, 17)
          ..lineTo(102, 17)
          ..lineTo(119, 34)
          ..lineTo(81, 34)
          ..close(),
        Paint()..color = AppColors.hero);
    for (final x in [38.0, 125.0]) {
      canvas.drawCircle(Offset(x, 59), 13, Paint()..color = AppColors.black);
      canvas.drawCircle(Offset(x, 59), 6, Paint()..color = AppColors.mapPaper);
      canvas.drawCircle(Offset(x, 59), 2, Paint()..color = AppColors.hero);
    }
    canvas.drawRRect(
        RRect.fromRectAndRadius(
            const Rect.fromLTWH(139, 43, 13, 5), const Radius.circular(2)),
        Paint()..color = Colors.white);
    canvas.drawLine(
        const Offset(83, 40),
        const Offset(92, 40),
        Paint()
          ..color = AppColors.hero
          ..strokeWidth = 2);
  }

  @override
  bool shouldRepaint(_CarPainter oldDelegate) => color != oldDelegate.color;
}
