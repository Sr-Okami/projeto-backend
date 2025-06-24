const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Server está funcionando!!');
});

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        

    });
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});