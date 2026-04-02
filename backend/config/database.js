const mysql = require('mysql2/promise');
const config = require('../config/config');

const pool = mysql.createPool(config.db);

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

module.exports = { pool, testConnection };