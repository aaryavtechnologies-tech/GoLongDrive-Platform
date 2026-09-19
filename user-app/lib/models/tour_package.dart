class TourPackage {
  final String id;
  final String title;
  final String description;
  final int days;
  final int nights;
  final List<String> includes;
  final List<String> excludes;
  final String? imageUrl;
  final List<TourDestination> destinations;
  final List<TourPricing> pricing;
  final bool isActive;

  TourPackage({
    required this.id,
    required this.title,
    required this.description,
    required this.days,
    required this.nights,
    required this.includes,
    required this.excludes,
    this.imageUrl,
    required this.destinations,
    required this.pricing,
    required this.isActive,
  });

  factory TourPackage.fromJson(Map<String, dynamic> json) {
    return TourPackage(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      days: json['days'] ?? 0,
      nights: json['nights'] ?? 0,
      includes: List<String>.from(json['includes'] ?? []),
      excludes: List<String>.from(json['excludes'] ?? []),
      imageUrl: json['imageUrl'],
      destinations: (json['destinations'] as List?)?.map((d) => TourDestination.fromJson(d)).toList() ?? [],
      pricing: (json['pricing'] as List?)?.map((p) => TourPricing.fromJson(p)).toList() ?? [],
      isActive: json['isActive'] ?? true,
    );
  }
}

class TourDestination {
  final double lat;
  final double lng;
  final String name;

  TourDestination({required this.lat, required this.lng, required this.name});

  factory TourDestination.fromJson(Map<String, dynamic> json) {
    return TourDestination(
      lat: (json['lat'] ?? 0).toDouble(),
      lng: (json['lng'] ?? 0).toDouble(),
      name: json['name'] ?? '',
    );
  }
}

class TourPricing {
  final String vehicleType;
  final double price;

  TourPricing({required this.vehicleType, required this.price});

  factory TourPricing.fromJson(Map<String, dynamic> json) {
    return TourPricing(
      vehicleType: json['vehicleType'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
    );
  }
}
