const { Pool } = require("pg"); // Đảm bảo bạn import đúng Pool từ pg
require("dotenv").config(); // Load biến môi trường từ .env

// Khai báo pool (chú ý viết hoa chữ P trong `Pool`)
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cookhub',
    password: 'CR2809ie:)',
    port: 5432, // default port for PostgreSQL
});

pool.connect()
  .then(() => console.log("✅ Kết nối PostgreSQL thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối DB:", err));

module.exports = pool;