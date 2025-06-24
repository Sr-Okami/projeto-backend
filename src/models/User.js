const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');
const { underscoredIf } = require('sequelize/lib/utils');

const User = sequelize.define('User', {

id: {

    type: DataTypes.INTEGER,

    primaryKey: true,

    autoIncrement: true,

    allowNull: false
},

username: {

    type: DataTypes.STRING,

    allowNull: false,

    unique: true

},

password: {

    type: DataTypes.STRING,

    allowNull: false

},

email: {

    type: DataTypes.STRING,

    allowNull: false,

    unique: true

}

}, {
    timestamps: true,
    underscored: true,
    tableName: 'users',

});

module.exports = User;