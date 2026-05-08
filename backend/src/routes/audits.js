const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const auditController = require('../controllers/auditController');

// Todos los endpoints requieren autenticación
router.use(authenticate);

// GET todas las auditorías (Admin ve todas, Gerente/Auditor ven solo de su tienda)
router.get('/', auditController.getAudits);

// GET auditoría específica
router.get('/:id', auditController.getAudit);

// POST crear auditoría (Solo Auditor)
router.post('/', requireRole('Auditor'), auditController.createAudit);

// PUT actualizar auditoría (Solo el auditor que la creó o Admin)
router.put('/:id', auditController.updateAudit);

// DELETE eliminar auditoría (Solo Admin)
router.delete('/:id', requireRole('Administrador'), auditController.deleteAudit);

module.exports = router;
