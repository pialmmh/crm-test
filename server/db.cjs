// File: server/db.cjs
const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crm',
});

module.exports = db;
