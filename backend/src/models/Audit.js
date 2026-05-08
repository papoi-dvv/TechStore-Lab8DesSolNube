const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Audit = sequelize.define('Audit', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  tienda_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  auditor_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  fecha_auditoria: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_progreso', 'completada', 'rechazada'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  incidencias: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  productos_revisados: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  calificacion: {
    type: DataTypes.ENUM('excelente', 'bueno', 'regular', 'malo'),
    allowNull: true,
  },
  detalles_incidencias: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Audit;
