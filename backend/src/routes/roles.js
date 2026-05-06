const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const roleController = require('../controllers/roleController');

router.get('/', authenticate, roleController.getRoles);
router.post('/', authenticate, requireRole('Administrador'), roleController.createRole);
router.put('/:id', authenticate, requireRole('Administrador'), roleController.updateRole);
router.delete('/:id', authenticate, requireRole('Administrador'), roleController.deleteRole);

module.exports = router;
