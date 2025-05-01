const express = require('express');
const client = require("./config/db");
const path = require('path'); // Import the 'path' module
const cors = require("cors");
const open = require('open').default;

const app = express();
const port = 4000; 
const recipeRoutesAdmin = require("./routes/recipeAdminRoutes");
const userRoutesAdmin = require("./routes/userAdminRoutes");
const reportRoutesAdmin = require("./routes/reportAdminRoutes"); // Thêm reportRoutes

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
app.use("/api/recipesAdmin", recipeRoutesAdmin); 
app.use("/api/usersAdmin", userRoutesAdmin); 
app.use("/api/reportsAdmin", reportRoutesAdmin); // Thêm route cho reports





// Route trang chủ

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