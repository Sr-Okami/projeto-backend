const express = require('express');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

// Rotas de acesso ao usuário
router.post('/token', UserController.generateToken);
router.post('/', UserController.store);
router.get('/:id', UserController.show);

//Rotas protegidas por autenticação
router.put('/:id', authMiddleware, UserController.update);
router.delete('/:id', authMiddleware, UserController.delete);

module.exports = router;