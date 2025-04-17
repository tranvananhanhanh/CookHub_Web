
const express = require("express");
const router = express.Router();
const ingredientModel = require('../models/ingredientModel');
// Import IngredientModel

// --- API LẤY NGUYÊN LIỆU PHỔ BIẾN ---
// GET /common (VD: Sẽ thành /api/ingredients/common nếu mount với prefix /api/ingredients)
router.get('/common', async (req, res) => {
  console.log("API: GET /common (Get Common Ingredients)");
  try {
       // Có thể lấy limit từ query param nếu muốn linh hoạt hơn
       // const limit = req.query.limit ? parseInt(req.query.limit) : 20;
       // Gọi phương thức từ IngredientModel
       const commonIngredients = await ingredientModel.getCommonIngredients(); // Sử dụng limit mặc định từ Model
       res.json(commonIngredients); // Trả về kết quả
  } catch (err) {
       // Lỗi đã được log trong Model
       console.error('Error in GET /common ingredients route:', err.message);
       res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách nguyên liệu phổ biến.' });
  }
});

// --- Bạn có thể thêm các routes khác cho Ingredient ở đây ---
// Ví dụ:
// router.get('/', async (req, res) => { ... }); // Lấy tất cả ingredients
// router.get('/search', async (req, res) => { ... }); // Tìm kiếm ingredients
// router.post('/', async (req, res) => { ... }); // Tạo ingredient mới (yêu cầu auth)

module.exports = router;