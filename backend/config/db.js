const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test di connessione all'avvio
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connesso al database MySQL:", process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error("Errore di connessione al database:", error.message);
    process.exit(1); // Blocca l'avvio se il DB non è raggiungibile
  }
})();

module.exports = pool;
