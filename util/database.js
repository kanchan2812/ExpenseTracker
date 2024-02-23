const dotenv = require('dotenv');
const config = dotenv.config();

const {Sequelize} = require('sequelize');
const sequelize = new Sequelize (
    `${process.env.DATABASE_DEFAULT}`,
    `${process.env.DATABASE_USER}`,
    `${process.env.DATABASE_PASSWORD}`,
    {
        host: `${process.env.DATABASE_HOST}`,
        dialect: 'mysql'
    }
);

module.exports = sequelize;

