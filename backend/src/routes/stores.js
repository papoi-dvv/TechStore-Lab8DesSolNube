const express = require('express');
const router = express.Router();
const { Store } = require('../models');
const { authenticate } = require('../middlewares/authMiddleware');

// GET /api/stores - lista de tiendas (requiere autenticación)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const stores = await Store.findAll({ attributes: ['id', 'nombre', 'ubicacion'] });
    res.json({ stores });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
