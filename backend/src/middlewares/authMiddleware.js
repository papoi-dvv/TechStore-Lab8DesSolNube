const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.userId,
      roles: payload.roles || [],
      tienda_id: payload.tienda_id,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = (req.user && req.user.roles) || [];
    const permitted = userRoles.some(role => allowedRoles.includes(role));
    if (!permitted) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso.' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
