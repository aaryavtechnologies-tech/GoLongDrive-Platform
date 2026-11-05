import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/services/tour_package_service.dart';
import '../../models/tour_package.dart';
import 'tour_package_detail_screen.dart';

class TourPackagesScreen extends StatefulWidget {
  const TourPackagesScreen({super.key});

  @override
  State<TourPackagesScreen> createState() => _TourPackagesScreenState();
}

class _TourPackagesScreenState extends State<TourPackagesScreen> {
  final TourPackageService _service = TourPackageService();
  List<TourPackage> _packages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPackages();
  }

  Future<void> _loadPackages() async {
    try {
      final pkgs = await _service.getTourPackages();
      setState(() {
        _packages = pkgs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load tour packages: $e')),
        );
      }
    }
  }

  void _suggestCustomTour() {
    showDialog(
      context: context,
      builder: (context) => const _SuggestCustomTourDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text(
          'Curated Tour Packages',
          style: AppTextStyles.mediumHeading.copyWith(
            color: colors.textPrimary,
            fontSize: 20,
          ),
        ),
        backgroundColor: colors.surface,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.textPrimary),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGold))
          : _packages.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.landscape_rounded, size: 70, color: colors.textSecondary.withValues(alpha: 0.4)),
                        const SizedBox(height: 16),
                        Text(
                          'No tour packages available right now.',
                          style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Our team is designing new itineraries. You can also suggest a custom tour package below!',
                          style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadPackages,
                  color: AppColors.primaryGold,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _packages.length,
                    itemBuilder: (context, index) {
                      final pkg = _packages[index];
                      return _PackageCard(pkg: pkg)
                          .animate()
                          .fadeIn(delay: Duration(milliseconds: 100 * index))
                          .slideY(begin: 0.1, end: 0);
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _suggestCustomTour,
        backgroundColor: AppColors.primaryGold,
        icon: const Icon(Icons.lightbulb_outline, color: Colors.white),
        label: const Text(
          'Suggest a Tour',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

class _PackageCard extends StatelessWidget {
  final TourPackage pkg;

  const _PackageCard({required this.pkg});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final imageUrl = pkg.fullImageUrl;

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TourPackageDetailScreen(package: pkg),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 18),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: colors.divider.withValues(alpha: 0.3)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 14,
              offset: const Offset(0, 5),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with Badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  child: imageUrl != null && imageUrl.isNotEmpty
                      ? Image.network(
                          imageUrl,
                          height: 175,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            height: 175,
                            color: colors.surfaceElevated,
                            child: const Center(
                              child: Icon(Icons.landscape_rounded, size: 50, color: Colors.grey),
                            ),
                          ),
                        )
                      : Container(
                          height: 175,
                          decoration: BoxDecoration(
                            color: colors.surfaceElevated,
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.landscape_rounded,
                              size: 60,
                              color: AppColors.primaryGold.withValues(alpha: 0.5),
                            ),
                          ),
                        ),
                ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      '${pkg.days} Days / ${pkg.nights} Nights',
                      style: const TextStyle(
                        color: AppColors.primaryGold,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    pkg.title,
                    style: AppTextStyles.subtitle.copyWith(
                      color: colors.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 17,
                    ),
                  ),
                  if (pkg.route != null && pkg.route!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.route_rounded, size: 15, color: AppColors.primaryGold),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            pkg.route!,
                            style: AppTextStyles.caption.copyWith(
                              color: colors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    pkg.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.bodySecondary.copyWith(
                      color: colors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Divider(height: 1),
                  const SizedBox(height: 12),

                  // Price & Booking Footer
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                '₹${pkg.price.toInt()}',
                                style: AppTextStyles.priceLarge.copyWith(
                                  color: colors.textPrimary,
                                  fontSize: 20,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Text(
                                'total',
                                style: AppTextStyles.caption.copyWith(color: colors.textSecondary),
                              ),
                            ],
                          ),
                          if (pkg.pricePerPerson > 0)
                            Text(
                              '₹${pkg.pricePerPerson.toInt()}/person (${pkg.numberOfPersons} persons)',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.primaryGold,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGold,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Row(
                          children: [
                            Text(
                              'View Details',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 15),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

class _SuggestCustomTourDialog extends StatefulWidget {
  const _SuggestCustomTourDialog();

  @override
  State<_SuggestCustomTourDialog> createState() => _SuggestCustomTourDialogState();
}

class _SuggestCustomTourDialogState extends State<_SuggestCustomTourDialog> {
  final _destinationsController = TextEditingController();
  final _daysController = TextEditingController();
  final _budgetController = TextEditingController();
  final _notesController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _destinationsController.dispose();
    _daysController.dispose();
    _budgetController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (_destinationsController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter destinations')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await TourPackageService().suggestCustomTour({
        'destinations': _destinationsController.text,
        'days': int.tryParse(_daysController.text) ?? 1,
        'budget': _budgetController.text,
        'notes': _notesController.text,
      });
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tour suggestion submitted! We will contact you soon.')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return AlertDialog(
      backgroundColor: colors.surface,
      title: Text('Suggest a Custom Tour', style: TextStyle(color: colors.textPrimary)),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _destinationsController,
              style: TextStyle(color: colors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Destinations (e.g. Manali, Shimla)',
                labelStyle: TextStyle(color: colors.textSecondary),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _daysController,
              keyboardType: TextInputType.number,
              style: TextStyle(color: colors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Duration (Days)',
                labelStyle: TextStyle(color: colors.textSecondary),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _budgetController,
              style: TextStyle(color: colors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Estimated Budget (₹)',
                labelStyle: TextStyle(color: colors.textSecondary),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _notesController,
              maxLines: 2,
              style: TextStyle(color: colors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Special requests or preferences',
                labelStyle: TextStyle(color: colors.textSecondary),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel', style: TextStyle(color: colors.textSecondary)),
        ),
        ElevatedButton(
          onPressed: _submitting ? null : _submit,
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGold),
          child: _submitting
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Submit', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}
