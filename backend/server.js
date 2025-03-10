const express = require('express');
const client = require("./config/db");
const path = require('path'); // Import the 'path' module
const app = express();
const port = 4000;
const recipeRoutes = require("./routes/recipeRoutes");
app.use("/recipes", recipeRoutes);


app.get("/", (req, res) => {
    res.send("Hello, CookHub Web Backend is running!");
  });
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
module.exports = app;
