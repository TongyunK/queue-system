const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('callLogs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    call_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tickets',
        key: 'id'
      }
    },
    counterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'counters',
        key: 'id'
      }
    },
    businessTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'business_types',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'call_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
