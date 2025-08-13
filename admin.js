const express = require('express');
const router = express.Router();
const pool = require('../db');
const XLSX = require('xlsx');
const conn = pool.promise();
router.get('/pending-users', async (req,res)=>{
  try{ const [rows]=await conn.query("SELECT id,name,username,email FROM users WHERE status='pending'"); res.json(rows); }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); }
});
router.put('/approve-user/:id', async (req,res)=>{ try{ const id=req.params.id; await conn.query('UPDATE users SET status=? WHERE id=?',['approved',id]); res.json({message:'User disetujui'}); }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); } });
router.get('/attendance', async (req,res)=>{ try{ let {name,from,to}=req.query; let query=`SELECT a.id,a.user_id,u.name AS username_name,u.username,a.status,a.check_in,a.check_out,a.date FROM attendance a JOIN users u ON a.user_id=u.id WHERE 1=1`; const params=[]; if(name){ query += ' AND (u.name LIKE ? OR u.username LIKE ?)'; params.push(`%${name}%`,`%${name}%`); } if(from){ query += ' AND a.date >= ?'; params.push(from); } if(to){ query += ' AND a.date <= ?'; params.push(to); } query += ' ORDER BY a.date DESC,a.check_in DESC'; const [rows]=await conn.query(query, params); res.json(rows); }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); } });
router.get('/export', async (req,res)=>{ try{ const {username}=req.query; let query=`SELECT u.name as name,u.username as username,a.status,a.check_in,a.check_out,a.date FROM attendance a JOIN users u ON a.user_id=u.id`; const params=[]; if(username){ query += ' WHERE u.username = ?'; params.push(username); } const [rows]=await conn.query(query, params); const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Absensi'); const buf = XLSX.write(wb, {bookType:'xlsx', type:'buffer'}); const filename = username ? `absensi_${username}.xlsx` : 'absensi_all.xlsx'; res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); res.send(buf); }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); } });
module.exports = router;
