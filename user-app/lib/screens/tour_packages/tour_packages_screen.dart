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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load tour packages: $e')),
      );
    }
  }

  void _suggestCustomTour() {
    // Show a dialog to suggest a custom tour
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
        title: Text('Tour Packages', style: AppTextStyles.mediumHeading.copyWith(color: colors.textPrimary)),
        backgroundColor: colors.surface,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.textPrimary),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGold))
          : _packages.isEmpty
              ? Center(
                  child: Text('No tour packages available right now.',
                      style: AppTextStyles.body.copyWith(color: colors.textSecondary)))
              : RefreshIndicator(
                  onRefresh: _loadPackages,
                  color: AppColors.primaryGold,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _packages.length,
                    itemBuilder: (context, index) {
                      final pkg = _packages[index];
                      return _PackageCard(pkg: pkg).animate().fadeIn(delay: Duration(milliseconds: 100 * index)).slideY(begin: 0.1, end: 0);
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _suggestCustomTour,
        backgroundColor: AppColors.primaryGold,
        icon: const Icon(Icons.lightbulb_outline, color: Colors.white),
        label: const Text('Suggest a Tour', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: colors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: colors.divider.withValues(alpha: 0.3)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (pkg.imageUrl != null && pkg.imageUrl!.isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: Image.network(
                  pkg.imageUrl!,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 160,
                    color: colors.surfaceElevated,
                    child: const Icon(Icons.image_not_supported, size: 50, color: Colors.grey),
                  ),
                ),
              )
            else
              Container(
                height: 160,
                decoration: BoxDecoration(
                  color: colors.surfaceElevated,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                ),
                child: Center(
                  child: Icon(Icons.landscape_rounded, size: 60, color: AppColors.primaryGold.withValues(alpha: 0.5)),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    pkg.title,
                    style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${pkg.days} Days / ${pkg.nights} Nights',
                    style: AppTextStyles.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    pkg.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.bodySecondary.copyWith(color: colors.textSecondary),
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
  final _service = TourPackageService();
  final _destinationController = TextEditingController();
  final _daysController = TextEditingController();
  bool _isSubmitting = false;

  void _submit() async {
    if (_destinationController.text.trim().isEmpty) return;
    
    setState(() => _isSubmitting = true);
    try {
      await _service.suggestCustomTour({
        'destinations': _destinationController.text.trim(),
        'days': int.tryParse(_daysController.text.trim()) ?? 1,
      });
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Suggestion submitted! We will review it.')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return AlertDialog(
      backgroundColor: colors.surface,
      title: Text('Suggest Custom Tour', style: AppTextStyles.subtitle.copyWith(color: colors.textPrimary)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _destinationController,
            style: TextStyle(color: colors.textPrimary),
            decoration: InputDecoration(
              labelText: 'Where do you want to go?',
              labelStyle: TextStyle(color: colors.textSecondary),
              enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: colors.divider)),
              focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: AppColors.primaryGold)),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _daysController,
            keyboardType: TextInputType.number,
            style: TextStyle(color: colors.textPrimary),
            decoration: InputDecoration(
              labelText: 'Number of Days',
              labelStyle: TextStyle(color: colors.textSecondary),
              enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: colors.divider)),
              focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: AppColors.primaryGold)),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel', style: TextStyle(color: colors.textSecondary)),
        ),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submit,
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryGold),
          child: _isSubmitting 
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Submit', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}
