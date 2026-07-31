import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';

/// Reconstructed from `@/components/ui/document-upload` usage in the
/// registration wizard's document (§7) and photo (§8) steps.
/// Shows a dashed placeholder until an image is picked, then a thumbnail
/// preview with a "Retake" affordance.
class DocumentUploadCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String? imagePath;
  final ValueChanged<String?> onChanged;
  final IconData icon;
  final ImageSource source;

  const DocumentUploadCard({
    super.key,
    required this.title,
    required this.onChanged,
    this.subtitle = 'Tap to upload',
    this.imagePath,
    this.icon = Icons.upload_file_outlined,
    this.source = ImageSource.gallery,
  });

  Future<void> _pick(BuildContext context) async {
    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(source: source, imageQuality: 80);
      if (file != null) onChanged(file.path);
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Couldn't open the picker. Please try again.")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasImage = imagePath != null && imagePath!.isNotEmpty;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => _pick(context),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.inputFill,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: hasImage ? AppColors.gold.withOpacity(0.4) : AppColors.divider,
          ),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                width: 56,
                height: 56,
                child: hasImage
                    ? Image.file(File(imagePath!), fit: BoxFit.cover)
                    : DecoratedBox(
                        decoration: BoxDecoration(color: AppColors.surfaceAlt2),
                        child: Icon(icon, color: AppColors.textMuted, size: 24),
                      ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(
                    hasImage ? 'Uploaded — tap to retake' : subtitle,
                    style: TextStyle(
                      color: hasImage ? AppColors.success : AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              hasImage ? Icons.check_circle : Icons.add_circle_outline,
              color: hasImage ? AppColors.success : AppColors.gold,
              size: 22,
            ),
          ],
        ),
      ),
    );
  }
}
