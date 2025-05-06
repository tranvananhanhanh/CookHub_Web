const express = require("express");
const router = express.Router();
const client = require("../config/db");

router.get("/", async (req, res) => {
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
  GROUP BY sr.user_id, sr.recipe_id, r.title, r.thumbnail, r.date_created
`;
    const result = await client.query(query);
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

module.exports = router;