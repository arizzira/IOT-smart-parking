const { Pool } = require('pg');

// Konfigurasi koneksi database PostgreSQL di Ubuntu
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smart_parking',
  password: '110904', // Sesuaikan dengan password postgres Ubuntu lu jika ada
  port: 5432,
});

module.exports = pool;