const express = require("express");
const router = express.Router();
const client = require("../config/db");

router.get("/", async (req, res) => {
  const userId = req.query.user_id; // Lấy user_id từ query parameter

  try {
    const query = `
      SELECT 
        sr.user_id, 
        sr.recipe_id, 
        r.title,
        r.thumbnail,
        r.date_created,
        COALESCE(AVG(ra.rate), 0) as average_rating,
        COUNT(c.comment_id) as comment_count
      FROM saved_recipes sr
      JOIN recipes r ON sr.recipe_id = r.recipe_id
      LEFT JOIN ratings ra ON r.recipe_id = ra.recipe_id
      LEFT JOIN comments c ON r.recipe_id = c.recipe_id
      WHERE sr.user_id = $1  -- Thêm điều kiện lọc theo user_id
      GROUP BY sr.user_id, sr.recipe_id, r.title, r.thumbnail, r.date_created
    `;
    const result = await client.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error retrieving saved recipes:", error);
    res.status(500).json({ error: "Lỗi tải dữ liệu", details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.body.user_id;

  if (!userId) {
    return res.status(400).json({ error: "Thiếu user_id trong yêu cầu" });
  }

  try {
    const query = `
      DELETE FROM saved_recipes 
      WHERE user_id = $1 AND recipe_id = $2 
      RETURNING *
    `;
    const result = await client.query(query, [userId, recipeId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Công thức không tồn tại trong danh sách đã lưu của người dùng" });
    }

    res.json({ message: "Xóa công thức thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa công thức:", err);
    res.status(500).json({ error: "Lỗi khi xóa công thức", details: err.message });
  }
});

module.exports = router;