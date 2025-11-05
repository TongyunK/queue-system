const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('devices', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    device_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    device_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    device_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "active"
    },
    counterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'counters',
        key: 'id'
      }
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'devices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: "sqlite_autoindex_devices_1",
        unique: true,
        fields: [
          { name: "device_id" },
        ]
      },
    ]
  });
};
