const { Product, User } = require('../models');
const { canReadProduct, canCreateProduct, canUpdateProduct, canDeleteProduct } = require('../utils/abac');
const { logAction } = require('../utils/actionLogger');

async function listProducts(req, res, next) {
  try {
    const allProducts = await Product.findAll({ order: [['id', 'ASC']] });
    const filtered = allProducts.filter(product => canReadProduct(req.user, product));
    await logAction(req.user.id, 'READ', 'Product.list', { count: filtered.length });
    res.json({ products: filtered });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    if (!canReadProduct(req.user, product)) {
      return res.status(403).json({ error: 'No tienes permiso para ver este producto.' });
    }
    await logAction(req.user.id, 'READ', 'Product.get', { productId: product.id });
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const payload = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      stock: req.body.stock,
      categoria: req.body.categoria,
      tienda_id: req.body.tienda_id,
      es_premium: req.body.es_premium || false,
      creado_por: req.user.id,
    };

    if (!payload.nombre || payload.precio == null || payload.stock == null || !payload.tienda_id) {
      return res.status(400).json({ error: 'Los campos nombre, precio, stock y tienda_id son obligatorios.' });
    }

    if (!canCreateProduct(req.user, payload)) {
      return res.status(403).json({ error: 'No tienes permiso para crear este producto.' });
    }

    const product = await Product.create(payload);
    await logAction(req.user.id, 'CREATE', 'Product.create', { productId: product.id });
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const updates = { ...req.body };
    if (!canUpdateProduct(req.user, product, updates)) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar este producto.' });
    }

    const userRoles = req.user.roles || [];
    const changedFields = [];
    
    // Admin puede actualizar todos los campos
    if (userRoles.includes('Administrador')) {
      const allowedFields = ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'es_premium', 'tienda_id', 'estado', 'imagen_url'];
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          product[field] = updates[field];
          changedFields.push(field);
        }
      });
    } else {
      // Gerente y Empleado tienen restricciones
      ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'es_premium', 'tienda_id', 'estado', 'imagen_url'].forEach(field => {
        if (updates[field] !== undefined) {
          product[field] = updates[field];
          changedFields.push(field);
        }
      });
    }

    if (changedFields.length === 0) {
      return res.status(400).json({ error: 'No se encontraron campos válidos para actualizar.' });
    }

    await product.save();
    await logAction(req.user.id, 'UPDATE', 'Product.update', { productId: product.id, fields: changedFields });
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    if (!canDeleteProduct(req.user, product)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto.' });
    }
    await product.destroy();
    await logAction(req.user.id, 'DELETE', 'Product.delete', { productId: product.id });
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
