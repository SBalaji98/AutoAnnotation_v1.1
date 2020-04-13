require("dotenv").config();

const password = parseInt(process.env.DB_PASSWORD);
module.exports = {
  development: {
    username: process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
    host: process.env.RDS_HOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: "Amazon RDS"
    },
    pool: { maxConnections: 5, maxIdleTime: 30 },
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
    username: process.env.RDS_USER,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE_PROD,
    host: process.env.RDS_HOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: "Amazon RDS"
    },
    pool: { maxConnections: 5, maxIdleTime: 30 },
    operatorsAliases: false
  }
};
