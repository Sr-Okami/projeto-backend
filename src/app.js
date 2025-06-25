const express = require('express');
require('dotenv').config();

//importando as rotas
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Configurando o middleware para analisar JSON
app.use(express.json());

// Rotas
app.use('/v1/users', userRoutes);
app.use('/v1/category', categoryRoutes);

//Rota para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor está funcionando!!');
});

module.exports = app;