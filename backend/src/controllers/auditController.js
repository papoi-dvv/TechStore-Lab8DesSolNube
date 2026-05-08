const { Audit, Store, User } = require('../models');
const { logAction } = require('../utils/actionLogger');
const { Op } = require('sequelize');

async function getAudits(req, res, next) {
  try {
    const { tienda_id, fecha_inicio, fecha_fin, estado } = req.query;
    const userRoles = req.user.roles || [];

    const where = {};
    if (userRoles.includes('Auditor') || userRoles.includes('Gerente')) {
      where.tienda_id = req.user.tienda_id;
    } else if (tienda_id) {
      where.tienda_id = tienda_id;
    }

    if (estado) {
      where.estado = estado;
    }

    if (fecha_inicio || fecha_fin) {
      where.fecha_auditoria = {};
      if (fecha_inicio) {
        where.fecha_auditoria[Op.gte] = new Date(fecha_inicio);
      }
      if (fecha_fin) {
        const endDate = new Date(fecha_fin);
        endDate.setHours(23, 59, 59, 999);
        where.fecha_auditoria[Op.lte] = endDate;
      }
    }

    const query = {
      include: [
        { model: Store, attributes: ['id', 'nombre', 'ubicacion'] },
        { model: User, as: 'auditor', attributes: ['id', 'nombre_completo', 'email'] },
      ],
      order: [['fecha_auditoria', 'DESC']],
    };

    if (Object.keys(where).length > 0) {
      query.where = where;
    }

    const audits = await Audit.findAll(query);
    await logAction(req.user.id, 'READ', 'Audit.list', { count: audits.length });
    res.json({ audits });
  } catch (error) {
    next(error);
  }
}

async function getAudit(req, res, next) {
  try {
    const { id } = req.params;
    const audit = await Audit.findByPk(id, {
      include: [
        { model: Store, attributes: ['id', 'nombre', 'ubicacion'] },
        { model: User, as: 'auditor', attributes: ['id', 'nombre_completo', 'email'] },
      ],
    });

    if (!audit) {
      return res.status(404).json({ error: 'Auditoría no encontrada.' });
    }

    // Auditor y Gerente solo ven auditorías de su tienda
    const userRoles = req.user.roles || [];
    if ((userRoles.includes('Auditor') || userRoles.includes('Gerente')) && 
        audit.tienda_id !== req.user.tienda_id) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta auditoría.' });
    }

    await logAction(req.user.id, 'READ', 'Audit.get', { auditId: audit.id });
    res.json({ audit });
  } catch (error) {
    next(error);
  }
}

async function createAudit(req, res, next) {
  try {
    const { tienda_id, observaciones, productos_revisados, incidencias, detalles_incidencias } = req.body;
    const userRoles = req.user.roles || [];

    if (!tienda_id || productos_revisados === undefined) {
      return res.status(400).json({ error: 'tienda_id y productos_revisados son obligatorios.' });
    }

    // Solo Auditor puede crear auditorías, y solo de su propia tienda
    if (!userRoles.includes('Auditor')) {
      return res.status(403).json({ error: 'Solo el Auditor puede crear auditorías.' });
    }

    if (tienda_id !== req.user.tienda_id) {
      return res.status(403).json({ error: 'Solo puedes crear auditorías en tu tienda asignada.' });
    }

    const audit = await Audit.create({
      tienda_id,
      auditor_id: req.user.id,
      observaciones,
      productos_revisados,
      incidencias: incidencias || 0,
      detalles_incidencias,
      estado: 'en_progreso',
    });

    await logAction(req.user.id, 'CREATE', 'Audit.create', { auditId: audit.id });
    res.status(201).json({ audit });
  } catch (error) {
    next(error);
  }
}

async function updateAudit(req, res, next) {
  try {
    const { id } = req.params;
    const { observaciones, estado, incidencias, calificacion, detalles_incidencias, productos_revisados } = req.body;

    const audit = await Audit.findByPk(id);
    if (!audit) {
      return res.status(404).json({ error: 'Auditoría no encontrada.' });
    }

    const userRoles = req.user.roles || [];

    // Solo el auditor que creó la auditoría o Admin puede actualizarla
    if (!userRoles.includes('Administrador')) {
      if (audit.auditor_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para actualizar esta auditoría.' });
      }
    }

    if (observaciones !== undefined) audit.observaciones = observaciones;
    if (estado !== undefined) audit.estado = estado;
    if (incidencias !== undefined) audit.incidencias = incidencias;
    if (calificacion !== undefined) audit.calificacion = calificacion;
    if (detalles_incidencias !== undefined) audit.detalles_incidencias = detalles_incidencias;
    if (productos_revisados !== undefined) audit.productos_revisados = productos_revisados;

    await audit.save();
    await logAction(req.user.id, 'UPDATE', 'Audit.update', { auditId: audit.id });
    res.json({ audit });
  } catch (error) {
    next(error);
  }
}

async function deleteAudit(req, res, next) {
  try {
    const { id } = req.params;
    const audit = await Audit.findByPk(id);

    if (!audit) {
      return res.status(404).json({ error: 'Auditoría no encontrada.' });
    }

    const userRoles = req.user.roles || [];

    // Solo Admin puede eliminar auditorías
    if (!userRoles.includes('Administrador')) {
      return res.status(403).json({ error: 'Solo el Administrador puede eliminar auditorías.' });
    }

    await audit.destroy();
    await logAction(req.user.id, 'DELETE', 'Audit.delete', { auditId: audit.id });
    res.json({ message: 'Auditoría eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAudits,
  getAudit,
  createAudit,
  updateAudit,
  deleteAudit,
};
