import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/card_decoration.dart';
import '../../core/widgets/document_upload_card.dart';

/// Settings → My Documents.
/// Reuses `DocumentUploadCard` (the same widget the registration wizard's
/// docs-identity / docs-vehicle steps use) so a driver can review or
/// re-upload their documents after onboarding. Local-state only — no
/// backend endpoint exists yet for re-uploading a document post-approval,
/// see BACKEND_API_SPEC.md.
class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  // Pretend these are already-approved documents on file — no thumbnail
  // paths yet since we don't have real uploaded files, just status badges.
  final Map<String, bool> _uploaded = {
    'Driving License': true,
    'Vehicle RC': true,
    'Insurance': true,
    'Profile Photo': true,
  };
  final Map<String, String?> _newImagePath = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 24, 8),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 4),
                  const Text('My Documents', style: AppText.cardHeadline),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: cardDecoration(radius: 20, bg: AppColors.surfaceAlt),
                    child: Row(
                      children: [
                        const Icon(Icons.verified_outlined, color: AppColors.success, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text('All documents verified',
                              style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  DocumentUploadCard(
                    title: 'Driving License',
                    subtitle: _uploaded['Driving License']! ? 'On file' : 'Tap to upload',
                    icon: Icons.badge_outlined,
                    imagePath: _newImagePath['Driving License'],
                    onChanged: (path) => setState(() => _newImagePath['Driving License'] = path),
                  ),
                  const SizedBox(height: 14),
                  DocumentUploadCard(
                    title: 'Vehicle RC',
                    subtitle: _uploaded['Vehicle RC']! ? 'On file' : 'Tap to upload',
                    icon: Icons.description_outlined,
                    imagePath: _newImagePath['Vehicle RC'],
                    onChanged: (path) => setState(() => _newImagePath['Vehicle RC'] = path),
                  ),
                  const SizedBox(height: 14),
                  DocumentUploadCard(
                    title: 'Insurance',
                    subtitle: _uploaded['Insurance']! ? 'On file' : 'Tap to upload',
                    icon: Icons.shield_outlined,
                    imagePath: _newImagePath['Insurance'],
                    onChanged: (path) => setState(() => _newImagePath['Insurance'] = path),
                  ),
                  const SizedBox(height: 14),
                  DocumentUploadCard(
                    title: 'Profile Photo',
                    subtitle: _uploaded['Profile Photo']! ? 'On file' : 'Tap to upload',
                    icon: Icons.face_outlined,
                    imagePath: _newImagePath['Profile Photo'],
                    onChanged: (path) => setState(() => _newImagePath['Profile Photo'] = path),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Re-uploading a document sends it for review again. This can take up to 24 hours.',
                    style: TextStyle(color: AppColors.textFaint, fontSize: 12, height: 1.4),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
