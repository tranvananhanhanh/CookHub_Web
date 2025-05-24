const express = require("express");
const router = express.Router();
const client = require("../config/db");

router.get("/", async (req, res) => {
  try {
    // Lấy user_id từ query parameter
    const userId = req.query.user_id;

    // Kiểm tra xem user_id có được cung cấp không
    if (!userId) {
      return res.status(400).json({ error: "Thiếu user_id trong query parameter" });
    }

    // Truy vấn SQL với subquery để tính số lượng bình luận chính xác
    const query = `
      SELECT 
        sr.user_id, 
        sr.recipe_id, 
        r.title,
        r.thumbnail,
        r.date_created,
        COALESCE(AVG(ra.rate), 0) as average_rating,
        (SELECT COUNT(*) FROM comments c WHERE c.recipe_id = sr.recipe_id) as comment_count
      FROM saved_recipes sr
      JOIN recipes r ON sr.recipe_id = r.recipe_id
      LEFT JOIN ratings ra ON r.recipe_id = ra.recipe_id
      WHERE sr.user_id = $1
      GROUP BY sr.user_id, sr.recipe_id, r.title, r.thumbnail, r.date_created
    `;
    const result = await client.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving saved recipes:", error);
    res.status(500).json({ error: "Lỗi tải dữ liệu", details: error.message });
  }
});

router.get("/ids/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: "User ID không hợp lệ." });
  }
  try {
      const query = 'SELECT recipe_id FROM saved_recipes WHERE user_id = $1';
      const result = await client.query(query, [parseInt(userId)]);
      const savedIds = result.rows.map(row => row.recipe_id); // Lấy mảng các ID
      res.json({ saved_ids: savedIds });
  } catch (error) {
      console.error("Error retrieving saved recipe IDs:", error);
      res.status(500).json({ error: "Lỗi tải danh sách công thức đã lưu", details: error.message });
  }
});

router.post("/", async (req, res) => {
  const { userId, recipeId } = req.body;

  console.log(`userId: ${userId}, recipeId: ${recipeId}`);
  const numericUserId = userId !== undefined && userId !== null ? Number.parseInt(userId, 10) : NaN;
  const numericRecipeId = recipeId !== undefined && recipeId !== null ? Number.parseInt(recipeId, 10) : NaN;
  if (isNaN(numericUserId) || isNaN(numericRecipeId)) {
    return res.status(400).json({ error: "Thông tin userId hoặc recipeId không hợp lệ hoặc bị thiếu." });
  }
  
  try {
    const userCheck = await client.query('SELECT 1 FROM users WHERE user_id = $1', [userId]);
    const recipeCheck = await client.query('SELECT 1 FROM recipes WHERE recipe_id = $1', [recipeId]);

    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại." });
    }
    if (recipeCheck.rowCount === 0) {
      return res.status(404).json({ error: "Công thức không tồn tại." });
    }
    const query = `
      INSERT INTO saved_recipes (user_id, recipe_id, saved_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, recipe_id) DO NOTHING;
    `;
    const result = await client.query(query, [numericUserId, numericRecipeId]);
    if (result.rowCount > 0) {
      console.log(`Recipe ${recipeId} saved for user ${userId}`);
      res.status(201).json({ message: "Công thức đã được lưu thành công." });
    } else {
      console.log(`Recipe ${recipeId} was already saved for user ${userId}`);
      res.status(200).json({ message: "Công thức đã được lưu trước đó." });
    }
  } catch (error) {
    console.error("Error saving recipe:", error);
    res.status(500).json({ error: "Lỗi khi lưu công thức", details: error.message });
  }
});

router.delete("/", async (req, res) => {
  const { userId, recipeId } = req.body;

  const numericUserId = userId !== undefined && userId !== null ? Number.parseInt(userId, 10) : NaN;
  const numericRecipeId = recipeId !== undefined && recipeId !== null ? Number.parseInt(recipeId, 10) : NaN;

  if (isNaN(numericUserId) || isNaN(numericRecipeId)) {
    return res.status(400).json({ error: "Thông tin userId hoặc recipeId không hợp lệ hoặc bị thiếu." });
  }

  try {
    const query = 'DELETE FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2';
    const result = await client.query(query, [parseInt(userId), parseInt(recipeId)]);

    if (result.rowCount > 0) {
      console.log(`Recipe ${recipeId} unsaved for user ${userId}`);
      res.status(200).json({ message: "Đã bỏ lưu công thức thành công." });
    } else {
      console.log(`Recipe ${recipeId} was not found in saved list for user ${userId}`);
      res.status(404).json({ message: "Công thức không có trong danh sách đã lưu hoặc đã được bỏ lưu." });
    }
  } catch (error) {
    console.error("Error unsaving recipe:", error);
    res.status(500).json({ error: "Lỗi khi bỏ lưu công thức", details: error.message });
  }
});

module.exports = router;