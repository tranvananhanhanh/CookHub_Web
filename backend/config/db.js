const { Client } = require("pg");
require("dotenv").config(); // Load biến môi trường từ .env
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',  // Đúng tên database đã tạo
  password: 'Sohyun280697.',
  port: 5432
});
client.connect()
  .then(() => console.log("✅ Kết nối PostgreSQL thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối DB:", err));

module.exports = client;
