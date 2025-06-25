const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = ProductImage;