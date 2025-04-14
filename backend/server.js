const express = require('express');
const pool = require("./config/db");
const path = require('path'); // Import the 'path' module
const cors = require("cors");
const open = require('open').default;
const router = express.Router();
const authRoutes = require("./routes/authRoutes");
const app = express();
const port = 4000; 
const recipeRoutes = require("./routes/recipeRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use(cors({
  origin: "http://127.0.0.1:5500"
}));

// Cấu hình để sử dụng EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "pages"));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.urlencoded({ extended: true }));


// API routes
app.use("/api/recipes", recipeRoutes); 
app.use('/api/auth', authRoutes); // Route cho đăng nhập
app.use('/api/dashboard', dashboardRoutes);

// Route trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend','pages', 'welcome.html'));
});

app.get("/recipes", (req, res) => {
  res.render("recipes", { title: "Danh sách công thức" });
});

app.get('/SignIn', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'SignIn.html'));
});

app.get('/SignUp', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'SignUp.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'dashboard.html'));
});
// Khởi chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  open(`http://localhost:${port}/`); // Tự động mở trình duyệt
});

