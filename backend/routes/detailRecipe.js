const express = require("express");
const router = express.Router();
const path = require("path");
const { FullRecipeModel } = require("../models/detailRecipeModel");

// Đưa route này lên trước để nó KHÔNG bị route '/:id' bắt nhầm
router.get("/detailrecipe-page", (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'pages', 'detailRecipe', 'detailRecipe.html'));
});

router.post("/", async (req, res) => {
  const { user_id, recipe_id } = req.body;
  await FullRecipeModel.savedrecipe(user_id, recipe_id, res);
});

router.post('/rating', async (req, res) => {
  const { recipe_id, user_id, rating } = req.body;
  
  try {
    const result = await submitRating(recipe_id, user_id, rating);
    res.json({ message: 'Rating đã được lưu thành công', result });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lưu rating', error });
  }
});




router.post('/comments', async (req, res) => {
  console.log('📦 req.body:', req.body); // debug nè
  const { content, recipe_id, user_id } = req.body;

  try {
    if (!user_id) {
      return res.status(401).json({ error: 'Bạn cần đăng nhập để bình luận.' });
   }
    const newComment = await FullRecipeModel.createComment(content, recipe_id, user_id);
    res.status(200).json({ newcomment: newComment }); // SỬA Ở ĐÂY
  } catch (error) {
    console.error("❌ Lỗi route POST /comments:", error.message);
    res.status(400).json({ error: error.message || 'Lỗi khi tạo bình luận' });
  }
});


// API lấy chi tiết món ăn theo ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const recipeIdInt = parseInt(id, 10); // Chuyển đổi sang số nguyên (base 10)
  // Kiểm tra xem id có phải là số hợp lệ không
  if (isNaN(recipeIdInt) || recipeIdInt <= 0) {
    console.warn(`Yêu cầu ID công thức không hợp lệ: ${id}`);
    return res.status(400).json({ message: "ID công thức không hợp lệ." }); // Trả về 400 Bad Request
  }
  try {
    const recipe = await FullRecipeModel.getDetailRecipe(id);
    if (!recipe) {
      console.log(`Không tìm thấy công thức với ID: ${recipeIdInt}`);
      return res.status(404).json({ message: "Không tìm thấy món ăn" }); // Trả về 404 Not Found
  }

  console.log(`Trả về chi tiết cho công thức ID: ${recipeIdInt}`);
  res.json(recipe); // Trả về dữ liệu recipe nếu tìm thấy
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});




module.exports = router;
