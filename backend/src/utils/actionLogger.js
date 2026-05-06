const { ActionLog } = require('../models');

async function logAction(usuario_id, accion, recurso, detalles = {}) {
  try {
    await ActionLog.create({ usuario_id, accion, recurso, detalles });
  } catch (error) {
    console.error('Error al registrar acción:', error);
  }
}

module.exports = { logAction };
