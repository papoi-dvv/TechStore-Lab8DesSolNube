const { sequelize, Role, Store } = require('../models');

async function initializeDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const defaultRoles = [
    { nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
    { nombre: 'Gerente', descripcion: 'Gestión de productos y reportes de tienda' },
    { nombre: 'Empleado', descripcion: 'Actualiza stock y consulta productos de tienda' },
    { nombre: 'Auditor', descripcion: 'Solo lectura y reportes' },
  ];

  for (const role of defaultRoles) {
    await Role.findOrCreate({ where: { nombre: role.nombre }, defaults: role });
  }

  const defaultStores = [
    { nombre: 'Sucursal Central', ubicacion: 'Oficina Central' },
    { nombre: 'Sucursal Norte', ubicacion: 'Barrio Norte' },
  ];

  for (const store of defaultStores) {
    await Store.findOrCreate({ where: { nombre: store.nombre }, defaults: store });
  }

  console.log('Database initialized and default roles/stores are ready.');
}

module.exports = { initializeDatabase };
