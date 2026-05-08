require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initializeDatabase } = require('./initDatabase');
const { User, Role, UserRole, Store } = require('../models');

async function seedUsers() {
  await initializeDatabase();

  const stores = await Store.findAll();
  if (stores.length < 2) {
    throw new Error('Se requieren al menos 2 tiendas en la base de datos.');
  }

  const roles = await Role.findAll();
  const roleMap = {};
  roles.forEach(role => {
    roleMap[role.nombre] = role;
  });

  if (!roleMap['Administrador'] || !roleMap['Gerente'] || !roleMap['Empleado'] || !roleMap['Auditor']) {
    throw new Error('No se encontraron todos los roles necesarios para el seeder.');
  }

  const usersToCreate = [
    {
      email: 'admin@techstore.com',
      password: 'Admin123!',
      nombre_completo: 'Administrador TechStore',
      tienda_id: stores[0].id,
      rol: 'Administrador',
    },
    {
      email: 'gerente@techstore.com',
      password: 'Manager123!',
      nombre_completo: 'Gerente de Tienda',
      tienda_id: stores[1].id,
      rol: 'Gerente',
    },
    {
      email: 'empleado@techstore.com',
      password: 'Employee123!',
      nombre_completo: 'Empleado de Ventas',
      tienda_id: stores[1].id,
      rol: 'Empleado',
    },
    {
      email: 'auditor@techstore.com',
      password: 'Auditor123!',
      nombre_completo: 'Auditor del Sistema',
      tienda_id: stores[0].id,
      rol: 'Auditor',
    },
  ];

  const createdUsers = [];

  for (const userData of usersToCreate) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [user] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: {
        password: hashedPassword,
        nombre_completo: userData.nombre_completo,
        tienda_id: userData.tienda_id,
        mfa_habilitado: false,
        activo: true,
      },
    });

    await UserRole.findOrCreate({
      where: { usuario_id: user.id, rol_id: roleMap[userData.rol].id },
      defaults: { asignado_por: user.id },
    });

    createdUsers.push({
      email: userData.email,
      password: userData.password,
      rol: userData.rol,
    });
  }

  console.log('\n✅ Seeder ejecutado con éxito.\n');
  console.log('📋 Cuentas creadas:\n');
  createdUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.rol}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Contraseña: ${user.password}\n`);
  });
}

seedUsers().catch(error => {
  console.error('Error ejecutando el seeder:', error);
  process.exit(1);
});
