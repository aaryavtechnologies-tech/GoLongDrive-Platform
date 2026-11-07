const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const TourPackage = require('../models/TourPackage.model');
const logger = require('../utils/logger');

const tourPackagesData = [
  {
    title: 'Golden Triangle Classic: Delhi, Agra & Jaipur',
    description: 'Immerse yourself in India’s most celebrated cultural circuit spanning three historic cities. Witness the eternal beauty of the Taj Mahal in Agra at sunrise, explore the majestic red sandstone palaces of Delhi, and marvel at the pink facades, royal forts, and vibrant bazaars of Jaipur. A dedicated chauffeur-driven private vehicle ensures seamless transfers and comfort throughout the journey.',
    days: 4,
    nights: 3,
    price: 15999,
    numberOfPersons: 2,
    pricePerPerson: 7999,
    route: 'New Delhi → Agra (Taj Mahal) → Fatehpur Sikri → Jaipur (Pink City) → New Delhi',
    placesToExplore: [
      'Taj Mahal',
      'Agra Fort',
      'Amber Palace Jaipur',
      'Hawa Mahal',
      'Fatehpur Sikri',
      'Qutub Minar',
      'City Palace Jaipur',
      'India Gate'
    ],
    includes: [
      'Dedicated Private AC Cab with professional chauffeur',
      'All interstate road taxes, toll gates & parking permits',
      'Delhi Airport / Railway Station pickup & drop-off',
      'Complete local sightseeing as per tailored itinerary',
      'Driver daily allowance, night stay & fuel expenses'
    ],
    excludes: [
      'Monuments entry tickets & camera/video fees',
      'Hotel accommodation & personal meals',
      'Personal guide services & gratuities/tips',
      'Activities not specifically mentioned in inclusions'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    destinations: [
      { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
      { name: 'Agra', lat: 27.1767, lng: 78.0081 },
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873 }
    ],
    pricing: [
      { vehicleType: 'Sedan (Dzire/Etios)', price: 15999 },
      { vehicleType: 'SUV (Ertiga/Carens)', price: 19999 },
      { vehicleType: 'Premium SUV (Innova Crysta)', price: 24999 }
    ],
    isActive: true
  },
  {
    title: 'Kashmir Valley Paradise: Srinagar, Gulmarg & Pahalgam',
    description: 'Experience heaven on earth in the breathtaking Kashmir valley. Float on shimmering waters in a traditional Shikara on Dal Lake, take the high-altitude cable car (Gondola) across the snowy pine forests of Gulmarg, and stroll through the lush Betaab and Aru valleys of Pahalgam along the roaring Lidder River. Designed for romantic couples and scenic explorers alike.',
    days: 5,
    nights: 4,
    price: 26999,
    numberOfPersons: 2,
    pricePerPerson: 13499,
    route: 'Srinagar → Dal Lake & Mughal Gardens → Gulmarg Snow Point → Pahalgam Lidder Valley → Srinagar',
    placesToExplore: [
      'Dal Lake & Houseboats',
      'Gulmarg Gondola Ride',
      'Betaab Valley Pahalgam',
      'Aru Valley',
      'Mughal Gardens (Shalimar & Nishat)',
      'Shankaracharya Hill Temple',
      'Chandanwari'
    ],
    includes: [
      'Dedicated Climate-Controlled Private Cab with heater support',
      'All mountain toll taxes, environmental fees & permits',
      'Srinagar Airport arrival & departure transfers',
      'Driver mountain allowances, meals & overnight parking',
      'Full valley sightseeing and transfer points'
    ],
    excludes: [
      'Gondola cable car phase 1 & 2 tickets',
      'Pony/horse riding & adventure snow equipment rental',
      'Air tickets to/from Srinagar',
      'Hotel stays & personal food expenses'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
    destinations: [
      { name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
      { name: 'Gulmarg', lat: 34.0484, lng: 74.3805 },
      { name: 'Pahalgam', lat: 34.0163, lng: 75.3150 }
    ],
    pricing: [
      { vehicleType: 'Sedan (Dzire/Etios)', price: 26999 },
      { vehicleType: 'SUV (Ertiga/Carens)', price: 32999 },
      { vehicleType: 'Premium SUV (Innova Crysta)', price: 38999 }
    ],
    isActive: true
  },
  {
    title: 'Kerala Backwaters & Hills: Munnar, Thekkady & Alleppey',
    description: 'Embark on a refreshing escape to God’s Own Country. Drive through winding misty hills lined with aromatic tea plantations in Munnar, observe wild elephants and exotic flora in the Periyar Tiger Reserve of Thekkady, and glide through tranquil palm-fringed canals in the world-famous backwaters of Alleppey. Pure relaxation and nature at its finest.',
    days: 5,
    nights: 4,
    price: 22499,
    numberOfPersons: 2,
    pricePerPerson: 11249,
    route: 'Cochin → Munnar Tea Gardens → Thekkady Wildlife Sanctuary → Alleppey Backwaters → Cochin',
    placesToExplore: [
      'Munnar Tea Plantations',
      'Mattupetty Dam & Echo Point',
      'Periyar Wildlife Sanctuary',
      'Alleppey Backwater Canals',
      'Cheeyappara & Valara Waterfalls',
      'Fort Kochi Colonial Heritage'
    ],
    includes: [
      'Private air-conditioned chauffeur-driven cab for entire trip',
      'All interstate highway tolls, state permits & parking',
      'Cochin International Airport / Railway transfers',
      'Driver daily Bata, night halt and fuel expenses',
      'Customized stops for spice shopping and scenic viewpoints'
    ],
    excludes: [
      'Houseboat stay / Shikara cruise rental tickets',
      'Spice garden tour & elephant safari entry passes',
      'Kathakali / Kalaripayattu cultural performance tickets',
      'Hotel room bookings & personal meals'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    destinations: [
      { name: 'Cochin', lat: 9.9312, lng: 76.2673 },
      { name: 'Munnar', lat: 10.0889, lng: 77.0595 },
      { name: 'Thekkady', lat: 9.6031, lng: 77.1615 },
      { name: 'Alleppey', lat: 9.4981, lng: 76.3388 }
    ],
    pricing: [
      { vehicleType: 'Sedan (Dzire/Etios)', price: 22499 },
      { vehicleType: 'SUV (Ertiga/Carens)', price: 27999 },
      { vehicleType: 'Premium SUV (Innova Crysta)', price: 34999 }
    ],
    isActive: true
  },
  {
    title: 'Royal Rajasthan Heritage: Udaipur, Jodhpur & Jaisalmer',
    description: 'Relive the grandeur of Rajput royalty across the golden sands of the Thar Desert. Explore the romantic City Palace and serene Lake Pichola in Udaipur, admire the towering blue fortress of Mehrangarh in Jodhpur, and venture deep into the living fort and wind-swept golden dunes of Jaisalmer with sunset desert vistas.',
    days: 6,
    nights: 5,
    price: 31999,
    numberOfPersons: 2,
    pricePerPerson: 15999,
    route: 'Udaipur (City of Lakes) → Jodhpur (Sun City) → Jaisalmer (Thar Desert Dunes) → Jodhpur',
    placesToExplore: [
      'City Palace Udaipur',
      'Lake Pichola & Saheliyon ki Bari',
      'Mehrangarh Fort Jodhpur',
      'Jaswant Thada & Umaid Bhawan',
      'Jaisalmer Golden Fort',
      'Sam Sand Dunes Desert Safari',
      'Patwon Ki Haveli'
    ],
    includes: [
      'Dedicated AC vehicle throughout the 6-day royal circuit',
      'Desert border permits, interstate taxes & toll fees',
      'Chauffeur night allowances, food expenses & fuel',
      'Airport/train pickup in Udaipur and drop in Jodhpur',
      'Intercity and monument transfers'
    ],
    excludes: [
      'Camel ride & dune-bashing jeep safari passes',
      'Monuments and palaces entrance fees',
      'Desert camp / hotel accommodation bookings',
      'Personal expenses, tips and beverages'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    destinations: [
      { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
      { name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
      { name: 'Jaisalmer', lat: 26.9157, lng: 70.9083 }
    ],
    pricing: [
      { vehicleType: 'Sedan (Dzire/Etios)', price: 31999 },
      { vehicleType: 'SUV (Ertiga/Carens)', price: 38999 },
      { vehicleType: 'Premium SUV (Innova Crysta)', price: 45999 }
    ],
    isActive: true
  },
  {
    title: 'Himachal Mountain Escape: Shimla, Kullu & Manali',
    description: 'Breathe crisp alpine air and take in panoramic views of snow-draped Himalayan peaks. Travel through apple orchards in Shimla and Kufri, cross the gushing Beas River in the Kullu valley, and experience snow adventures and pine forests in Solang Valley and Manali. A memorable mountain road trip with a seasoned hill driver.',
    days: 5,
    nights: 4,
    price: 21999,
    numberOfPersons: 2,
    pricePerPerson: 10999,
    route: 'Chandigarh / Delhi → Shimla & Kufri → Kullu Valley → Manali & Solang Valley → Return',
    placesToExplore: [
      'The Ridge & Mall Road Shimla',
      'Kufri Fun World & Yak Rides',
      'Hadimba Devi Temple Manali',
      'Solang Valley Snow Point',
      'Kullu River Rafting Valley',
      'Vashisht Hot Water Springs',
      'Old Manali Cafes'
    ],
    includes: [
      'Dedicated Private Cab with experienced hill-terrain chauffeur',
      'All Green Tax, State Border Entry Taxes & Parking fees',
      'Doorstep pickup and drop from Chandigarh or Delhi NCR',
      'All listed sightseeing locations & viewpoint transfers',
      'Fuel charges and driver daily Bata'
    ],
    excludes: [
      'Rohtang Pass special NGT green vehicle permit (if applicable)',
      'Adventure activities (paragliding, zorbing, river rafting)',
      'Hotel stays and individual dining',
      'Personal warm clothing & boot rentals'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    destinations: [
      { name: 'Shimla', lat: 31.1048, lng: 77.1734 },
      { name: 'Kullu', lat: 31.9579, lng: 77.1095 },
      { name: 'Manali', lat: 32.2396, lng: 77.1887 }
    ],
    pricing: [
      { vehicleType: 'Sedan (Dzire/Etios)', price: 21999 },
      { vehicleType: 'SUV (Ertiga/Carens)', price: 26999 },
      { vehicleType: 'Premium SUV (Innova Crysta)', price: 33999 }
    ],
    isActive: true
  },
  {
    title: 'Goa Coastal Beach & Heritage Circuit: North & South Goa',
    description: 'Discover the dual soul of Goa from party beaches to quiet Portuguese heritage. Sunbathe on the lively golden stretches of Baga and Calangute, uncover centuries of colonial architecture in Fontainhas Latin Quarter, visit ancient churches in Old Goa, and unwind along tranquil palm-lined southern shores with beachside seafood shacks.',
    days: 3,
    nights: 2,
    price: 11499,
    numberOfPersons: 2,
    pricePerPerson: 5749,
    route: 'North Goa Beaches → Panaji Heritage Latin Quarter → Old Goa Churches → South Goa Shores',
    placesToExplore: [
      'Baga & Calangute Beaches',
      'Aguada Coastal Portuguese Fort',
      'Fontainhas Latin Quarter Panaji',
      'Basilica of Bom Jesus',
      'Miramar Beach & Dona Paula Point',
      'Mandovi River Cruise Point',
      'Colva & Palolem Coastal Stretches'
    ],
    includes: [
      'Dedicated air-conditioned taxi for all 3 days',
      'Dabolim Airport / Mopa Airport / Madgaon Station pickup & drop',
      'Tolls, bridge fees, parking charges and fuel',
      'Chauffeur allowances throughout the tour',
      'Complete North & South Goa sightseeing transfers'
    ],
    excludes: [
      'Water sports packages (Jet ski, Parasailing, Banana ride)',
      'Mandovi evening cruise tickets & casino entry charges',
      'Food, cocktails and personal beach shack expenses',
      'Hotel resort bookings'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    destinations: [
      { name: 'North Goa', lat: 15.5439, lng: 73.7553 },
      { name: 'Panaji', lat: 15.4909, lng: 73.8278 },
      { name: 'South Goa', lat: 15.2832, lng: 73.9862 }
    ],
    pricing: [
      { vehicleType: 'Sedan (Dzire/Etios)', price: 11499 },
      { vehicleType: 'SUV (Ertiga/Carens)', price: 14999 },
      { vehicleType: 'Premium SUV (Innova Crysta)', price: 19999 }
    ],
    isActive: true
  },
  {
    title: 'Holy Spiritual Circuit: Varanasi, Prayagraj & Ayodhya',
    description: 'Embark on a sacred journey through the spiritual heart of India. Attend the soul-stirring evening Ganga Aarti on the ghats of ancient Kashi, take a holy dip at Triveni Sangam in Prayagraj where sacred rivers converge, and offer prayers at the historic Shri Ram Janmabhoomi Mandir in holy Ayodhya.',
    days: 4,
    nights: 3,
    price: 16999,
    numberOfPersons: 2,
    pricePerPerson: 8499,
    route: 'Varanasi (Kashi Ghats) → Sarnath → Prayagraj (Triveni Sangam) → Ayodhya (Ram Mandir) → Varanasi',
    placesToExplore: [
      'Kashi Vishwanath Jyotirlinga Temple',
      'Dashashwamedh Ghat Evening Ganga Aarti',
      'Triveni Sangam Prayagraj',
      'Shri Ram Janmabhoomi Mandir Ayodhya',
      'Hanuman Garhi Ayodhya',
      'Sarnath Dhamek Stupa',
      'Assi Ghat Morning Subah-e-Banaras'
    ],
    includes: [
      'Air-conditioned private cab with knowledgeable pilgrimage driver',
      'All National Highway toll taxes, interstate permits & parking',
      'Varanasi Babatpur Airport / Cantt Railway Station pickup & drop',
      'Complete intercity temple circuit transfers',
      'Driver daily Bata, meals and night halt charges'
    ],
    excludes: [
      'Ganga morning boat ride charges',
      'Special VIP Sugam Darshan temple passes',
      'Hotel room bookings & meals/prasadam',
      'Personal pooja offerings and donations'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    destinations: [
      { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
      { name: 'Prayagraj', lat: 25.4358, lng: 81.8463 },
      { name: 'Ayodhya', lat: 26.7922, lng: 82.1998 }
    ],
    pricing: [
      { vehicleType: 'Sedan (Dzire/Etios)', price: 16999 },
      { vehicleType: 'SUV (Ertiga/Carens)', price: 21499 },
      { vehicleType: 'Premium SUV (Innova Crysta)', price: 26999 }
    ],
    isActive: true
  },
  {
    title: 'Eastern Himalayas: Darjeeling, Kalimpong & Gangtok',
    description: 'Journey across tea-cloaked slopes, colonial hill towns, and the high-altitude wonders of Sikkim. Gaze at the sunrise turning Mount Kanchenjunga pink from Tiger Hill in Darjeeling, explore Buddhist monasteries and flower nurseries in peaceful Kalimpong, and stroll down the pedestrian promenade of MG Marg in Gangtok.',
    days: 5,
    nights: 4,
    price: 25499,
    numberOfPersons: 2,
    pricePerPerson: 12749,
    route: 'Bagdogra / NJP → Darjeeling (Queen of Hills) → Kalimpong → Gangtok (Sikkim) → Bagdogra',
    placesToExplore: [
      'Tiger Hill Kanchenjunga Sunrise',
      'Darjeeling Himalayan Toy Train',
      'Batasia Loop & Ghoom Monastery',
      'MG Marg Promenade Gangtok',
      'Tsomgo Changu Lake & Baba Mandir',
      'Rumtek Dharma Chakra Centre',
      'Delo Park Kalimpong'
    ],
    includes: [
      'Dedicated mountain-certified AC private vehicle',
      'Sikkim Inner Line border entry permits & paperwork',
      'Bagdogra Airport (IXB) / NJP Railway Station transfers',
      'All scenic viewpoints & intercity mountain transfers',
      'Fuel charges and driver mountain allowances'
    ],
    excludes: [
      'Toy Train UNESCO joyride ticket fares',
      'Nathula Pass Indo-China border special vehicle permit',
      'Ropeway / Cable car tickets',
      'Hotel stays & personal meal expenses'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    destinations: [
      { name: 'Darjeeling', lat: 27.0410, lng: 88.2663 },
      { name: 'Kalimpong', lat: 27.0594, lng: 88.4695 },
      { name: 'Gangtok', lat: 27.3389, lng: 88.6065 }
    ],
    pricing: [
      { vehicleType: 'Sedan (Dzire/Etios)', price: 25499 },
      { vehicleType: 'SUV (Ertiga/Carens)', price: 31499 },
      { vehicleType: 'Premium SUV (Innova Crysta)', price: 38999 }
    ],
    isActive: true
  }
];

async function seedTourPackages(force = false) {
  const isStandalone = require.main === module;
  
  if (isStandalone && mongoose.connection.readyState === 0) {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in .env');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  }

  try {
    const existingCount = await TourPackage.countDocuments();
    if (existingCount > 0 && !force) {
      const msg = `Tour packages already exist (${existingCount} found). Use force option to reseed.`;
      if (isStandalone) {
        console.log(msg);
        await mongoose.disconnect();
        return;
      }
      return { seeded: false, count: existingCount, message: msg };
    }

    if (force) {
      await TourPackage.deleteMany({});
      console.log('Cleared existing tour packages');
    }

    const created = await TourPackage.insertMany(tourPackagesData);
    const msg = `Successfully seeded ${created.length} tour packages into the database.`;
    console.log(msg);

    if (isStandalone) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }

    return { seeded: true, count: created.length, message: msg };
  } catch (error) {
    console.error('Error seeding tour packages:', error);
    if (isStandalone) {
      await mongoose.disconnect();
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  seedTourPackages(force).then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedTourPackages, tourPackagesData };
