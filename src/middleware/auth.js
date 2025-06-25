const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Acesso NEGADO. Nenhum token fornecido.' });
        }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
        return res.status(401).json({ error: 'Acesso NEGADO. Usuário não encontrado.' });
    }

    req.user = user;
    next();
    } catch (error) {
        res.status(401).json({ error: 'Acesso NEGADO. Token inválido.' });
    }
};

module.exports = authMiddleware;
console.log('Middleware de autenticação carregado.');