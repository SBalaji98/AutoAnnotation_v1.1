require("dotenv").config();

module.exports = {
  development: {
    username: "postgres",
    password: process.env.DB_PASSWORD,
    database: "annodb",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  },
  test: {
    username: "postgres",
    password: process.env.DB_PASSWORD,
    database: "annodb",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  },
  production: {
    username: "postgres",
    password: process.env.DB_PASSWORD,
    database: "annodb",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  }
};
