const express = require('express');
const client = require("./config/db");
const session = require('express-session');
const path = require('path'); // Import the 'path' module
const cors = require("cors");
const open = require('open').default;

const app = express();
const port = 4000; 
const recipeRoutes = require("./routes/recipeRoutes");
const ingredientRoutes = require('./routes/ingredientRoutes'); 
const userRoutes = require("./routes/userRoutes");
const savedRecipesRoutes = require("./routes/savedRecipesRoutes");

app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

// Cấu hình để sử dụng EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "pages"));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: '123456', // Thay bằng một chuỗi bí mật thực tế
  resave: false,
  saveUninitialized: false, // true nếu muốn tạo session ngay cả khi chưa login, false nếu chỉ tạo khi login
  cookie: {
      secure: false, // Đặt là true nếu dùng HTTPS
      httpOnly: true, // Ngăn JS truy cập cookie phía client
      maxAge: 24 * 60 * 60 * 1000 // Thời gian tồn tại cookie (vd: 1 ngày)
  }
}));

// <<< KIỂM TRA MIDDLEWARE USER >>>
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.currentUser = req.session.user; // user object phải có id
    res.locals.isLoggedIn = true;
  } else {
    res.locals.currentUser = null;
    res.locals.isLoggedIn = false;
  }
  next();
});

// API routes
app.use("/api/recipes", recipeRoutes); 
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/users', userRoutes);
app.use("/api/saved-recipes", savedRecipesRoutes);
// Route trang chủ
app.get("/", (req, res) => {
  res.send("Chào mừng bạn đến với CookHub")
});
app.get("/homepage", (req, res) => {
  // let user = null;
  // let isLoggedIn = false;

  // // Kiểm tra xem session user có tồn tại không (được đặt khi login thành công)
  // if (req.session && req.session.user) {
  //     user = req.session.user; // Lấy thông tin user từ session
  //     isLoggedIn = true;
  //     console.log("User is logged in:", user); // Log để kiểm tra
  // } else {
  //     console.log("User is not logged in."); // Log để kiểm tra
  // }

  res.render("homepage", {
      title: "CookHub - Homepage",
      isLoggedIn: res.locals.isLoggedIn,
      currentUser: res.locals.currentUser
  });
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