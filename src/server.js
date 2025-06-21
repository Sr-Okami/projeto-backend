const express = require('express');

const sequelize = require('./src/config/database');

const userRoutes = require('./src/routes/userRoutes');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/users', userRoutes);

sequelize.sync().then(() => {

app.listen(PORT, () => {

console.log(`Server is running on port ${PORT}`);

});

}).catch((error) => {

console.error('Unable to connect to the database:', error);

});