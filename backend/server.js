const express = require('express');
const client = require("./config/db");
const path = require('path'); // Import the 'path' module
const cors = require("cors");
const open = require('open').default;

const app = express();
const port = 4000; 
const recipeRoutes = require("./routes/recipeRoutes");
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const savedRecipesRoutes = require("./routes/savedRecipesRoutes");

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
app.use("/api/shopping-list", shoppingListRoutes);
app.use("/api/savedRecipes", savedRecipesRoutes);

// Route trang chủ
app.get("/", (req, res) => {
  res.send("Chào mừng bạn đến với CookHub")
});
app.get("/recipes", (req, res) => {
  res.render("recipes", { title: "Danh sách công thức" });
});
app.get("/savedRecipes", (req, res) => {
  res.render("savedRecipes", { title: "Saved Recipes" });
});

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  open(`http://localhost:${port}/`); // Tự động mở trình duyệt
});
  
module.exports = app;