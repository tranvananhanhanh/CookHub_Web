// backend/routes/recipeRoutes.js
// Chứa các API endpoint liên quan đến công thức nấu ăn

const express = require("express");
const router = express.Router();
const RecipeModel = require("../models/recipeModel"); // Bỏ đi nếu không dùng RecipeModel nữa
const client = require('../config/db'); // <<<--- !!! QUAN TRỌNG: Đảm bảo đường dẫn này chính xác !!!

// --- API LẤY TẤT CẢ CÔNG THỨC (ĐÃ DUYỆT) ---
// GET / (VD: Sẽ thành /api/recipes/ nếu mount với prefix /api/recipes)
router.get("/", async (req, res) => {
  try {
    const recipes = await RecipeModel.getAllRecipes();
    res.json(recipes); // 
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

// --- API LẤY CATEGORIES THEO TYPE ---
// GET /categories (VD: Sẽ thành /api/recipes/categories nếu mount với prefix /api/recipes)
router.get('/categories', async (req, res) => {
    console.log("API: GET /categories (Get Categories by Type)"); // Log để biết route được gọi
    const { type } = req.query;

    if (!type) {
        return res.status(400).json({ message: 'Thiếu tham số bắt buộc: type' });
    }

    // Đổi tên cột để tiện cho frontend (id, name)
    let query = 'SELECT category_id AS id, category_name AS name FROM categories WHERE type = $1 ORDER BY name';

    try {
        const result = await client.query(query, [type]);
        res.json(result.rows); // Trả về mảng [{id: 1, name: 'Italian'}, ...]
    } catch (err) {
        console.error(`Error fetching categories (type: ${type})`, err.stack);
        res.status(500).json({ message: 'Lỗi lấy danh mục' });
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
            minServings: servingsParam ? parseInt(servingsParam) : null,
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

router.get('/ingredients/common', async (req, res) => {
  console.log("API: GET /ingredients/common (Get Common Ingredients for Filter)");
  try {
       // Lấy top N ingredients được dùng nhiều nhất
       // Hoặc có thể bạn có một bảng/cột đánh dấu ingredient nào dùng cho filter
       // Ví dụ đơn giản: Lấy 20 ingredients đầu tiên theo alphabet
       // Ví dụ tốt hơn: Đếm số lần xuất hiện trong recipe_ingredients
       const query = `
          SELECT
              i.ingredient_id AS id,
              i.name AS name
              -- ,COUNT(ri.recipe_id) as usage_count -- Uncomment để debug
          FROM ingredients i
          JOIN recipe_ingredients ri ON i.ingredient_id = ri.ingredient_id
          GROUP BY i.ingredient_id, i.name
          ORDER BY COUNT(ri.recipe_id) DESC -- Sắp xếp theo tần suất sử dụng
          LIMIT 5; -- Giới hạn số lượng trả về
       `;
       // Hoặc đơn giản hơn nếu không cần đếm:
       // const query = `SELECT ingredient_id AS id, name FROM ingredients ORDER BY name LIMIT 20;`;

       const result = await client.query(query);
       res.json(result.rows);
  } catch (err) {
       console.error('Error fetching common ingredients:', err.stack);
       res.status(500).json({ message: 'Lỗi lấy danh sách nguyên liệu' });
  }
});


module.exports = router;