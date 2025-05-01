

// backend/routes/recipeRoutes.js
// Chứa các API endpoint liên quan đến công thức nấu ăn


const express = require("express");
const router = express.Router();
const RecipeModel = require("../models/recipeModel"); // Bỏ đi nếu không dùng RecipeModel nữa
const client = require('../config/db'); // <<<--- !!! QUAN TRỌNG: Đảm bảo đường dẫn này chính xác !!!


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
=======
// --- API LẤY TẤT CẢ CÔNG THỨC (ĐÃ DUYỆT) ---
// GET / (VD: Sẽ thành /api/recipes/ nếu mount với prefix /api/recipes)
router.get("/", async (req, res) => {
  try {
    const recipes = await RecipeModel.getAllRecipes();
    res.json(recipes); 

  } catch (err) {
    res.status(500).json({ error: `Lỗi cập nhật trạng thái công thức: ${err.message}` });
  }
});

// --- API LẤY CATEGORIES THEO TYPE ---
// GET /categories (VD: Sẽ thành /api/recipes/categories nếu mount với prefix /api/recipes)
router.get('/categories', async (req, res) => {
    console.log("API: GET /categories (Get Categories by Type)");
    const { type } = req.query;

    if (!type) {
        // Giữ validation ở route handler là hợp lý
        return res.status(400).json({ message: 'Thiếu tham số bắt buộc: type' });
    }

    try {
        // Gọi phương thức từ Model, truyền tham số 'type'
        const categories = await RecipeModel.getCategoriesByType(type);
        res.json(categories); // Trả về kết quả từ Model
    } catch (err) {
        // Lỗi đã được log trong Model
        console.error(`Error in GET /categories route (type: ${type})`, err.message); // Log thêm ở route nếu muốn
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh mục.' });
    }
});

router.get("/search", async (req, res) => {
    console.log("API: GET /search (Search/Filter Recipes using Model)");
    try {
        // 1. Lấy query parameters
        const {
            search,
            categories: categoriesParam,
            ingredients: ingredientsParam,
            maxTime,
            servings: servingsParam,
            minRating: minRatingParam
        } = req.query;

        // --- Helper Function để parse ID ---
        const parseIds = (param) => param
            ? param.split(',').map(id => parseInt(id.trim())).filter(Number.isInteger)
            : [];

        // 2. Chuẩn bị đối tượng filters cho Model
        const filters = {
            search: search || null, // Truyền null nếu không có
            categoryIds: parseIds(categoriesParam),
            ingredientIds: parseIds(ingredientsParam),
            maxTime: maxTime ? parseInt(maxTime) : null,
            servingsFilter: servingsParam ? parseInt(servingsParam) : null,
            minRating: minRatingParam ? parseInt(minRatingParam) : null,
            // status: 'approved' // Model đã xử lý mặc định
        };

        // 3. Gọi phương thức Model
        const recipes = await RecipeModel.searchRecipes(filters);

        // 4. Trả về kết quả
        res.json(recipes);

    } catch (err) {
        // Lỗi đã được log trong Model, chỉ cần trả về lỗi 500
        console.error('Error in /search route:', err.message); // Log lỗi ở route nữa cho rõ
        res.status(500).json({ error: "Lỗi máy chủ khi tìm kiếm công thức." });
    }
});

// --- API LẤY CÔNG THỨC NỔI BẬT THEO DANH SÁCH ID ---
// GET /api/recipes/featured?ids=1,5,10,12
//Note cần tạo API lấy id ingredients từ name ingredients
router.get('/featured', async (req, res) => {
    console.log("API: GET /feature (Get feature Recipes by IDs)");
    const { ids } = req.query; //Lay chuoi tu query param

    if (!ids) {
        return res.status(400).json({ message: 'Thieu tham so bat buoc: ids'});
    }

    //Cat chuoi boi cac filter isInterger
    const recipeIds = ids.split(',').map(id => parseInt(id.trim())).filter(Number.isInteger);

    if (recipeIds.length === 0){
        return res.status(400).json({ message: 'Tham số ids không hợp lệ.' });
    }

    try {
        const feturedRecipes = await RecipeModel.getRecipesByIds(recipeIds);
        res.json(feturedRecipes);
    } catch(err) {
        console.error('Error in GET /feature route: ', err.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy công thức nổi bật.' });
    }
})

// --- API LẤY CÔNG THỨC THEO INGREDIENT ID ---
// GET /api/recipes/by-ingredient/:ingredientId?limit=10
router.get('/by-ingredient/:ingredientId', async(req, res) => {
    console.log("API: GET /by-ingredient/:ingredientID (Get Recipes by Ingredient ID)");
    const {ingredientId} = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10; 
    //Co the thay doi so luong mon an hien thi o day

    if (isNaN(parseInt(ingredientId))) {
        return res.status(400).json({ message: 'Ingredient ID khong hop le.'});
    }

    try {
        const recipes = await RecipeModel.getRecipesByIngredients(parseInt(ingredientId), limit);
        res.json(recipes);
    } catch (err) {
        console.error(`Error in in GET /by-ingredient/${ingredientId} route:`, err.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy công thức theo nguyên liệu.' });
    }
})

router.get('/ingredients/common', async (req, res) => {
    console.log("API: GET /ingredients/common (Get Common Ingredients for Filter)");
    try {
         // Gọi phương thức từ Model
         const commonIngredients = await RecipeModel.getCommonIngredients();
         res.json(commonIngredients); // Trả về kết quả từ Model
    } catch (err) {
         // Lỗi đã được log trong Model
         console.error('Error in GET /ingredients/common route:', err.message); // Log thêm ở route nếu muốn
         res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách nguyên liệu phổ biến.' });
    }
  });

module.exports = router;