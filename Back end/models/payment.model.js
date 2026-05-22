const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { PAYMENT_STATUS, PAYMENT_METHOD } = require('../utils/constants');

const Payment = sequelize.define('payments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'booking_id',
    references: {
      model: 'bookings',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Amount must be a positive number' },
    },
  },
  method: {
    type: DataTypes.ENUM(Object.values(PAYMENT_METHOD)),
    allowNull: false,
    defaultValue: PAYMENT_METHOD.CASH,
  },
  status: {
    type: DataTypes.ENUM(Object.values(PAYMENT_STATUS)),
    allowNull: false,
    defaultValue: PAYMENT_STATUS.PENDING,
  },
  transactionRef: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'transaction_ref',
    comment: 'External payment reference or receipt number',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at',
  },
});

module.exports = Payment;
