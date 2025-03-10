// chứa các API endpoint liên quan đến công thức nấu ăn

const express = require("express");
const router = express.Router();
const RecipeModel = require("../models/recipeModel");

// Lấy danh sách công thức (trả về JSON)
router.get("/", async (req, res) => {
  try {
    const recipes = await RecipeModel.getAllRecipes();
    res.json(recipes); // 
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

module.exports = router;

