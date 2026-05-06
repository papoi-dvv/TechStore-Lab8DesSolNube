const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

router.use(authenticate);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
