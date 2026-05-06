require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initializeDatabase } = require('./initDatabase');
const { User, Role, UserRole, Store } = require('../models');

async function seedUsers() {
  await initializeDatabase();

  const adminEmail = 'admin@techstore.com';
  const managerEmail = 'gerente@techstore.com';

  const adminStore = await Store.findOne({ where: { nombre: 'Sucursal Central' } });
  const managerStore = await Store.findOne({ where: { nombre: 'Sucursal Norte' } });

  if (!adminStore || !managerStore) {
    throw new Error('No se encontraron las tiendas necesarias para el seeder.');
  }

  const adminRole = await Role.findOne({ where: { nombre: 'Administrador' } });
  const managerRole = await Role.findOne({ where: { nombre: 'Gerente' } });

  if (!adminRole || !managerRole) {
    throw new Error('No se encontraron los roles necesarios para el seeder.');
  }

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const managerPassword = await bcrypt.hash('Manager123!', 10);

  const [adminUser] = await User.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      password: adminPassword,
      nombre_completo: 'Administrador TechStore',
      tienda_id: adminStore.id,
      mfa_habilitado: false,
      activo: true,
    },
  });

  const [managerUser] = await User.findOrCreate({
    where: { email: managerEmail },
    defaults: {
      password: managerPassword,
      nombre_completo: 'Gerente TechStore',
      tienda_id: managerStore.id,
      mfa_habilitado: false,
      activo: true,
    },
  });

  await UserRole.findOrCreate({
    where: { usuario_id: adminUser.id, rol_id: adminRole.id },
    defaults: { asignado_por: adminUser.id },
  });

  await UserRole.findOrCreate({
    where: { usuario_id: managerUser.id, rol_id: managerRole.id },
    defaults: { asignado_por: adminUser.id },
  });

  console.log('Seeder ejecutado con éxito.');
  console.log('Admin:', adminEmail, 'Password: Admin123!');
  console.log('Manager:', managerEmail, 'Password: Manager123!');
}

seedUsers().catch(error => {
  console.error('Error ejecutando el seeder:', error);
  process.exit(1);
});
