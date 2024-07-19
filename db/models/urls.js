const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

const Urls = sequelize.define("Urls", {
  originalUrl: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  shortUrl: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});

Urls.sync();

module.exports = { Urls };
