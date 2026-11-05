import '../core/data/api_client.dart';

class TourPackage {
  final String id;
  final String title;
  final String description;
  final int days;
  final int nights;
  final double price;
  final int numberOfPersons;
  final double pricePerPerson;
  final String? route;
  final List<String> placesToExplore;
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
    required this.price,
    required this.numberOfPersons,
    required this.pricePerPerson,
    this.route,
    required this.placesToExplore,
    required this.includes,
    required this.excludes,
    this.imageUrl,
    required this.destinations,
    required this.pricing,
    required this.isActive,
  });

  String? get fullImageUrl {
    if (imageUrl == null || imageUrl!.isEmpty) return null;
    if (imageUrl!.startsWith('http://') || imageUrl!.startsWith('https://')) {
      return imageUrl;
    }
    final base = ApiClient.baseUrl.replaceAll('/api/v1', '');
    return '$base${imageUrl!.startsWith('/') ? '' : '/'}$imageUrl';
  }

  factory TourPackage.fromJson(Map<String, dynamic> json) {
    final double rawPrice = (json['price'] ?? 0).toDouble();
    final int persons = json['numberOfPersons'] ?? 1;
    final double perPerson = (json['pricePerPerson'] != null)
        ? (json['pricePerPerson']).toDouble()
        : (persons > 0 && rawPrice > 0 ? (rawPrice / persons).roundToDouble() : 0.0);

    return TourPackage(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      days: json['days'] ?? 1,
      nights: json['nights'] ?? 0,
      price: rawPrice,
      numberOfPersons: persons,
      pricePerPerson: perPerson,
      route: json['route'],
      placesToExplore: List<String>.from(json['placesToExplore'] ?? []),
      includes: List<String>.from(json['includes'] ?? []),
      excludes: List<String>.from(json['excludes'] ?? []),
      imageUrl: json['imageUrl'],
      destinations: (json['destinations'] as List?)
              ?.map((d) => TourDestination.fromJson(d))
              .toList() ??
          [],
      pricing: (json['pricing'] as List?)
              ?.map((p) => TourPricing.fromJson(p))
              .toList() ??
          [],
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
