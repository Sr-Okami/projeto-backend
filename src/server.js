const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

// Inicia o servidor e conecta ao banco de dados
async function startServer() {
    try {
        // Conecta ao banco de dados
        await sequelize.authenticate();
        console.log('Banco de dados conectado com sucesso.');

        // Sincroniza os modelos com o banco de dados
        await sequelize.sync();
        console.log('Tabelas sincronizadas com sucesso.');

        // Inicia o servidor
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } 
    // Mostra erro de conexão com o banco de dados
    catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    }
}

startServer();