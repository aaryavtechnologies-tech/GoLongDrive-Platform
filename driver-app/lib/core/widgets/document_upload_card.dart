import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';

/// Reconstructed from `@/components/ui/document-upload` usage in the
/// registration wizard's document (§7) and photo (§8) steps.
/// Shows a dashed placeholder until an image is picked, then a thumbnail
/// preview with a "Retake" affordance.
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/config/env_config.dart';

class DocumentUploadCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final String? imagePath; // Can be local path or remote URL
  final ValueChanged<String?> onChanged;
  final IconData icon;
  final ImageSource source;
  final String? jwtToken;

  const DocumentUploadCard({
    super.key,
    required this.title,
    required this.onChanged,
    this.subtitle = 'Tap to upload',
    this.imagePath,
    this.icon = Icons.upload_file_outlined,
    this.source = ImageSource.gallery,
    this.jwtToken,
  });

  @override
  State<DocumentUploadCard> createState() => _DocumentUploadCardState();
}

class _DocumentUploadCardState extends State<DocumentUploadCard> {
  bool _isUploading = false;

  Future<void> _pick(BuildContext context) async {
    if (_isUploading) return;

    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(source: widget.source, imageQuality: 80);
      if (file != null) {
        if (widget.jwtToken != null) {
          await _uploadFile(File(file.path));
        } else {
          widget.onChanged(file.path);
        }
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Couldn't open the picker. Please try again.")),
        );
      }
    }
  }

  Future<void> _uploadFile(File file) async {
    setState(() => _isUploading = true);
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${EnvConfig.apiUrl}/driver/upload-document'),
      );
      request.headers['Authorization'] = 'Bearer ${widget.jwtToken}';
      request.files.add(await http.MultipartFile.fromPath('document', file.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        widget.onChanged(data['data']['documentUrl']);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Upload failed: ${response.body}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Network error during upload')),
        );
      }
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  Widget _buildImage() {
    final path = widget.imagePath!;
    if (path.startsWith('http') || path.startsWith('uploads/')) {
      final url = path.startsWith('uploads/') ? '${EnvConfig.socketUrl}/$path' : path;
      return Image.network(url, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.error));
    }
    return Image.file(File(path), fit: BoxFit.cover);
  }

  @override
  Widget build(BuildContext context) {
    final hasImage = widget.imagePath != null && widget.imagePath!.isNotEmpty;

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
                child: _isUploading
                    ? const Padding(
                        padding: EdgeInsets.all(16),
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold),
                      )
                    : hasImage
                        ? _buildImage()
                        : DecoratedBox(
                            decoration: BoxDecoration(color: AppColors.surfaceAlt2),
                            child: Icon(widget.icon, color: AppColors.textMuted, size: 24),
                          ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.title,
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(
                    _isUploading ? 'Uploading...' : hasImage ? 'Uploaded — tap to retake' : widget.subtitle,
                    style: TextStyle(
                      color: _isUploading ? AppColors.gold : hasImage ? AppColors.success : AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              _isUploading ? Icons.cloud_upload_outlined : hasImage ? Icons.check_circle : Icons.add_circle_outline,
              color: _isUploading ? AppColors.gold : hasImage ? AppColors.success : AppColors.gold,
              size: 22,
            ),
          ],
        ),
      ),
    );
  }
}
