const express = require('express');
const client = require("./config/db");
const path = require('path'); // Import the 'path' module
const cors = require("cors");
const app = express();
const port = 4000;
const recipeRoutes = require("./routes/recipeRoutes");

app.use(cors({
  origin: "http://127.0.0.1:5500"
}));

app.use(express.json());

app.use("/recipes", recipeRoutes);

app.get("/", (req, res) => {
    res.send("Hello, CookHub Web Backend is running!");
  });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
  
module.exports = app;