import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../services/driver_tour_package_service.dart';

class AvailableTourPackagesScreen extends StatefulWidget {
  const AvailableTourPackagesScreen({super.key});

  @override
  State<AvailableTourPackagesScreen> createState() => _AvailableTourPackagesScreenState();
}

class _AvailableTourPackagesScreenState extends State<AvailableTourPackagesScreen> {
  final DriverTourPackageService _service = DriverTourPackageService();
  List<Map<String, dynamic>> _packages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPackages();
  }

  Future<void> _loadPackages() async {
    setState(() => _isLoading = true);
    try {
      final pkgs = await _service.getUnassignedPackages();
      setState(() {
        _packages = pkgs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load packages: $e')),
        );
      }
    }
  }

  Future<void> _acceptPackage(String bookingId) async {
    try {
      await _service.acceptTourPackage(bookingId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tour Package Accepted Successfully!')),
        );
        _loadPackages();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error accepting package: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Available Tour Packages', style: TextStyle(color: Colors.white)),
        backgroundColor: AppColors.gold,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : _packages.isEmpty
              ? const Center(child: Text('No tour packages available right now.'))
              : RefreshIndicator(
                  onRefresh: _loadPackages,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _packages.length,
                    itemBuilder: (context, index) {
                      final pkgData = _packages[index];
                      final tourPackage = pkgData['tourPackage'] ?? {};
                      final title = tourPackage['title'] ?? 'Tour Package';
                      final days = tourPackage['days'] ?? 0;
                      final nights = tourPackage['nights'] ?? 0;
                      final date = pkgData['pickupDate'] ?? '';
                      final vehicle = pkgData['vehicleType'] ?? '';

                      return Card(
                        color: AppColors.surface,
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.divider),
                            borderRadius: BorderRadius.circular(12)
                          ),
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(title, style: AppText.cardHeadline.copyWith(fontSize: 18, color: AppColors.textPrimary)),
                              const SizedBox(height: 8),
                              Text('$days Days / $nights Nights', style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                                  const SizedBox(width: 8),
                                  Text('Date: $date', style: TextStyle(color: AppColors.textSecondary)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(Icons.directions_car, size: 16, color: AppColors.textSecondary),
                                  const SizedBox(width: 8),
                                  Text('Vehicle: $vehicle', style: TextStyle(color: AppColors.textSecondary)),
                                ],
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: () => _acceptPackage(pkgData['_id'] ?? pkgData['bookingId']),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.gold,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  child: const Text('Accept Package', style: TextStyle(color: Colors.white)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
