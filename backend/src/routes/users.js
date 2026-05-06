const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.get('/', authenticate, requireRole('Administrador'), userController.getUsers);
router.get('/:id', authenticate, requireRole('Administrador'), userController.getUser);
router.post('/', authenticate, requireRole('Administrador'), userController.createUser);
router.post('/:id/roles', authenticate, requireRole('Administrador'), userController.assignRole);
router.delete('/:id/roles/:roleId', authenticate, requireRole('Administrador'), userController.removeRole);
router.patch('/:id/unlock', authenticate, requireRole('Administrador'), userController.unlockUser);

module.exports = router;
