const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { BOOTH_STATUS } = require('../utils/constants');

const Booth = sequelize.define('booths', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'zone_id',
    references: {
      model: 'zones',
      key: 'id',
    },
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'owner_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Booth name is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  size: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Size of the booth (e.g., "3x3m", "small", "large")',
  },
  pricePerDay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_day',
    validate: {
      min: { args: [0], msg: 'Price must be a positive number' },
    },
  },
  status: {
    type: DataTypes.ENUM(Object.values(BOOTH_STATUS)),
    allowNull: false,
    defaultValue: BOOTH_STATUS.AVAILABLE,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
});

module.exports = Booth;
