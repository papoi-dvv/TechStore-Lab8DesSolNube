require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initializeDatabase } = require('./initDatabase');
const { User, Role, UserRole, Store, Product, Audit } = require('../models');

async function seedData() {
  await initializeDatabase();

  console.log('🌱 Iniciando seeder completo...\n');

  // ============================================
  // 1. CREAR TIENDAS
  // ============================================
  console.log('📍 Creando tiendas...');
  const stores = await Store.findAll();
  let storeC, storeN, storeO;

  if (stores.length < 3) {
    [storeC] = await Store.findOrCreate({
      where: { nombre: 'Sucursal Central' },
      defaults: { ubicacion: 'Calle Principal 123, Ciudad' },
    });
    [storeN] = await Store.findOrCreate({
      where: { nombre: 'Sucursal Norte' },
      defaults: { ubicacion: 'Av. Norte 456, Norte' },
    });
    [storeO] = await Store.findOrCreate({
      where: { nombre: 'Sucursal Oeste' },
      defaults: { ubicacion: 'Avenida Oeste 789, Oeste' },
    });
  } else {
    [storeC, storeN, storeO] = stores;
  }
  console.log(`✅ ${stores.length >= 3 ? 'Tiendas ya existen' : '3 tiendas creadas'}\n`);

  // ============================================
  // 2. OBTENER ROLES
  // ============================================
  console.log('👥 Configurando roles...');
  const roles = await Role.findAll();
  const roleMap = {};
  roles.forEach(role => (roleMap[role.nombre] = role));

  if (!roleMap['Administrador'] || !roleMap['Gerente'] || !roleMap['Empleado'] || !roleMap['Auditor']) {
    throw new Error('No se encontraron todos los roles.');
  }
  console.log('✅ Roles configurados\n');

  // ============================================
  // 3. CREAR USUARIOS
  // ============================================
  console.log('👤 Creando usuarios...');
  const usersData = [
    {
      email: 'admin@techstore.com',
      password: 'Admin123!',
      nombre_completo: 'Administrador TechStore',
      tienda_id: storeC.id,
      rol: 'Administrador',
    },
    {
      email: 'gerente.central@techstore.com',
      password: 'Manager123!',
      nombre_completo: 'Carlos Gerente Central',
      tienda_id: storeC.id,
      rol: 'Gerente',
    },
    {
      email: 'gerente.norte@techstore.com',
      password: 'Manager123!',
      nombre_completo: 'María Gerente Norte',
      tienda_id: storeN.id,
      rol: 'Gerente',
    },
    {
      email: 'empleado.central@techstore.com',
      password: 'Employee123!',
      nombre_completo: 'Juan Empleado Central',
      tienda_id: storeC.id,
      rol: 'Empleado',
    },
    {
      email: 'empleado.norte@techstore.com',
      password: 'Employee123!',
      nombre_completo: 'Ana Empleado Norte',
      tienda_id: storeN.id,
      rol: 'Empleado',
    },
    {
      email: 'auditor.central@techstore.com',
      password: 'Auditor123!',
      nombre_completo: 'Roberto Auditor Central',
      tienda_id: storeC.id,
      rol: 'Auditor',
    },
    {
      email: 'auditor.norte@techstore.com',
      password: 'Auditor123!',
      nombre_completo: 'Laura Auditor Norte',
      tienda_id: storeN.id,
      rol: 'Auditor',
    },
  ];

  const users = {};
  for (const userData of usersData) {
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

    users[userData.email] = user;
    console.log(`  ✓ ${userData.nombre_completo} (${userData.rol})`);
  }
  console.log('✅ Usuarios creados\n');

  // ============================================
  // 4. CREAR PRODUCTOS
  // ============================================
  console.log('📦 Creando productos...');
  const productsData = [
    // Sucursal Central - Laptops
    { nombre: 'MacBook Pro 16"', categoria: 'Laptops', precio: 2499.99, stock: 5, tienda_id: storeC.id, es_premium: true },
    { nombre: 'Dell XPS 15', categoria: 'Laptops', precio: 1799.99, stock: 8, tienda_id: storeC.id, es_premium: true },
    { nombre: 'HP Pavilion 15', categoria: 'Laptops', precio: 699.99, stock: 15, tienda_id: storeC.id, es_premium: false },
    { nombre: 'Lenovo ThinkPad E14', categoria: 'Laptops', precio: 849.99, stock: 12, tienda_id: storeC.id, es_premium: false },

    // Sucursal Central - Monitores
    { nombre: 'LG UltraWide 34"', categoria: 'Monitores', precio: 599.99, stock: 6, tienda_id: storeC.id, es_premium: true },
    { nombre: 'Dell S2421H 24"', categoria: 'Monitores', precio: 249.99, stock: 20, tienda_id: storeC.id, es_premium: false },
    { nombre: 'ASUS VP28U 4K', categoria: 'Monitores', precio: 399.99, stock: 8, tienda_id: storeC.id, es_premium: false },

    // Sucursal Central - Accesorios
    { nombre: 'Magic Mouse', categoria: 'Accesorios', precio: 99.99, stock: 25, tienda_id: storeC.id, es_premium: true },
    { nombre: 'Teclado Mecánico RGB', categoria: 'Accesorios', precio: 149.99, stock: 30, tienda_id: storeC.id, es_premium: false },
    { nombre: 'Webcam 4K Logitech', categoria: 'Accesorios', precio: 179.99, stock: 15, tienda_id: storeC.id, es_premium: false },

    // Sucursal Norte - Laptops
    { nombre: 'MacBook Air M1', categoria: 'Laptops', precio: 1299.99, stock: 4, tienda_id: storeN.id, es_premium: true },
    { nombre: 'Asus VivoBook 15', categoria: 'Laptops', precio: 549.99, stock: 18, tienda_id: storeN.id, es_premium: false },

    // Sucursal Norte - Monitores
    { nombre: 'Samsung Odyssey G7', categoria: 'Monitores', precio: 699.99, stock: 5, tienda_id: storeN.id, es_premium: true },
    { nombre: 'BenQ EW2480', categoria: 'Monitores', precio: 199.99, stock: 22, tienda_id: storeN.id, es_premium: false },

    // Sucursal Norte - Accesorios
    { nombre: 'SSD Samsung 970 EVO 1TB', categoria: 'Accesorios', precio: 139.99, stock: 40, tienda_id: storeN.id, es_premium: false },
    { nombre: 'USB-C Hub ProMax', categoria: 'Accesorios', precio: 89.99, stock: 35, tienda_id: storeN.id, es_premium: false },

    // Sucursal Oeste
    { nombre: 'iPad Pro 12.9"', categoria: 'Tablets', precio: 1199.99, stock: 3, tienda_id: storeO.id, es_premium: true },
    { nombre: 'Samsung Galaxy Tab S8', categoria: 'Tablets', precio: 799.99, stock: 7, tienda_id: storeO.id, es_premium: false },
  ];

  for (const prodData of productsData) {
    await Product.findOrCreate({
      where: { nombre: prodData.nombre, tienda_id: prodData.tienda_id },
      defaults: {
        ...prodData,
        descripcion: `Producto ${prodData.nombre} de alta calidad.`,
        creado_por: users['admin@techstore.com'].id,
        estado: 'activo',
      },
    });
    console.log(`  ✓ ${prodData.nombre}`);
  }
  console.log(`✅ ${productsData.length} productos creados\n`);

  // ============================================
  // 5. CREAR AUDITORÍAS
  // ============================================
  console.log('📋 Creando auditorías...');
  const auditData = [
    {
      tienda_id: storeC.id,
      auditor_id: users['auditor.central@techstore.com'].id,
      fecha_auditoria: new Date('2026-05-05'),
      observaciones: 'Stock de laptops verificado. Encontramos discrepancias menores en cantidades.',
      estado: 'completada',
      productos_revisados: 8,
      incidencias: 2,
      calificacion: 'bueno',
      detalles_incidencias: [
        { producto: 'HP Pavilion 15', discrepancia: -2 },
        { producto: 'Magic Mouse', discrepancia: 1 },
      ],
    },
    {
      tienda_id: storeC.id,
      auditor_id: users['auditor.central@techstore.com'].id,
      fecha_auditoria: new Date('2026-05-06'),
      observaciones: 'Auditoría general de accesorios. Todo en orden.',
      estado: 'completada',
      productos_revisados: 5,
      incidencias: 0,
      calificacion: 'excelente',
    },
    {
      tienda_id: storeN.id,
      auditor_id: users['auditor.norte@techstore.com'].id,
      fecha_auditoria: new Date('2026-05-05'),
      observaciones: 'Revisión de inventario. Faltantes en monitores detectados.',
      estado: 'completada',
      productos_revisados: 6,
      incidencias: 1,
      calificacion: 'regular',
      detalles_incidencias: [
        { producto: 'BenQ EW2480', discrepancia: -3 },
      ],
    },
    {
      tienda_id: storeN.id,
      auditor_id: users['auditor.norte@techstore.com'].id,
      fecha_auditoria: new Date('2026-05-07'),
      observaciones: 'Auditoría en progreso de secciones de tablets y accesorios.',
      estado: 'en_progreso',
      productos_revisados: 3,
      incidencias: 0,
    },
    {
      tienda_id: storeC.id,
      auditor_id: users['auditor.central@techstore.com'].id,
      fecha_auditoria: new Date('2026-05-07'),
      observaciones: 'Auditoría pendiente de verificación de stock',
      estado: 'pendiente',
      productos_revisados: 0,
      incidencias: 0,
    },
  ];

  for (const audit of auditData) {
    await Audit.findOrCreate({
      where: {
        tienda_id: audit.tienda_id,
        auditor_id: audit.auditor_id,
        fecha_auditoria: audit.fecha_auditoria,
      },
      defaults: audit,
    });
  }
  console.log(`✅ ${auditData.length} auditorías creadas\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ SEEDER COMPLETADO EXITOSAMENTE\n');

  console.log('📊 CUENTAS DE USUARIO:\n');
  usersData.forEach((user, i) => {
    console.log(`${i + 1}. ${user.nombre_completo}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Contraseña: ${user.password}`);
    console.log(`   Rol: ${user.rol}\n`);
  });
}

seedData().catch(error => {
  console.error('❌ Error en seeder:', error);
  process.exit(1);
});
