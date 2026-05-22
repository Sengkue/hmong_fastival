require('dotenv').config();
const db = require('../models');
const { ROLES, BOOTH_STATUS, SHAPE_TYPE } = require('../utils/constants');

const seed = async () => {
  try {
    // Connect to database
    await db.sequelize.authenticate();
    console.log('✅ Database connected.');

    // Sync tables (force: true will drop existing tables - use with caution!)
    await db.sequelize.sync({ force: true });
    console.log('✅ Tables created.');

    // ========================================
    // 1. Create Users
    // ========================================
    const adminUser = await db.User.create({
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@festival.com',
      password: 'Admin@123',
      phone: '020-1234567',
      role: ROLES.ADMIN,
    });
    console.log('✅ Admin user created: admin@festival.com / Admin@123');

    const ownerUser = await db.User.create({
      firstName: 'Owner',
      lastName: 'Demo',
      email: 'owner@festival.com',
      password: 'Owner@123',
      phone: '020-7654321',
      role: ROLES.OWNER,
    });
    console.log('✅ Owner user created: owner@festival.com / Owner@123');

    const customerUser = await db.User.create({
      firstName: 'Customer',
      lastName: 'Demo',
      email: 'customer@festival.com',
      password: 'Customer@123',
      phone: '020-1111111',
      role: ROLES.CUSTOMER,
    });
    console.log('✅ Customer user created: customer@festival.com / Customer@123');

    // ========================================
    // 2. Create Festival
    // ========================================
    const festival = await db.Festival.create({
      name: 'ບຸນກິນຈຽງ Vientiane Hmong Festival 2027',
      code: 'VTE-HMONG',
      address: 'Lao-ITECC Exhibition Centre & Fields',
      city: 'Vientiane',
      country: 'Laos',
      latitude: 17.9883,
      longitude: 102.5633,
      description: 'The annual grand Hmong Hmong Festival celebrating Hmong cultural heritage and products in Vientiane.',
    });
    console.log('✅ Festival created: ບຸນກິນຈຽງ Vientiane Hmong Festival 2027 (VTE-HMONG)');

    // ========================================
    // 3. Create Zones
    // ========================================
    const zone1 = await db.Zone.create({
      festivalId: festival.id,
      ownerId: ownerUser.id,
      name: 'Zone A - Hmong Cultural Hall',
      description: 'Hmong cultural arts, clothes, and heritage products area',
      shapeType: SHAPE_TYPE.RECTANGLE,
      shapeCoordinates: {
        north: 17.9890,
        south: 17.9880,
        east: 102.5640,
        west: 102.5625,
      },
      color: '#3498db',
    });

    const zone2 = await db.Zone.create({
      festivalId: festival.id,
      ownerId: ownerUser.id,
      name: 'Zone B - Hmong Traditional Foods',
      description: 'Traditional Hmong dishes and drinks area',
      shapeType: SHAPE_TYPE.POLYGON,
      shapeCoordinates: {
        paths: [
          { lat: 17.9885, lng: 102.5645 },
          { lat: 17.9890, lng: 102.5650 },
          { lat: 17.9882, lng: 102.5655 },
          { lat: 17.9878, lng: 102.5648 },
        ],
      },
      color: '#e74c3c',
    });

    console.log('✅ Zones created: Zone A, Zone B');

    // ========================================
    // 4. Create Booths
    // ========================================
    const booth1 = await db.Booth.create({
      zoneId: zone1.id,
      ownerId: ownerUser.id,
      name: 'Booth A-01',
      description: 'Corner booth near the main cultural stage',
      size: '3x3m',
      pricePerDay: 500.00,
      status: BOOTH_STATUS.AVAILABLE,
    });

    const booth2 = await db.Booth.create({
      zoneId: zone1.id,
      ownerId: ownerUser.id,
      name: 'Booth A-02',
      description: 'Standard booth in the primary costume aisle',
      size: '2x2m',
      pricePerDay: 350.00,
      status: BOOTH_STATUS.AVAILABLE,
    });

    const booth3 = await db.Booth.create({
      zoneId: zone2.id,
      ownerId: ownerUser.id,
      name: 'Booth B-01',
      description: 'Prime food stall with gas line and water access',
      size: '4x3m',
      pricePerDay: 800.00,
      status: BOOTH_STATUS.AVAILABLE,
    });

    console.log('✅ Booths created: A-01, A-02, B-01');

    // ========================================
    // Done
    // ========================================
    console.log('\n🎉 Seed completed successfully!');
    console.log('================================================');
    console.log('  Login Credentials:');
    console.log('  Admin:    admin@festival.com    / Admin@123');
    console.log('  Owner:    owner@festival.com    / Owner@123');
    console.log('  Customer: customer@festival.com / Customer@123');
    console.log('================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seed();
