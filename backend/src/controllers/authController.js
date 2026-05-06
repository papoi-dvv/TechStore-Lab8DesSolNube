const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const { User, Role, UserRole } = require('../models');
const { validatePassword } = require('../utils/password');
const { signToken, verifyToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { email, password, nombre_completo, tienda_id } = req.body;

    if (!email || !password || !nombre_completo || !tienda_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.',
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashed,
      nombre_completo,
      tienda_id,
      mfa_habilitado: false,
      activo: true,
    });

    const employeeRole = await Role.findOne({ where: { nombre: 'Empleado' } });
    if (employeeRole) {
      await UserRole.create({
        usuario_id: user.id,
        rol_id: employeeRole.id,
        asignado_por: user.id,
      });
    }

    res.status(201).json({ message: 'Usuario registrado correctamente.', user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, activo: true } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    if (user.locked_until && user.locked_until > new Date()) {
      return res.status(423).json({ error: 'Cuenta bloqueada temporalmente por intentos fallidos.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      user.failed_login_attempts += 1;
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    user.failed_login_attempts = 0;
    user.locked_until = null;
    await user.save();

    if (user.mfa_habilitado && user.mfa_secret) {
      const token = signToken({ userId: user.id, mfa_step: true }, '5m');
      return res.json({ mfaRequired: true, mfaToken: token, message: 'Ingresa tu código MFA.' });
    }

    const roles = await getUserRoles(user.id);
    const token = signToken({ userId: user.id, roles, tienda_id: user.tienda_id }, '2h');
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre_completo: user.nombre_completo,
        tienda_id: user.tienda_id,
        roles,
        mfa_habilitado: user.mfa_habilitado,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function verifyMfa(req, res, next) {
  try {
    const { mfaToken, code } = req.body;
    if (!mfaToken || !code) {
      return res.status(400).json({ error: 'Token MFA y código son requeridos.' });
    }

    let payload;
    try {
      payload = verifyToken(mfaToken);
    } catch (err) {
      return res.status(401).json({ error: 'Token MFA inválido o expirado.' });
    }

    if (!payload.mfa_step || !payload.userId) {
      return res.status(401).json({ error: 'Token MFA inválido.' });
    }

    const user = await User.findByPk(payload.userId);
    if (!user || !user.mfa_habilitado || !user.mfa_secret) {
      return res.status(401).json({ error: 'Usuario no configurado para MFA.' });
    }

    const valid = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!valid) {
      user.mfa_failed_attempts += 1;
      if (user.mfa_failed_attempts >= 3) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return res.status(401).json({ error: 'Código MFA inválido.' });
    }

    user.mfa_failed_attempts = 0;
    await user.save();

    const roles = await getUserRoles(user.id);
    const token = signToken({ userId: user.id, roles, tienda_id: user.tienda_id }, '2h');
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre_completo: user.nombre_completo,
        tienda_id: user.tienda_id,
        roles,
        mfa_habilitado: user.mfa_habilitado,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function setupMfa(req, res, next) {
  try {
    const { userId } = req.user;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const secret = speakeasy.generateSecret({ name: process.env.TOTP_APP_NAME || 'TechStore' });
    user.mfa_secret = secret.base32;
    user.mfa_habilitado = true;
    await user.save();

    res.json({
      message: 'MFA configurado. Escanea el código en tu aplicación de autenticación.',
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserRoles(userId) {
  const roles = await Role.findAll({
    include: [{
      model: UserRole,
      where: { usuario_id: userId },
      attributes: [],
    }],
    attributes: ['nombre'],
  });
  return roles.map(role => role.nombre);
}

module.exports = {
  register,
  login,
  verifyMfa,
  setupMfa,
};
