const express = require('express');
const pool = require("./config/db");
const path = require('path');
const cors = require("cors");

const router = express.Router();

const app = express();

const port = 4000;

const rankRoutes = require('./routes/cookChart');
const detaiRecipeRoutes = require('./routes/detailRecipe');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const userRoutes = require('./routes/userRoutes');
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const savedRecipesRoutes = require('./routes/savedRecipesRoutes');
const unitRoutes = require('./routes/unitRoutes');
const createRoutes = require('./routes/createRoutes');
const reportRoutes = require('./routes/reportRoutes');
const recipeRoutesAdmin = require('./routes/recipeAdminRoutes');
const userRoutesAdmin = require('./routes/userAdminRoutes');
const reportRoutesAdmin = require('./routes/reportAdminRoutes'); // Thêm reportRoutes
const routes = require('./routes/routes');

process.env.TZ = 'UTC';

app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "pages"));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.urlencoded({ extended: true }));

// Route trang chủ
app.get('/', (req, res) => {
  res.render("welcome");
});

app.get("/homepage", (req, res) => {
  res.render("homepage");
});

app.get("/savedRecipes", (req, res) => {
  res.render("savedRecipes");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/SignIn", (req, res) => {
  res.render("SignIn");
});

app.get("/SignUp", (req, res) => {
  res.render("SignUp");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/search", (req, res) => {
  res.render("search");
});

app.get("/about_us", (req, res) => {
  res.render("about_us");
});

app.get("/advertising", (req, res) => {
  res.render("Advertising");
});

app.get("/cookies", (req, res) => {
  res.render("cookies");
});

app.get("/help", (req, res) => {
  res.render("help");
});

app.get("/privacy_policy", (req, res) => {
  res.render("privacy_policy");
});

app.get("/terms", (req, res) => {
  res.render("terms_of_use");
});

app.get("/bmi", (req, res) => {
  res.render("inputBMI");
});

app.get("/bmi/result", (req, res) => {
  res.render("bmi");
});

app.get("/bmi/heathyfood", (req, res) => {
  res.render("recipeBMI");
});

app.get("/recipes", (req, res) => {
  res.render("recipes")
});

app.get("/detailrecipe-page", (req, res) => {
  res.render("detailRecipe");
});

app.get("/top-recipes-page", (req, res) => {
  res.render("recipeChart");
});

app.get("/top-chefs-page", (req, res) => {
  res.render("chefChart");
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

app.get('/admin-dashboard', (req, res) => {
    res.render('admin-dashboard');
});

// API routes
app.use("/api/recipes", recipeRoutes);
app.use("/api/auth", authRoutes); // Route cho đăng nhập
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/users/", userRoutes);
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/savedRecipes", savedRecipesRoutes);
app.use("/api/create", createRoutes); // Xử lý POST /api/create/recipes
app.use("/api/users", userRoutes);
app.use("/api/units", unitRoutes); // Routes đơn vị
app.use("/cookchart", rankRoutes);  // route liên quan đến bảng xếp hạng
app.use("/detailrecipe", detaiRecipeRoutes); // route xem chi tiết công thức 
app.use('/reports', reportRoutes); 
app.use("/api/recipesAdmin", recipeRoutesAdmin); 
app.use("/api/usersAdmin", userRoutesAdmin); 
app.use("/api/reportsAdmin", reportRoutesAdmin); // Thêm route cho reports
app.use('/api', routes);
// Khởi chạy server
async function startServer() {
  const open = (await import('open')).default;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    open(`http://localhost:${port}/`);
  });
}

startServer();