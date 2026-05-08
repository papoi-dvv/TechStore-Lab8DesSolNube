const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.get('/', authenticate, requireRole('Administrador'), userController.getUsers);
router.get('/:id', authenticate, requireRole('Administrador'), userController.getUser);
router.post('/', authenticate, requireRole('Administrador'), userController.createUser);
router.put('/:id', authenticate, requireRole('Administrador'), userController.updateUser);
router.patch('/:id/password', authenticate, requireRole('Administrador'), userController.updateUserPassword);
router.post('/:id/roles', authenticate, requireRole('Administrador'), userController.assignRole);
router.delete('/:id/roles/:roleId', authenticate, requireRole('Administrador'), userController.removeRole);
router.patch('/:id/unlock', authenticate, requireRole('Administrador'), userController.unlockUser);
router.patch('/:id/activate', authenticate, requireRole('Administrador'), userController.activateUser);
router.patch('/:id/deactivate', authenticate, requireRole('Administrador'), userController.deactivateUser);

module.exports = router;
