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

const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes"); // Thêm reportRoutes

const dashboardRoutes = require('./routes/dashboardRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const userRoutes = require("./routes/userRoutes");
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const savedRecipesRoutes = require("./routes/savedRecipesRoutes");


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



app.use("/api/reports", reportRoutes); // Thêm route cho reports





app.use("/api/recipes", recipeRoutes);
app.use('/api/auth', authRoutes); // Route cho đăng nhập
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use("/api/users/", userRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/savedRecipes", savedRecipesRoutes);


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

app.get("/admin-user", (req, res) => {
  res.render("admin-user", { title: "Danh sách users" });
});

app.get("/admin-recipe", (req, res) => {
  res.render("admin-recipe", { title: "Danh sách công thức" });
});

app.get("/admin-report", (req, res) => {
  res.render("admin-report", { title: "Danh sách báo cáo" }); // Thêm route render trang admin-report
});

app.get("/savedRecipes", (req, res) => {
  res.render("savedRecipes", { title: "Saved Recipes" });
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

app.get('/about_us', (req, res) => {
  res.render('about_us');
});

app.get('/advertising', (req, res) => {
  res.render('Advertising');
});

app.get('/cookies', (req, res) => {
  res.render('cookies');
});

app.get('/help', (req, res) => {
  res.render('help');
});

app.get('/privacy_policy', (req, res) => {
  res.render('privacy_policy');
});

app.get('/terms', (req, res) => {
  res.render('terms_of_use');
});



// Khởi chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  open(`http://localhost:${port}/`); // Tự động mở trình duyệt
});