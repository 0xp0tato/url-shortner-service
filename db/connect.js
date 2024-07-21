const { Sequelize } = require("sequelize");

const postgresDB = process.env.POSTGRES_DB;
const postgresUser = process.env.POSTGRES_USER;
const postgresPassword = process.env.POSTGRES_PASSWORD;
const postgresHost = process.env.POSTGRES_HOST;
const postgresPort = process.env.POSTGRES_PORT;

const sequelize = new Sequelize(postgresDB, postgresUser, postgresPassword, {
  host: postgresHost,
  dialect: "postgres",
  port: postgresPort,
});

async function handleConnectToDB() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

module.exports = { handleConnectToDB, sequelize };
