const { DataTypes } = require("sequelize");
const { sequelize } = require("../connect");

const Urls = sequelize.define("urls", {
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
