function hasRole(user, roleName) {
  return Array.isArray(user.roles) && user.roles.includes(roleName);
}

function canReadProduct(user, product) {
  if (hasRole(user, 'Administrador') || hasRole(user, 'Auditor')) {
    return true;
  }
  if (hasRole(user, 'Gerente') || hasRole(user, 'Empleado')) {
    return product.tienda_id === user.tienda_id;
  }
  return false;
}

function canCreateProduct(user, product) {
  if (hasRole(user, 'Administrador')) {
    return true;
  }
  if (hasRole(user, 'Gerente')) {
    return product.tienda_id === user.tienda_id;
  }
  if (hasRole(user, 'Empleado')) {
    return product.tienda_id === user.tienda_id && !product.es_premium;
  }
  return false;
}

function canUpdateProduct(user, existingProduct, updates) {
  if (hasRole(user, 'Administrador')) {
    return true;
  }
  if (hasRole(user, 'Gerente')) {
    if (existingProduct.tienda_id !== user.tienda_id) {
      return false;
    }
    if ('categoria' in updates && updates.categoria !== existingProduct.categoria) {
      return false;
    }
    return true;
  }
  if (hasRole(user, 'Empleado')) {
    return existingProduct.tienda_id === user.tienda_id && Object.keys(updates).every(key => key === 'stock');
  }
  return false;
}

function canDeleteProduct(user, product) {
  if (hasRole(user, 'Administrador')) {
    return true;
  }
  if (hasRole(user, 'Gerente')) {
    return product.tienda_id === user.tienda_id && !product.es_premium;
  }
  return false;
}

module.exports = {
  hasRole,
  canReadProduct,
  canCreateProduct,
  canUpdateProduct,
  canDeleteProduct,
};
