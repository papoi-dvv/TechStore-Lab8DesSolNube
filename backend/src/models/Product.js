const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tienda_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  es_premium: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  creado_por: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
});

module.exports = Product;
