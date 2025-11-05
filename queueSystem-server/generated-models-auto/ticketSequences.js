const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ticketSequences', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    current_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    business_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'business_types',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'ticket_sequences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
