const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('counterBusinessLastTicket', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    counter_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'counters',
        key: 'id'
      }
    },
    business_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'business_types',
        key: 'id'
      }
    },
    last_ticket_no: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'counter_business_last_ticket',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "idx_counter_business_last_ticket_business_type_id",
        fields: [
          { name: "business_type_id" },
        ]
      },
      {
        name: "idx_counter_business_last_ticket_counter_id",
        fields: [
          { name: "counter_id" },
        ]
      },
      {
        name: "idx_counter_business_last_ticket_composite",
        fields: [
          { name: "business_type_id" },
          { name: "counter_id" },
        ]
      }
    ]
  });
};
