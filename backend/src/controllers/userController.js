const bcrypt = require('bcryptjs');
const { User, Role, UserRole, Store } = require('../models');
const { validatePassword } = require('../utils/password');

async function getUsers(req, res, next) {
  try {
    const users = await User.findAll({
      include: [
        { model: Store, attributes: ['id', 'nombre', 'ubicacion'] },
        {
          model: UserRole,
          include: [{ model: Role, attributes: ['id', 'nombre'] }],
        },
      ],
      attributes: { exclude: ['password', 'mfa_secret'] },
      order: [['id', 'ASC']],
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        { model: Store, attributes: ['id', 'nombre', 'ubicacion'] },
        {
          model: UserRole,
          include: [{ model: Role, attributes: ['id', 'nombre'] }],
        },
      ],
      attributes: { exclude: ['password', 'mfa_secret'] },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { email, password, nombre_completo, tienda_id, roles } = req.body;
    if (!email || !password || !nombre_completo || !tienda_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'La contraseña no cumple los requisitos de seguridad.' });
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

    if (Array.isArray(roles) && roles.length > 0) {
      for (const rolNombre of roles) {
        const role = await Role.findOne({ where: { nombre: rolNombre } });
        if (role) {
          await UserRole.create({
            usuario_id: user.id,
            rol_id: role.id,
            asignado_por: req.user.id,
          });
        }
      }
    }

    res.status(201).json({ message: 'Usuario creado correctamente.', user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
}

async function assignRole(req, res, next) {
  try {
    const { id } = req.params;
    const { rol_id } = req.body;
    if (!rol_id) {
      return res.status(400).json({ error: 'El rol_id es obligatorio.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const role = await Role.findByPk(rol_id);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado.' });
    }

    const existing = await UserRole.findOne({ where: { usuario_id: id, rol_id } });
    if (existing) {
      return res.status(409).json({ error: 'El usuario ya tiene asignado ese rol.' });
    }

    await UserRole.create({ usuario_id: id, rol_id, asignado_por: req.user.id });
    res.json({ message: 'Rol asignado correctamente.' });
  } catch (error) {
    next(error);
  }
}

async function removeRole(req, res, next) {
  try {
    const { id, roleId } = req.params;
    const assignment = await UserRole.findOne({ where: { usuario_id: id, rol_id: roleId } });
    if (!assignment) {
      return res.status(404).json({ error: 'Asignación de rol no encontrada.' });
    }
    await assignment.destroy();
    res.json({ message: 'Rol eliminado del usuario.' });
  } catch (error) {
    next(error);
  }
}

async function unlockUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    user.failed_login_attempts = 0;
    user.locked_until = null;
    await user.save();

    res.json({ message: 'Usuario desbloqueado correctamente.', user: { id: user.id, email: user.email, locked_until: user.locked_until, failed_login_attempts: user.failed_login_attempts } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  assignRole,
  removeRole,
  unlockUser,
};
