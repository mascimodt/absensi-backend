const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const conn = pool.promise();
router.post('/register', async (req,res)=>{
  try{
    const {name,username,password,email}=req.body;
    if(!name||!username||!password) return res.status(400).json({error:'Lengkapi data'});
    const [existing]=await conn.query('SELECT id FROM users WHERE username=?',[username]);
    if(existing.length) return res.status(400).json({error:'Username sudah dipakai'});
    const hashed=await bcrypt.hash(password,10);
    await conn.query('INSERT INTO users (name,username,password,role,status,email) VALUES (?,?,?,?,?,?)',[name,username,hashed,'member','pending',email||null]);
    res.json({message:'Registrasi berhasil. Tunggu persetujuan admin.'});
  }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); }
});
router.post('/login', async (req,res)=>{
  try{
    const {username,password}=req.body; if(!username||!password) return res.status(400).json({error:'Lengkapi username/password'});
    const [rows]=await conn.query('SELECT id,name,username,password,role,status FROM users WHERE username=?',[username]);
    if(!rows.length) return res.status(401).json({error:'Username/password salah'});
    const user=rows[0]; if(user.status!=='approved') return res.status(403).json({error:'Akun belum disetujui admin'});
    const valid=await bcrypt.compare(password,user.password); if(!valid) return res.status(401).json({error:'Username/password salah'});
    res.json({role:user.role, user:{id:user.id, username:user.username, name:user.name}});
  }catch(e){ console.error(e); res.status(500).json({error:'Server error'}); }
});
module.exports=router;
