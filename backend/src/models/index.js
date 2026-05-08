const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');
const Store = require('./Store');
const Product = require('./Product');
const ActionLog = require('./ActionLog');
const Audit = require('./Audit');

// Store relationships
Store.hasMany(User, { foreignKey: 'tienda_id' });
User.belongsTo(Store, { foreignKey: 'tienda_id' });

Store.hasMany(Product, { foreignKey: 'tienda_id' });
Product.belongsTo(Store, { foreignKey: 'tienda_id' });

Store.hasMany(Audit, { foreignKey: 'tienda_id' });
Audit.belongsTo(Store, { foreignKey: 'tienda_id' });

// User-Role relationships
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'usuario_id',
  otherKey: 'rol_id',
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'rol_id',
  otherKey: 'usuario_id',
});

User.hasMany(UserRole, { foreignKey: 'usuario_id' });
UserRole.belongsTo(User, { foreignKey: 'usuario_id' });
Role.hasMany(UserRole, { foreignKey: 'rol_id' });
UserRole.belongsTo(Role, { foreignKey: 'rol_id' });

// User-Product relationships
User.hasMany(Product, { foreignKey: 'creado_por' });
Product.belongsTo(User, { foreignKey: 'creado_por', as: 'creator' });

// User-ActionLog relationships
User.hasMany(ActionLog, { foreignKey: 'usuario_id' });
ActionLog.belongsTo(User, { foreignKey: 'usuario_id' });

// User-Audit relationships
User.hasMany(Audit, { foreignKey: 'auditor_id' });
Audit.belongsTo(User, { foreignKey: 'auditor_id', as: 'auditor' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Store,
  Product,
  ActionLog,
  Audit,
};
