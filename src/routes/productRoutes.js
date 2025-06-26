const express = require('express');
const ProductController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rotas de acesso aos produtos
router.get('/search', ProductController.index);
router.get('/:id', ProductController.show);

// Rotas protegidas por autenticação
router.post('/', authMiddleware, ProductController.store);
router.put('/:id', authMiddleware, ProductController.update);
router.delete('/:id', authMiddleware, ProductController.delete);

module.exports = router;