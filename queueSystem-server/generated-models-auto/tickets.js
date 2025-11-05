const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tickets', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    ticket_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    sequence_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "waiting"
    },
    called_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    businessTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'business_types',
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
    }
  }, {
    sequelize,
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "sqlite_autoindex_tickets_1",
        unique: true,
        fields: [
          { name: "ticket_number" },
        ]
      },
    ]
  });
};
