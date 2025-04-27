const express = require('express');
const pool = require("./config/db");
const path = require('path');
const cors = require("cors");

const router = express.Router();

const app = express();
const port = 4000;






const bmiRoutes = require('./routes/caculateBMI');
const rankRoutes= require('./routes/cookChart');
const detaiRecipeRoutes= require('./routes/detailRecipe');
const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const ingredientRoutes = require("./routes/ingredientRoutes");
const userRoutes = require("./routes/userRoutes");
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const savedRecipesRoutes = require("./routes/savedRecipesRoutes");

// Middleware
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
}));
app.use(express.json()); // 🔥 rất quan trọng để đọc JSON từ body
app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "pages"));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/recipes", recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use("/api/users/", userRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/savedRecipes", savedRecipesRoutes);
app.use("/bmi", bmiRoutes); // route truy cập vào các chức năng liên quan đến BMI
app.use("/cookchart",rankRoutes);  // route liên quan đến bảng xếp hạng
app.use("/detailrecipe",detaiRecipeRoutes); // route xem chi tiết công thức 


// Pages
app.get('/', (req, res) => res.render("welcome"));
app.get("/homepage", (req, res) => res.render("homepage", { title: "CookHub | Trang chủ" }));
app.get("/recipes", (req, res) => res.render("recipes", { title: "Danh sách công thức" }));
app.get("/savedRecipes", (req, res) => res.render("savedRecipes", { title: "Saved Recipes" }));
app.get("/profile", (req, res) => res.render("profile"));
app.get('/SignIn', (req, res) => res.render("SignIn"));
app.get('/SignUp', (req, res) => res.render("SignUp"));
app.get('/dashboard', (req, res) => res.render("dashboard"));
app.get('/search', (req, res) => res.render('search', { title: 'Tìm kiếm Công thức' }));
app.get('/about_us', (req, res) => res.render('about_us'));
app.get('/advertising', (req, res) => res.render('Advertising'));
app.get('/cookies', (req, res) => res.render('cookies'));
app.get('/help', (req, res) => res.render('help'));
app.get('/privacy_policy', (req, res) => res.render('privacy_policy'));
app.get('/terms', (req, res) => res.render('terms_of_use'));

// Khởi chạy server
async function startServer() {
  const open = (await import('open')).default;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    open(`http://localhost:${port}/`);
  });
}

startServer();
