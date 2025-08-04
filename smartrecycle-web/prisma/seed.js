const { PrismaClient, Role, WasteType } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// --- Data for Hyderabad Locations ---
const hyderabadLocations = [
  { name: 'Banjara Hills', lat: 17.4186, lng: 78.4358 },
  { name: 'Jubilee Hills', lat: 17.4313, lng: 78.4031 },
  { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { name: 'Hitech City', lat: 17.4435, lng: 78.3772 },
  { name: 'Kukatpally', lat: 17.4857, lng: 78.4011 },
  { name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
  { name: 'Ameerpet', lat: 17.4375, lng: 78.4483 },
  { name: 'Dilsukhnagar', lat: 17.3688, lng: 78.5247 },
  { name: 'Mehdipatnam', lat: 17.3800, lng: 78.4346 },
  { name: 'Tolichowki', lat: 17.3995, lng: 78.4150 },
];

// --- Collector Specializations ---
const collectorSpecializations = [
    { name: "Hyderabad Organic Composting", types: [WasteType.ORGANIC] },
    { name: "Deccan Plastic Recyclers", types: [WasteType.PLASTIC] },
    { name: "Golkonda Paper Mills", types: [WasteType.PAPER] },
    { name: "Nizam Metal Scrap", types: [WasteType.METAL] },
    { name: "Charminar Glass Works", types: [WasteType.GLASS] },
    { name: "Cyberabad E-Waste Solutions", types: [WasteType.E_WASTE] },
    { name: "Pearl City Lighting Recycle", types: [WasteType.BULBS_LIGHTING] },
    { name: "Hyderabad Rubble Removers", types: [WasteType.CONSTRUCTION_DEBRIS] },
    { name: "Arogya Waste Care Foundation", types: [WasteType.SANITARY_WASTE] },
    { name: "Swachh Health Initiative", types: [WasteType.MEDICAL] },
    { name: "Telangana Dry Waste Mgmt", types: [WasteType.GENERAL] }, // For "Other dry waste"
];

// --- Incentive Prices (per kg) ---
const incentiveData = [
    { wasteType: WasteType.PLASTIC, pricePerKg: 8.50 },
    { wasteType: WasteType.PAPER, pricePerKg: 5.00 },
    { wasteType: WasteType.METAL, pricePerKg: 15.00 },
    { wasteType: WasteType.E_WASTE, pricePerKg: 25.00 },
];


async function main() {
  console.log('🌱 Starting the seeding process...');

  // --- 1. Seed Admin User ---
  const adminEmail = 'admin@smartrecycle.com';
  const adminPassword = 'adminpassword';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        phone: '0000000000',
        role: Role.ADMIN,
      },
    });
    console.log('✅ Default admin user created.');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // --- 2. Seed Incentive Prices ---
  console.log('💰 Seeding incentive prices...');
  for (const incentive of incentiveData) {
      await prisma.incentive.upsert({
          where: { wasteType: incentive.wasteType },
          update: { pricePerKg: incentive.pricePerKg },
          create: {
              wasteType: incentive.wasteType,
              pricePerKg: incentive.pricePerKg
          }
      });
  }
  console.log('✅ Incentive prices set.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // --- 3. Seed Household Users ---
  console.log('👤 Seeding 10 household users in Hyderabad...');
  for (let i = 0; i < 10; i++) {
    const location = faker.helpers.arrayElement(hyderabadLocations);
    await prisma.user.create({
        data: {
            email: faker.internet.email({ firstName: `user${i}`}).toLowerCase(),
            password: hashedPassword,
            phone: faker.phone.number(),
            role: Role.HOUSEHOLD,
            householdProfile: {
                create: {
                    name: faker.person.fullName(),
                    dateOfBirth: faker.date.birthdate(),
                    address: `${faker.location.streetAddress()}, ${location.name}, Hyderabad`,
                    latitude: faker.location.latitude({ min: location.lat - 0.05, max: location.lat + 0.05, precision: 6 }),
                    longitude: faker.location.longitude({ min: location.lng - 0.05, max: location.lng + 0.05, precision: 6 }),
                }
            }
        }
    });
  }
  console.log('✅ 10 household users created.');

  // --- 4. Seed Collector Users ---
  console.log(`🚛 Seeding ${collectorSpecializations.length} specialized collectors in Hyderabad...`);
  for (let i = 0; i < collectorSpecializations.length; i++) {
    const location = faker.helpers.arrayElement(hyderabadLocations);
    const specialization = collectorSpecializations[i]; 

    await prisma.user.create({
        data: {
            email: faker.internet.email({ firstName: `collector${i}`}).toLowerCase(),
            password: hashedPassword,
            phone: faker.phone.number(),
            role: Role.COLLECTOR,
            collectorProfile: {
                create: {
                    name: specialization.name,
                    address: `${faker.location.streetAddress()}, ${location.name}, Hyderabad`,
                    latitude: faker.location.latitude({ min: location.lat - 0.05, max: location.lat + 0.05, precision: 6 }),
                    longitude: faker.location.longitude({ min: location.lng - 0.05, max: location.lng + 0.05, precision: 6 }),
                    identityDocumentUrl: faker.image.url(),
                    isVerified: true,
                    vehicleDetails: `Tata Ace - ${faker.vehicle.vrm()}`,
                    acceptedWasteTypes: specialization.types,
                }
            }
        }
    });
  }
  console.log(`✅ ${collectorSpecializations.length} collectors created.`);
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🌱 Seeding process finished.');
  });
