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
  { name: 'Manikonda', lat: 17.4114, lng: 78.3913 },
  { name: 'Kondapur', lat: 17.4614, lng: 78.3474 },
];

// --- Collector Specializations ---
// Updated based on your new requirements
const collectorSpecializations = [
    { name: "Hyderabad General Waste", types: [WasteType.GENERAL] },
    { name: "Deccan Plastic Recyclers", types: [WasteType.RECYCLABLE] }, // Represents Plastic
    { name: "Charminar Glass Co.", types: [WasteType.RECYCLABLE] },      // Represents Glass
    { name: "Golkonda Paper Mills", types: [WasteType.RECYCLABLE] },     // Represents Paper
    { name: "Nizam Metal Scrap", types: [WasteType.RECYCLABLE] },        // Represents Metal
    { name: "Cyberabad E-Waste Solutions", types: [WasteType.E_WASTE] },
    { name: "Pearl City Lighting Recycle", types: [WasteType.E_WASTE, WasteType.HAZARDOUS] }, // For Bulbs
    { name: "Hyderabad Rubble Removers", types: [WasteType.CONSTRUCTION_DEBRIS] },
    { name: "Green Hyderabad Organics", types: [WasteType.ORGANIC] },
    { name: "Arogya Waste Care Foundation", types: [WasteType.MEDICAL] }, // NGO Style Name for Sanitary/Medical
    { name: "Swachh Health Initiative", types: [WasteType.MEDICAL] },     // NGO Style Name for Sanitary/Medical
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

  const hashedPassword = await bcrypt.hash('password123', 10);

  // --- 2. Seed Household Users ---
  console.log('👤 Seeding 100 household users in Hyderabad...');
  for (let i = 0; i < 100; i++) {
    const location = faker.helpers.arrayElement(hyderabadLocations);
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: faker.internet.email({ firstName: `user${i}`}).toLowerCase(),
          password: hashedPassword,
          phone: faker.phone.number(),
          role: Role.HOUSEHOLD,
        },
      });
      await tx.householdProfile.create({
        data: {
          userId: user.id,
          name: faker.person.fullName(),
          dateOfBirth: faker.date.birthdate(),
          address: `${faker.location.streetAddress()}, ${location.name}, Hyderabad`,
          latitude: faker.location.latitude({ min: location.lat - 0.05, max: location.lat + 0.05, precision: 6 }),
          longitude: faker.location.longitude({ min: location.lng - 0.05, max: location.lng + 0.05, precision: 6 }),
        },
      });
    });
  }
  console.log('✅ 100 household users created.');

  // --- 3. Seed Collector Users ---
  console.log('🚛 Seeding 40 specialized collectors in Hyderabad...');
  for (let i = 0; i < 40; i++) {
    const location = faker.helpers.arrayElement(hyderabadLocations);
    // Cycle through the specializations to ensure a good mix
    const specialization = collectorSpecializations[i % collectorSpecializations.length]; 

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: faker.internet.email({ firstName: `collector${i}`}).toLowerCase(),
          password: hashedPassword,
          phone: faker.phone.number(),
          role: Role.COLLECTOR,
        },
      });
      await tx.collectorProfile.create({
        data: {
          userId: user.id,
          name: `${specialization.name} #${Math.floor(i / collectorSpecializations.length) + 1}`,
          address: `${faker.location.streetAddress()}, ${location.name}, Hyderabad`,
          latitude: faker.location.latitude({ min: location.lat - 0.05, max: location.lat + 0.05, precision: 6 }),
          longitude: faker.location.longitude({ min: location.lng - 0.05, max: location.lng + 0.05, precision: 6 }),
          identityDocumentUrl: faker.image.url(),
          isVerified: true,
          vehicleDetails: `Tata Ace - ${faker.vehicle.vrm()}`,
          acceptedWasteTypes: specialization.types,
        },
      });
    });
  }
  console.log('✅ 40 collectors created.');
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
