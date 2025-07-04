const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const User = require('../models/User');

require('dotenv').config();

const generateToken = (user) => {

return jwt.sign({ id: user.id, username: user.username }, process.env.APP_KEY, { expiresIn: '1h' });

};

exports.register = async (req, res) => {

const { username, password, email } = req.body;

const hashedPassword = await bcrypt.hash(password, 10);

try {

const user = await User.create({ username, password: hashedPassword, email });

res.json({ user, token: generateToken(user) });

} catch (error) {

res.status(400).json({ error: error.message });

}

};

exports.login = async (req, res) => {

const { username, password } = req.body;

try {

const user = await User.findOne({ where: { username } });

if (!user || !await bcrypt.compare(password, user.password)) {

return res.status(401).json({ error: 'Credenciais inválidas' });

}

res.json({ token: generateToken(user) });

} catch (error) {

res.status(500).json({ error: error.message });

}

};

exports.verifyToken = (req, res, next) => {

const token = req.headers['authorization'];

if (!token) {

return res.status(403).json({ error: 'token nao fornecido' });

}

jwt.verify(token, process.env.APP_KEY, (err, decoded) => {

if (err) {

return res.status(401).json({ error: 'falha na autenticação do token' });

}

req.userId = decoded.id;

next();

});

};