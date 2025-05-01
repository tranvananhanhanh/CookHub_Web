const express = require("express");
const router = express.Router();
const RecipeModel = require("../models/recipeModelAdmin");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const status = req.query.status || "all";
    const search = req.query.search || ""; // Thêm query parameter search
    const limit = 7;
    const offset = (page - 1) * limit;

    let recipes, totalRecipes;

    if (search) {
      recipes = await RecipeModel.searchRecipesPaginated(search, status, limit, offset);
      totalRecipes = await RecipeModel.countSearchRecipes(search, status);
    } else {
      recipes = await RecipeModel.getRecipesByStatusPaginated(status, limit, offset);
      totalRecipes = await RecipeModel.countRecipesByStatus(status);
    }

    const totalPages = Math.ceil(totalRecipes / limit);

    res.json({
      recipes,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
    });
  } catch (err) {
    res.status(500).json({ error: `Lỗi lấy dữ liệu: ${err.message}` });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    await RecipeModel.deleteRecipe(recipeId);
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: `Lỗi xóa recipe: ${err.message}` });
  }
});

// Trong file recipeRoutes.js
router.get("/:id", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const recipeDetails = await RecipeModel.getRecipeDetails(recipeId);
    res.json(recipeDetails);
  } catch (err) {
    res.status(500).json({ error: `Lỗi lấy chi tiết công thức: ${err.message}` });
  }
});

// Thêm route PUT để cập nhật trạng thái công thức
router.put("/:id/status", async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const { status } = req.body; // status sẽ là 'approved' hoặc 'rejected'
    const updatedRecipe = await RecipeModel.updateRecipeStatus(recipeId, status);
    res.json({ message: "Recipe status updated successfully", recipe: updatedRecipe });
  } catch (err) {
    res.status(500).json({ error: `Lỗi cập nhật trạng thái công thức: ${err.message}` });
  }
});

module.exports = router;