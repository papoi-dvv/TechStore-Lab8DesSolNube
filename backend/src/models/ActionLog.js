const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActionLog = sequelize.define('ActionLog', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recurso: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  detalles: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

module.exports = ActionLog;
