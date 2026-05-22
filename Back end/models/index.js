const sequelize = require('../config/db');
const User = require('./user.model');
const Festival = require('./festival.model');
const Zone = require('./zone.model');
const Booth = require('./booth.model');
const Booking = require('./booking.model');
const Payment = require('./payment.model');

// ============================================
// Define Associations
// ============================================

// Festival → Zone (One-to-Many)
Festival.hasMany(Zone, { foreignKey: 'festival_id', as: 'zones' });
Zone.belongsTo(Festival, { foreignKey: 'festival_id', as: 'festival' });

// User (Owner) → Zone (One-to-Many)
User.hasMany(Zone, { foreignKey: 'owner_id', as: 'ownedZones' });
Zone.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Zone → Booth (One-to-Many)
Zone.hasMany(Booth, { foreignKey: 'zone_id', as: 'booths' });
Booth.belongsTo(Zone, { foreignKey: 'zone_id', as: 'zone' });

// User (Owner) → Booth (One-to-Many)
User.hasMany(Booth, { foreignKey: 'owner_id', as: 'ownedBooths' });
Booth.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Booth → Booking (One-to-Many)
Booth.hasMany(Booking, { foreignKey: 'booth_id', as: 'bookings' });
Booking.belongsTo(Booth, { foreignKey: 'booth_id', as: 'booth' });

// User (Customer) → Booking (One-to-Many)
User.hasMany(Booking, { foreignKey: 'customer_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

// Booking → Payment (One-to-One)
Booking.hasOne(Payment, { foreignKey: 'booking_id', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// ============================================
// Export all models and sequelize instance
// ============================================
const db = {
  sequelize,
  User,
  Festival,
  Zone,
  Booth,
  Booking,
  Payment,
};

module.exports = db;
