const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const { method = 'GET', body, token } = options;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }
  return data;
}

function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

function verifyMfa(mfaToken, code) {
  return request('/auth/login/mfa', { method: 'POST', body: { mfaToken, code } });
}

function register(payload) {
  return request('/auth/register', { method: 'POST', body: payload });
}

function setupMfa(token) {
  return request('/auth/mfa/setup', { method: 'POST', token });
}

function getRoles(token) {
  return request('/roles', { token });
}

function getUsers(token) {
  return request('/users', { token });
}

function getProducts(token) {
  return request('/products', { token });
}

function createProduct(token, payload) {
  return request('/products', { method: 'POST', body: payload, token });
}

function updateProduct(token, id, payload) {
  return request(`/products/${id}`, { method: 'PUT', body: payload, token });
}

function deleteProduct(token, id) {
  return request(`/products/${id}`, { method: 'DELETE', token });
}

function createRole(token, payload) {
  return request('/roles', { method: 'POST', body: payload, token });
}

function createUser(token, payload) {
  return request('/users', { method: 'POST', body: payload, token });
}

function assignRole(token, userId, rol_id) {
  return request(`/users/${userId}/roles`, { method: 'POST', body: { rol_id }, token });
}

function removeRole(token, userId, roleId) {
  return request(`/users/${userId}/roles/${roleId}`, { method: 'DELETE', token });
}

function unlockUser(token, userId) {
  return request(`/users/${userId}/unlock`, { method: 'PATCH', token });
}

export {
  login,
  verifyMfa,
  register,
  setupMfa,
  getRoles,
  getUsers,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createRole,
  createUser,
  assignRole,
  removeRole,
  unlockUser,
};
