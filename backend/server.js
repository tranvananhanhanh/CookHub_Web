const express = require('express');
const client = require("./config/db");
const path = require('path'); // Import the 'path' module
const app = express();
const port = 4000;
const bmiRoutes = require('./routes/caculateBMI');
const viewRecipeRoutes=require('./routes/viewRecipe')

app.use("/bmi", bmiRoutes);
app.use("/home",viewRecipeRoutes)
// Khai báo thư mục chứa file tĩnh
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Phục vụ các file tĩnh từ thư mục frontend

app.get("/", (req, res) => {
    res.send("Hello, CookHub Web Backend is running!");
  });
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
module.exports = app;
