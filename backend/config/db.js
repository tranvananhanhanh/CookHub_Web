const { Client } = require("pg");
require("dotenv").config(); // Load biến môi trường từ .env
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'new_lib',
    password: '0000',
    port: 5432, // default port for PostgreSQL

});
client.connect()
  .then(() => console.log("✅ Kết nối PostgreSQL thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối DB:", err));

module.exports = client;
