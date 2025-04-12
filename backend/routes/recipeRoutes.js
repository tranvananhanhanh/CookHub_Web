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
        const { search, categories: categoriesParam, maxTime } = req.query;

        // 2. Chuẩn bị truy vấn động
        let queryParams = [];
        let paramIndex = 1;
        // Luôn lọc theo status = 'approved'
        let baseWhereClauses = ['r.status = $1'];
        queryParams.push('approved');

        // 3. Xử lý các filter cơ bản (Search, Time)
        if (search) {
            baseWhereClauses.push(`(LOWER(r.title) LIKE $${paramIndex + 1})`);
            queryParams.push(`%${search.toLowerCase()}%`);
            paramIndex++;
        }
        // ----- SỬA LOGIC maxTime -----
        if (maxTime) {
            const timeValue = parseInt(maxTime);
            // Kiểm tra giá trị hợp lệ (20, 30, 40, 60) mà frontend gửi
            if (!isNaN(timeValue) && [20, 30, 40, 60].includes(timeValue)) {
                 // "Under X minutes" -> cooking_time < X
                 baseWhereClauses.push(`r.cooking_time < $${paramIndex + 1}`);
                 queryParams.push(timeValue);
                 paramIndex++;
            }
            // Thêm else if cho các khoảng khác nếu cần
        }
        // ----- KẾT THÚC SỬA LOGIC maxTime -----

        // 4. Xử lý filter categories
        const selectedCategoryIds = categoriesParam
            ? categoriesParam.split(',').map(id => parseInt(id.trim())).filter(Number.isInteger)
            : [];
        const numberOfSelectedCategories = selectedCategoryIds.length;

        // 5. Xây dựng câu truy vấn SQL
        let finalQuery = `
            SELECT DISTINCT 
                r.recipe_id, r.title, r.thumbnail, r.description, 
                r.cooking_time, 
                r.date_created 
            FROM recipes r
        `;

        // JOIN và thêm điều kiện WHERE cho categories nếu có
        if (numberOfSelectedCategories > 0) {
            finalQuery += ` JOIN recipe_categories rc ON r.recipe_id = rc.recipe_id `;
            baseWhereClauses.push(`rc.category_id = ANY($${paramIndex + 1}::int[])`);
            queryParams.push(selectedCategoryIds);
            paramIndex++;
        }

        // Kết hợp WHERE
        finalQuery += ` WHERE ${baseWhereClauses.join(' AND ')}`;

        // GROUP BY và HAVING nếu lọc theo categories (để khớp TẤT CẢ)
        if (numberOfSelectedCategories > 0) {
             // Phải liệt kê TẤT CẢ các cột đã SELECT từ bảng `r`
             finalQuery += `
                 GROUP BY r.recipe_id, r.title, r.thumbnail, r.description, r.cooking_time, r.date_created 
                 HAVING COUNT(DISTINCT rc.category_id) = ${numberOfSelectedCategories} 
             `;
        }

        // ORDER BY
        finalQuery += ` ORDER BY r.date_created DESC`;

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