const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ticketSequences', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    business_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    current_total_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    current_passed_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true
    },
    business_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'business_types',
        key: 'id'
      },
      unique: true
    }
  }, {
    sequelize,
    tableName: 'ticket_sequences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "ticket_sequences_business_type_id_date",
        unique: true,
        fields: [
          { name: "business_type_id" },
          { name: "date" },
        ]
      },
    ]
  });
};
