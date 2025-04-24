const express = require('express');
const pool = require("./config/db");
const path = require('path'); // Import the 'path' module
const cors = require("cors");
const open = require('open').default;
const router = express.Router();

const app = express();
const port = 4000;

const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const userRoutes = require("./routes/userRoutes");

app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
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
app.use('/api/ingredients', ingredientRoutes);
app.use("/api/users/", userRoutes);

// Route trang chủ
app.get('/', (req, res) => {
  res.render("welcome");
});

app.get("/homepage", (req, res) => {
  res.render("homepage", { title: "CookHub | Trang chủ" });
});

app.get("/recipes", (req, res) => {
  res.render("recipes", { title: "Danh sách công thức" });
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.get('/SignIn', (req, res) => {
  res.render("SignIn");
});

app.get('/SignUp', (req, res) => {
  res.render("SignUp");
});

app.get('/dashboard', (req, res) => {
  res.render("dashboard");
});


app.get('/search', (req, res) => {
  res.render('search', { title: 'Tìm kiếm Công thức' });
});

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  open(`http://localhost:${port}/`); // Tự động mở trình duyệt
});