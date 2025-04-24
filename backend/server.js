const express = require('express');
const client = require("./config/db");
const path = require('path'); 
const cors = require("cors");
const open = require('open').default;

const app = express();
const port = 4000; 
const recipeRoutes = require("./routes/recipeRoutes");
const userRoutes = require("./routes/userRoutes");
const unitRoutes = require("./routes/unitRoutes");
const createRoutes = require("./routes/createRoutes"); 

process.env.TZ = 'UTC';

app.use(cors());

// Cấu hình để sử dụng EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "pages"));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/recipes", createRoutes); // Xử lý POST /api/recipes
app.use("/api/recipes", recipeRoutes); // Xử lý GET /api/recipes
app.use("/api/users", userRoutes);
app.use("/api/units", unitRoutes); // Routes đơn vị

// Route trang chủ
app.get("/", (req, res) => {
  res.send("Chào mừng bạn đến với CookHub")
});
app.get("/profile", (req, res) => {
  res.render("profile");
});
app.get("/create", (req, res) => {
  res.render("create");
});

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  open(`http://localhost:${port}/`); // Tự động mở trình duyệt
});
  
module.exports = app;