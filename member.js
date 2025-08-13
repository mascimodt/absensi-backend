const express = require('express');
const router = express.Router();
const pool = require('../db');
const conn = pool.promise();
router.post('/checkin', async (req,res)=>{
  try{
    const {username}=req.body; if(!username) return res.status(400).json({error:'username dibutuhkan'});
    const [users]=await conn.query('SELECT id,name,status FROM users WHERE username=?',[username]); if(!users.length) return res.status(404).json({error:'User tidak ditemukan'});
    const user=users[0]; if(user.status!=='approved') return res.status(403).json({error:'User belum disetujui'});
    const date = new Date().toISOString().split('T')[0];
    const [existing]=await conn.query('SELECT * FROM attendance WHERE user_id=? AND date=? AND check_out IS NULL',[user.id,date]); if(existing.length) return res.status(400).json({error:'Sudah check-in hari ini'});
    const now = new Date(); const hour = now.getHours(); const status = hour>8 ? 'Terlambat' : 'Hadir'; const checkIn = now.toISOString().slice(0,19).replace('T',' ');
    await conn.query('INSERT INTO attendance (user_id,status,check_in,date) VALUES (?,?,?,?)',[user.id,status,checkIn,date]);
    res.json({message:'Check-in berhasil', status});
  }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); }
});
router.post('/checkout', async (req,res)=>{
  try{
    const {username}=req.body; if(!username) return res.status(400).json({error:'username dibutuhkan'});
    const [users]=await conn.query('SELECT id FROM users WHERE username=?',[username]); if(!users.length) return res.status(404).json({error:'User tidak ditemukan'});
    const user=users[0]; const date=new Date().toISOString().split('T')[0]; const [rows]=await conn.query('SELECT * FROM attendance WHERE user_id=? AND date=? AND check_out IS NULL',[user.id,date]); if(!rows.length) return res.status(400).json({error:'Belum check-in hari ini atau sudah check-out'});
    const checkOut=new Date().toISOString().slice(0,19).replace('T',' '); await conn.query('UPDATE attendance SET check_out=? WHERE id=?',[checkOut,rows[0].id]); res.json({message:'Check-out berhasil'});
  }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); }
});
router.get('/history/:username', async (req,res)=>{
  try{ const username=req.params.username; const [users]=await conn.query('SELECT id FROM users WHERE username=?',[username]); if(!users.length) return res.status(404).json({error:'User tidak ditemukan'}); const user=users[0]; const [rows]=await conn.query('SELECT * FROM attendance WHERE user_id=? ORDER BY date DESC',[user.id]); res.json(rows); }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); }
});
module.exports = router;
