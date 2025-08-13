const pool = require('./db');
const bcrypt = require('bcrypt');
(async()=>{
  try {
    const conn = pool.promise();
    const username='admin', password='admin123', name='Administrator';
    const hashed = await bcrypt.hash(password,10);
    const [rows] = await conn.query('SELECT id FROM users WHERE username = ?', [username]);
    if(rows.length){ console.log('Admin exists'); process.exit(0); }
    await conn.query('INSERT INTO users (name, username, password, role, status) VALUES (?,?,?,?,?)', [name,username,hashed,'admin','approved']);
    console.log('Admin created'); process.exit(0);
  } catch(e){ console.error(e); process.exit(1); }
})();
