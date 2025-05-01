const express = require('express');
const client = require("./config/db");
const path = require('path'); // Import the 'path' module
const cors = require("cors");
const open = require('open').default;

const app = express();
const port = 4000; 
const recipeRoutes = require("./routes/recipeRoutesAdmin");
const userRoutes = require("./routes/userRoutesAdmin");
const reportRoutes = require("./routes/reportRoutesAdmin"); // Thêm reportRoutes

app.use(cors({
  origin: "http://127.0.0.1:5500"
}));



// Cấu hình để sử dụng EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "pages"));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/recipes", recipeRoutes); 
app.use("/api/users", userRoutes); 
app.use("/api/reports", reportRoutes); // Thêm route cho reports





// Route trang chủ
app.get("/", (req, res) => {
  res.send("Chào mừng bạn đến với CookHub")
});
app.get("/recipes", (req, res) => {
  res.render("recipes", { title: "Danh sách công thức" });
});
app.get("/admin-user", (req, res) => {
  res.render("admin-user", { title: "Danh sách users" });
});

app.get("/admin-recipe", (req, res) => {
  res.render("admin-recipe", { title: "Danh sách công thức" });
});

app.get("/admin-report", (req, res) => {
  res.render("admin-report", { title: "Danh sách báo cáo" }); // Thêm route render trang admin-report
});

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  open(`http://localhost:${port}/`); // Tự động mở trình duyệt
});
  
module.exports = app;