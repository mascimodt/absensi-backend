CREATE DATABASE IF NOT EXISTS absensi_properti;
USE absensi_properti;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) DEFAULT '',
  email VARCHAR(255) DEFAULT NULL,
  role ENUM('admin','member') DEFAULT 'member',
  status ENUM('pending','approved') DEFAULT 'pending'
);
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  check_in DATETIME DEFAULT NULL,
  check_out DATETIME DEFAULT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
