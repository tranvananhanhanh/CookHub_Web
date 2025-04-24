// const { Client } = require("pg");
// require("dotenv").config(); // Load biến môi trường từ .env
// const client = new Client({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'cookhub',
//     password: '27122004',
//     port: 5432, // default port for PostgreSQL
// });
// client.connect()
//   .then(() => console.log("✅ Kết nối PostgreSQL thành công!"))
//   .catch(err => console.error("❌ Lỗi kết nối DB:", err));

// module.exports = client;

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Kiểm tra biến môi trường
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_PORT:", process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: String(process.env.DB_PASSWORD),
  port: parseInt(process.env.DB_PORT),
});

// Kiểm tra kết nối khi ứng dụng khởi động
pool.connect()
  .then(() => console.log("✅ Kết nối PostgreSQL thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối DB:", err));

module.exports = pool;