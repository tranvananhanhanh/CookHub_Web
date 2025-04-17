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

module.exports = router;