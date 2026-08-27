require('dotenv').config();
const mongoose = require('mongoose');
const VehicleType = require('../src/models/VehicleType.model');

const vehiclesToSeed = [
  {
    name: 'Hatchback (Swift, i10 or similar)',
    category: 'Hatchback',
    baseFare: 2000,
    pricePerKm: 10,
    advanceAmount: 500,
    seatingCapacity: 4,
    luggageCapacity: 1,
    iconUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwyHwSzS8sd_smxXHl-P4YeyeXFjwndBi1cw6ylGsYTw&s=10',
    isActive: true,
  },
  {
    name: 'Sedan (Dzire, Etios or similar)',
    category: 'Sedan',
    baseFare: 2000,
    pricePerKm: 12,
    advanceAmount: 500,
    seatingCapacity: 4,
    luggageCapacity: 2,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/2017_Maruti_Suzuki_Dzire_ZDi_front_11.02.17.jpg/800px-2017_Maruti_Suzuki_Dzire_ZDi_front_11.02.17.jpg',
    isActive: true,
  },
  {
    name: 'Premium Sedan (Honda City or similar)',
    category: 'Sedan',
    baseFare: 2500,
    pricePerKm: 15,
    advanceAmount: 1000,
    seatingCapacity: 4,
    luggageCapacity: 3,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/2014_Honda_City_1.5_E_sedan_%282014-03-01%29.jpg/800px-2014_Honda_City_1.5_E_sedan_%282014-03-01%29.jpg',
    isActive: true,
  },
  {
    name: 'SUV (Ertiga or similar)',
    category: 'SUV',
    baseFare: 2500,
    pricePerKm: 15,
    advanceAmount: 1000,
    seatingCapacity: 6,
    luggageCapacity: 3,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/2019_Suzuki_Ertiga_GL_1.5_front_11.03.19.jpg/800px-2019_Suzuki_Ertiga_GL_1.5_front_11.03.19.jpg',
    isActive: true,
  },
  {
    name: 'MUV (Innova Crysta)',
    category: 'SUV',
    baseFare: 3000,
    pricePerKm: 18,
    advanceAmount: 1500,
    seatingCapacity: 6,
    luggageCapacity: 4,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/2016_Toyota_Innova_2.0_G_front_view.jpg/800px-2016_Toyota_Innova_2.0_G_front_view.jpg',
    isActive: true,
  },
  {
    name: 'Luxury (BMW, Mercedes)',
    category: 'Luxury',
    baseFare: 5000,
    pricePerKm: 50,
    advanceAmount: 2000,
    seatingCapacity: 4,
    luggageCapacity: 3,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/2017_BMW_520d_M_Sport_Automatic_2.0_Front.jpg/800px-2017_BMW_520d_M_Sport_Automatic_2.0_Front.jpg',
    isActive: true,
  },
  {
    name: 'Mini (Alto, WagonR or similar)',
    category: 'Hatchback',
    baseFare: 1500,
    pricePerKm: 9,
    advanceAmount: 500,
    seatingCapacity: 4,
    luggageCapacity: 1,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/2019_Suzuki_Alto_800_VXi_1.0_Front.jpg/800px-2019_Suzuki_Alto_800_VXi_1.0_Front.jpg',
    isActive: true,
  },
  {
    name: 'Sedan (Toyota Etios or similar)',
    category: 'Sedan',
    baseFare: 2000,
    pricePerKm: 12,
    advanceAmount: 500,
    seatingCapacity: 4,
    luggageCapacity: 2,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Toyota_Etios_1.5_G_%28I%29_front.jpg/800px-Toyota_Etios_1.5_G_%28I%29_front.jpg',
    isActive: true,
  },
  {
    name: 'SUV (Mahindra Scorpio or similar)',
    category: 'SUV',
    baseFare: 2800,
    pricePerKm: 17,
    advanceAmount: 1200,
    seatingCapacity: 7,
    luggageCapacity: 3,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/2017_Mahindra_Scorpio_S10_front.jpg/800px-2017_Mahindra_Scorpio_S10_front.jpg',
    isActive: true,
  },
  {
    name: 'MUV (Mahindra Marazzo)',
    category: 'SUV',
    baseFare: 2800,
    pricePerKm: 16,
    advanceAmount: 1200,
    seatingCapacity: 7,
    luggageCapacity: 3,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Mahindra_Marazzo.jpg/800px-Mahindra_Marazzo.jpg',
    isActive: true,
  },
  {
    name: 'Premium SUV (Toyota Fortuner or similar)',
    category: 'SUV',
    baseFare: 4000,
    pricePerKm: 25,
    advanceAmount: 1500,
    seatingCapacity: 7,
    luggageCapacity: 4,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/2016_Toyota_Fortuner_2.8_4WD.jpg/800px-2016_Toyota_Fortuner_2.8_4WD.jpg',
    isActive: true,
  },
  {
    name: 'Tempo Traveller (12 Seater)',
    category: 'Tempo Traveller',
    baseFare: 5000,
    pricePerKm: 22,
    advanceAmount: 2000,
    seatingCapacity: 12,
    luggageCapacity: 6,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Force_Traveller.jpg/800px-Force_Traveller.jpg',
    isActive: true,
  },
  {
    name: 'Tempo Traveller (17 Seater)',
    category: 'Tempo Traveller',
    baseFare: 6500,
    pricePerKm: 26,
    advanceAmount: 2500,
    seatingCapacity: 17,
    luggageCapacity: 8,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Force_Traveller.jpg/800px-Force_Traveller.jpg',
    isActive: true,
  },
  {
    name: 'Luxury MUV (Toyota Vellfire or similar)',
    category: 'Luxury',
    baseFare: 8000,
    pricePerKm: 60,
    advanceAmount: 3000,
    seatingCapacity: 6,
    luggageCapacity: 4,
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Toyota_Vellfire_%28AH30%29.jpg/800px-Toyota_Vellfire_%28AH30%29.jpg',
    isActive: true,
  },
];

async function seedVehicles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const vehicleData of vehiclesToSeed) {
      // Check if vehicle already exists by name
      const existingVehicle = await VehicleType.findOne({ name: vehicleData.name });

      if (existingVehicle) {
        console.log(`Vehicle '${vehicleData.name}' already exists. Updating...`);
        Object.assign(existingVehicle, vehicleData);
        await existingVehicle.save();
        console.log(`Vehicle '${vehicleData.name}' updated successfully.`);
      } else {
        console.log(`Creating new vehicle '${vehicleData.name}'...`);
        const newVehicle = new VehicleType(vehicleData);
        await newVehicle.save();
        console.log(`Vehicle '${vehicleData.name}' created successfully.`);
      }
    }

    console.log('Finished seeding vehicles!');
  } catch (error) {
    console.error('Error seeding vehicles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedVehicles();
