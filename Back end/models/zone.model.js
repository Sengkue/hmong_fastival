const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { SHAPE_TYPE } = require('../utils/constants');

const Zone = sequelize.define('zones', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  festivalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'festival_id',
    references: {
      model: 'festivals',
      key: 'id',
    },
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
      notEmpty: { msg: 'Zone name is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shapeType: {
    type: DataTypes.ENUM(Object.values(SHAPE_TYPE)),
    allowNull: true,
    field: 'shape_type',
  },
  shapeCoordinates: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'shape_coordinates',
    comment: 'JSON coordinates for the map shape (rectangle, polygon, circle)',
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#3498db',
    comment: 'Color code for the zone shape on the map',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
});

module.exports = Zone;
