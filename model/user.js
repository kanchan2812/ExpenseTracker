const sequelize = require('../util/database');
const {DataTypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();

const User = sequelize.define('User', {
    id: {
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        validate: {
            isEmail:true
        },
        primaryKey:true
    },
    firstName: {
        type:DataTypes. STRING,
        allowNull:false
    },
    lastName: {
        type:DataTypes.STRING,
        allowNull:false
    },
    email: {
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            isEmail:true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull:false
    },
    isPremiumUser: {
        type:DataTypes.BOOLEAN,
        defaultValue:false,
        allowNull:false
    },
    totalExpense: {
        type:DataTypes.INTEGER,
        defaultValue:0,
        allowNull:true
    }
});

module.exports = User;