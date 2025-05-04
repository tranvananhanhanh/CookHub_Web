const express = require("express");
const router = express.Router();
const RecipeModel = require("../models/recipeModel"); // Bỏ đi nếu không dùng RecipeModel nữa
const client = require('../config/db'); // <<<--- !!! QUAN TRỌNG: Đảm bảo đường dẫn này chính xác !!!

// --- API LẤY TẤT CẢ CÔNG THỨC (ĐÃ DUYỆT) ---
// GET / (VD: Sẽ thành /api/recipes/ nếu mount với prefix /api/recipes)
router.get("/", async (req, res) => {
    try {
        const recipes = await RecipeModel.getAllRecipes();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy dữ liệu" });
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
        return res.status(400).json({ message: 'Thieu tham so bat buoc: ids' });
    }

    //Cat chuoi boi cac filter isInterger
    const recipeIds = ids.split(',').map(id => parseInt(id.trim())).filter(Number.isInteger);

    if (recipeIds.length === 0) {
        return res.status(400).json({ message: 'Tham số ids không hợp lệ.' });
    }

    try {
        const feturedRecipes = await RecipeModel.getRecipesByIds(recipeIds);
        res.json(feturedRecipes);
    } catch (err) {
        console.error('Error in GET /feature route: ', err.message);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy công thức nổi bật.' });
    }
})

// --- API LẤY CÔNG THỨC THEO INGREDIENT ID ---
// GET /api/recipes/by-ingredient/:ingredientId?limit=10
router.get('/by-ingredient/:ingredientId', async (req, res) => {
    console.log("API: GET /by-ingredient/:ingredientID (Get Recipes by Ingredient ID)");
    const { ingredientId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    //Co the thay doi so luong mon an hien thi o day

    if (isNaN(parseInt(ingredientId))) {
        return res.status(400).json({ message: 'Ingredient ID khong hop le.' });
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

// --- API LẤY CÔNG THỨC VỚI ĐÁNH GIÁ TRUNG BÌNH VÀ SỐ BÌNH LUẬN ---
router.get('/with-ratings-comments', async (req, res) => {
    console.log("API: GET /with-ratings-comments (Get Recipes with Ratings and Comments)");
    try {
        const userId = req.query.user_id;
        if (!userId) {
            return res.status(400).json({ error: 'Thiếu user_id' });
        }

        const recipes = await RecipeModel.getRecipesWithRatingsAndComments(userId);
        res.json(recipes);
    } catch (err) {
        console.error('Lỗi lấy công thức:', err);
        res.status(500).json({ error: 'Lỗi server', details: err.message });
    }
});

module.exports = router;