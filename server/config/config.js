require("dotenv").config();

const password = parseInt(process.env.DB_PASSWORD);
module.exports = {
  development: {
    username: "postgres",
    password: password,
    database: "annodb",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  },
  test: {
    username: "postgres",
    password: password,
    database: "annodb",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  },
  production: {
    username: "postgres",
    password: password,
    database: "annodb",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  }
};
