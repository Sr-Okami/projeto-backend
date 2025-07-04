const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rotas de acesso às categorias
router.get('/search', CategoryController.index);
router.get('/:id', CategoryController.show);

// Rotas protegidas por autenticação
router.post('/', authMiddleware, CategoryController.store);
router.put('/:id', authMiddleware, CategoryController.update);
router.delete('/:id', authMiddleware, CategoryController.delete);

module.exports = router;