const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { BOOKING_STATUS } = require('../utils/constants');

const Booking = sequelize.define('bookings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  boothId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'booth_id',
    references: {
      model: 'booths',
      key: 'id',
    },
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'customer_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date',
    validate: {
      isDate: { msg: 'Start date must be a valid date' },
    },
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date',
    validate: {
      isDate: { msg: 'End date must be a valid date' },
    },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price',
  },
  status: {
    type: DataTypes.ENUM(Object.values(BOOKING_STATUS)),
    allowNull: false,
    defaultValue: BOOKING_STATUS.PENDING,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  validate: {
    endDateAfterStartDate() {
      if (this.startDate && this.endDate) {
        if (new Date(this.endDate) <= new Date(this.startDate)) {
          throw new Error('End date must be after start date');
        }
      }
    },
  },
});

module.exports = Booking;
