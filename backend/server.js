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
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const savedRecipesRoutes = require("./routes/savedRecipesRoutes");
const unitRoutes = require("./routes/unitRoutes");
const createRoutes = require("./routes/createRoutes"); 

process.env.TZ = 'UTC';

app.use(cors());

// Cấu hình để sử dụng EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "pages"));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.urlencoded({ extended: true }));

// Khai báo thư mục chứa file tĩnh
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Phục vụ các file tĩnh từ thư mục frontend

// API routes
app.use("/api/recipes", recipeRoutes);
app.use("/api/auth", authRoutes); // Route cho đăng nhập
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/users/", userRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/savedRecipes", savedRecipesRoutes);
app.use("/api", createRoutes); // Xử lý POST /api/recipes
app.use("/api/recipes", recipeRoutes); // Xử lý GET /api/recipes
app.use("/api/users", userRoutes);
app.use("/api/units", unitRoutes); // Routes đơn vị

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

app.get("/savedRecipes", (req, res) => {
  res.render("savedRecipes", { title: "Saved Recipes" });
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.get("/create", (req, res) => {
  res.render("create");
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

app.get('/bmi', (req, res) => {
  res.render('inputBMI');
});

app.get("/bmi/result", (req, res) => {
  res.render('bmi');
});

app.get("/bmi/heathyfood", (req, res) => {
  res.render('recipeBMI');
});

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  open(`http://localhost:${port}/`); // Tự động mở trình duyệt
});