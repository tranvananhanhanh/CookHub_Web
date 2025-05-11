const express = require("express");
const router = express.Router();
const RecipeModel = require("../models/recipeModel"); // Bỏ đi nếu không dùng RecipeModel nữa
const pool = require('../config/db'); // <<<--- !!! QUAN TRỌNG: Đảm bảo đường dẫn này chính xác !!!

// --- API LẤY CÔNG THỨC VỚI COMMENT VÀ RATING ---
// --- API LẤY CÔNG THỨC VỚI COMMENT VÀ RATING CHO USER PROFILE ---
router.get("/", async (req, res) => {
    console.log("API: GET / (Get Recipes with Comments and Ratings for user profile)");
    try {
        const userId = req.query.user_id;
        if (!userId) {
            console.log("Error: user_id is missing from query.");
            return res.status(400).json({ error: "Thiếu user_id" });
        }
        console.log(`Fetching recipes for user_id: ${userId}`);

        const recipes = await RecipeModel.getAllRecipeInfo(userId);
        // console.log(`Found ${recipes.length} recipes (basic info):`, JSON.stringify(recipes, null, 2));

        if (recipes.length === 0) {
            console.log("No recipes found for this user. Returning empty array.");
            return res.json([]);
        }

        const fullRecipes = await Promise.all(
            recipes.map(async (recipe) => {
                try {
                    // console.log(`Processing recipe_id: ${recipe.recipe_id}`);
                    const commentCount = await RecipeModel.getRecipeComments(recipe.recipe_id);
                    const ratingsData = await RecipeModel.getRecipeRatingsAndAverage(recipe.recipe_id); // Đây là { average_rating: X.X }

                    console.log(`   Recipe ID: ${recipe.recipe_id} -> Comment Count: ${commentCount}, Avg Rating: ${ratingsData.average_rating}`);

                    return {
                        ...recipe,
                        comment_count: commentCount, // Đảm bảo đây là một số
                        average_rating: ratingsData.average_rating, // Đảm bảo đây là một số
                    };
                } catch (error) {
                    console.error(`   Error processing details for recipe_id ${recipe.recipe_id}:`, error.message);
                    // Trả về recipe gốc với dấu hiệu lỗi, để không làm hỏng toàn bộ request
                    return {
                        ...recipe,
                        comment_count: 0, // Hoặc giá trị mặc định/lỗi
                        average_rating: 0.0, // Hoặc giá trị mặc định/lỗi
                        error_loading_details: error.message // Thêm trường lỗi
                    };
                }
            })
        );

        // console.log("Full recipes to be sent to client:", JSON.stringify(fullRecipes, null, 2));
        res.json(fullRecipes);

    } catch (err) { // Catch lỗi từ getAllRecipeInfo hoặc lỗi không mong muốn khác
        console.error("Lỗi tổng thể trong route GET /api/recipes:", err);
        res.status(500).json({ error: "Lỗi server", details: err.message });
    }
});

// // --- API LẤY TỔNG SỐ COMMENT CỦA MỘT CÔNG THỨC ---
// router.get("/comments/:recipe_id", async (req, res) => {
//     console.log("API: GET /comments/:recipe_id (Get Recipe Comment Count)");
//     try {
//         const recipeId = req.params.recipe_id;
//         const commentCount = await RecipeModel.getRecipeComments(recipeId);
//         res.json(commentCount);
//     } catch (err) {
//         console.error("Lỗi lấy comment:", err);
//         res.status(500).json({ error: "Lỗi server", details: err.message });
//     }
// });

// // --- API LẤY RATING VÀ TRUNG BÌNH RATING CỦA MỘT CÔNG THỨC ---
// router.get("/ratings/:recipe_id", async (req, res) => {
//     console.log("API: GET /ratings/:recipe_id (Get Recipe Ratings and Average)");
//     try {
//         const recipeId = req.params.recipe_id;
//         const ratingsData = await RecipeModel.getRecipeRatingsAndAverage(recipeId);
//         res.json(ratingsData);
//     } catch (err) {
//         console.error("Lỗi lấy rating:", err);
//         res.status(500).json({ error: "Lỗi server", details: err.message });
//     }
// });

// --- API LẤY TẤT CẢ CÔNG THỨC (ĐÃ DUYỆT) ---
// GET / (VD: Sẽ thành /api/recipes/ nếu mount với prefix /api/recipes)
// router.get("/", async (req, res) => {
//     console.log("API: GET / (Get All Recipe Info)");
//     try {
//         const userId = req.query.user_id;
//         if (!userId) {
//             return res.status(400).json({ error: "Thiếu user_id" });
//         }
//         const recipes = await RecipeModel.getAllRecipeInfo(userId);
//         res.json(recipes);
//     } catch (err) {
//         console.error("Lỗi lấy công thức:", err);
//         res.status(500).json({ error: "Lỗi server", details: err.message });
//     }
// });

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

// --- API XÓA CÔNG THỨC ---
router.delete("/:recipe_id", async (req, res) => {
    console.log("API: DELETE /:recipe_id (Delete Recipe)");
    try {
        const recipeId = parseInt(req.params.recipe_id);
        const userId = req.query.user_id ? parseInt(req.query.user_id) : null;

        if (isNaN(recipeId)) {
            console.log("Error: Invalid recipe_id:", req.params.recipe_id);
            return res.status(400).json({ error: "Invalid recipe_id" });
        }
        if (!userId) {
            console.log("Error: user_id is missing from query");
            return res.status(400).json({ error: "Missing user_id" });
        }
        console.log(`Deleting recipe with ID: ${recipeId} by user_id: ${userId}`);

        // Kiểm tra recipe có thuộc về user_id không
        const checkResult = await pool.query('SELECT user_id FROM recipes WHERE recipe_id = $1', [recipeId]);
        if (checkResult.rowCount === 0) {
            console.log(`Recipe with ID ${recipeId} not found`);
            return res.status(404).json({ error: "Recipe not found" });
        }
        if (checkResult.rows[0].user_id !== userId) {
            console.log(`User ${userId} not authorized to delete recipe ${recipeId}`);
            return res.status(403).json({ error: "Unauthorized to delete this recipe" });
        }

        // Xóa recipe bằng RecipeModel
        await RecipeModel.deleteRecipe(recipeId);

        console.log(`Recipe with ID ${recipeId} deleted successfully`);
        res.status(200).json({ message: "Recipe deleted successfully" });
    } catch (err) {
        console.error("Error deleting recipe:", err.message);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});
module.exports = router;