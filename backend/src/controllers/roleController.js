const { Role, User } = require('../models');

async function getRoles(req, res, next) {
  try {
    const roles = await Role.findAll({
      include: [{ model: User, attributes: ['id'] }],
      order: [['id', 'ASC']],
    });

    const enhancedRoles = roles.map(role => {
      const roleData = role.toJSON();
      return {
        ...roleData,
        userCount: (roleData.Users || []).length,
      };
    });

    res.json({ roles: enhancedRoles });
  } catch (error) {
    next(error);
  }
}

async function createRole(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del rol es obligatorio.' });
    }

    const [role, created] = await Role.findOrCreate({
      where: { nombre },
      defaults: { descripcion },
    });

    if (!created) {
      return res.status(409).json({ error: 'El rol ya existe.' });
    }

    res.status(201).json({ role });
  } catch (error) {
    next(error);
  }
}

async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado.' });
    }

    if (nombre) {
      role.nombre = nombre;
    }
    if (descripcion !== undefined) {
      role.descripcion = descripcion;
    }
    await role.save();
    res.json({ role });
  } catch (error) {
    next(error);
  }
}

async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado.' });
    }

    const assignment = await UserRole.findOne({ where: { rol_id: id } });
    if (assignment) {
      return res.status(400).json({ error: 'No se puede eliminar un rol con usuarios asignados.' });
    }

    await role.destroy();
    res.json({ message: 'Rol eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};
