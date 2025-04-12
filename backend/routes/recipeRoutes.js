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


// --- API TÌM KIẾM/LỌC CÔNG THỨC ---
// GET /search (VD: Sẽ thành /api/recipes/search nếu mount với prefix /api/recipes)
router.get("/search", async (req, res) => {
    console.log("API: GET /search (Search/Filter Recipes)"); // Log để biết route được gọi
    try {
        // 1. Lấy các query parameters
        const { 
            search, 
            categories: categoriesParam,
            ingredients: ingredientParam,
            maxTime,
            servings: servingsParam,
            minRating: minRatingParam
        } = req.query;

        // 2. Chuẩn bị truy vấn động
        let queryParams = [];
        let paramIndex = 1;
        let baseSelect = `
            SELECT DISTINCT -- <<< THAY ĐỔI: Sử dụng DISTINCT ở đây để tránh trùng lặp do JOIN nhiều bảng
                r.recipe_id, r.title, r.thumbnail, r.description,
                r.cooking_time, r.servings, -- <<< THAY ĐỔI: Chọn servings để hiển thị
                r.date_created
        `;
        let fromClause = `FROM recipes r`;
        let joinClauses = '';
        // Luôn lọc theo status = 'approved'
        let whereClauses = ['r.status = $1'];
        queryParams.push('approved');
        let groupByClause = '';
        let havingClause = '';

        // --- Helper Function để parse ID từ string (tránh lỗi) ---
        const parseIds = (param) => param
            ? param.split(',').map(id => parseInt(id.trim())).filter(Number.isInteger)
            : [];


        // 3. Xử lý các filter cơ bản (Search, Time)
        if (search) {
            whereClauses.push(`(LOWER(r.title) LIKE $${paramIndex + 1})`);
            queryParams.push(`%${search.toLowerCase()}%`);
            paramIndex++;
        }
        // ----- SỬA LOGIC maxTime -----
        if (maxTime) {
            const timeValue = parseInt(maxTime);
            // Kiểm tra giá trị hợp lệ (20, 30, 40, 60) mà frontend gửi
            if (!isNaN(timeValue) && timeValue > 0) {
                 // "Under X minutes" -> cooking_time < X
                 whereClauses.push(`r.cooking_time < $${paramIndex + 1}`);
                 queryParams.push(timeValue);
                 paramIndex++;
            }
            // Thêm else if cho các khoảng khác nếu cần
        }

        if (servingsParam) {
            const servingsValue = parseInt(servingsParam);
            if (!isNaN(servingsValue) && servingsValue > 0){
                whereClauses.push(`r.servings >= $${paramIndex + 1}`); // Dung khau phan an
                queryParams.push(servingsValue);
                paramIndex++;
            }

        }

        // 4. Xử lý filter categories
        const selectedCategoryIds = parseIds(categoriesParam);
        const numberOfSelectedCategories = selectedCategoryIds.length;

        // JOIN và thêm điều kiện WHERE cho categories nếu có
        if (numberOfSelectedCategories > 0) {
            joinClauses += ` JOIN recipe_categories rc ON r.recipe_id = rc.recipe_id `;
            whereClauses.push(`rc.category_id = ANY($${paramIndex + 1}::int[])`);
            queryParams.push(selectedCategoryIds);
            paramIndex++;
            groupByClause = ` GROUP BY r.recipe_id, r.title, r.thumbnail, r.description, r.cooking_time, r.servings, r.date_created `;
            havingClause = ` HAVING COUNT(DISTINCT rc.category_id) = ${numberOfSelectedCategories} `;

        }

        // // GROUP BY và HAVING nếu lọc theo categories (để khớp TẤT CẢ)
        // if (numberOfSelectedCategories > 0) {
        //      // Phải liệt kê TẤT CẢ các cột đã SELECT từ bảng `r`
        //      finalQuery += `
        //          GROUP BY r.recipe_id, r.title, r.thumbnail, r.description, r.cooking_time, r.date_created 
        //          HAVING COUNT(DISTINCT rc.category_id) = ${numberOfSelectedCategories} 
        //      `;
        // }

        const selectedIngredientIds = parseIds(ingredientParam);
        const numberOfSelectedIngredients = selectedIngredientIds.length;

        if (numberOfSelectedIngredients > 0){
            joinClauses += ` JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id `;
            whereClauses.push(`ri.ingredient_id = ANY($${paramIndex + 1}::int[])`);
            queryParams.push(selectedIngredientIds);
            paramIndex++;
            groupByClause = ` GROUP BY r.recipe_id, r.title, r.thumbnail, r.description, r.cooking_time, r.servings, r.date_created `;
            havingClause = ` HAVING COUNT(DISTINCT ri.ingredient_id) = ${numberOfSelectedIngredients} `;
        }

        if (minRatingParam){
            const minRatingValue = parseInt(minRatingParam);
            if (!isNaN(minRatingValue) && minRatingValue >= 1 && minRatingValue <= 5){
                whereClauses.push(`EXISTS (
                    SELECT 1
                    FROM ratings rt
                    WHERE rt.recipe_id = r.recipe_id AND rt.rate >= $${paramIndex + 1}
                )`);
                queryParams.push(minRatingValue);
                paramIndex++;
            }
        }

        let finalQuery = baseSelect + fromClause + joinClauses;
        if (whereClauses.length > 0){
            finalQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        finalQuery += groupByClause;
        finalQuery += havingClause;
        
        //Order by
        if (groupByClause) {
            finalQuery += ` ORDER BY r.date_created DESC`; // Order trong group
        } else {
             finalQuery += ` ORDER BY r.date_created DESC`; // Order bình thường
        }


        // --- Debug Log ---
        console.log("Executing Search Query:", finalQuery);
        console.log("Search Parameters:", queryParams);
        // -----------------

        // 6. Thực thi truy vấn
        const result = await client.query(finalQuery, queryParams);

        // 7. Trả về kết quả
        res.json(result.rows);

    } catch (err) {
        console.error('Error executing recipe search query:', err.stack);
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