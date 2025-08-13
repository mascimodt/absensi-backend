const mysql = require('mysql2');
const pool = mysql.createPool({
  host: 'localhost', user: 'root', password: '', database: 'absensi_properti',
  waitForConnections: true, connectionLimit: 10, queueLimit: 0
});
module.exports = pool;
