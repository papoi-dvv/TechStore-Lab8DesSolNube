const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const roleRoutes = require('./roles');
const userRoutes = require('./users');
const productRoutes = require('./products');
const auditRoutes = require('./audits');
const storeRoutes = require('./stores');

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/audits', auditRoutes);
router.use('/stores', storeRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'TechStore API is running.' });
});

module.exports = router;
