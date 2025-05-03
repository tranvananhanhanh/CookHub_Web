const express = require("express");
const router = express.Router();
const client = require("../config/db");

const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Authentication required. Please log in." });
  }
  next(); // Cho phép đi tiếp nếu đã đăng nhập
};

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

router.post("/:recipeId", requireLogin, async(req, res) => {
  const { recipeId } = req.params;
    const userId = req.session.user.id; // Lấy từ session sau khi qua requireLogin

    // Validate recipeId
    const recipeIdNum = parseInt(recipeId);
    if (isNaN(recipeIdNum)) {
        return res.status(400).json({ message: "Invalid recipe ID format." });
    }

    console.log(`Attempting to save recipe ${recipeIdNum} for user ${userId}`);

    try {
      // Kiểm tra xem recipe có tồn tại không (tùy chọn nhưng nên có)
      const recipeCheck = await client.query('SELECT 1 FROM recipes WHERE recipe_id = $1 AND status = \'approved\'', [recipeIdNum]);
      if (recipeCheck.rowCount === 0) {
           return res.status(404).json({ message: "Recipe not found or not available." });
      }
        // Thêm vào bảng saved_recipes, bỏ qua nếu đã tồn tại (ON CONFLICT DO NOTHING)
        const insertQuery = `
            INSERT INTO saved_recipes (user_id, recipe_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, recipe_id) DO NOTHING;
        `;
        const result = await client.query(insertQuery, [userId, recipeIdNum]);
      
              // Kiểm tra xem có hàng nào được thêm mới không
              if (result.rowCount > 0) {
                console.log(`Recipe ${recipeIdNum} saved successfully for user ${userId}`);
                res.status(201).json({ message: "Recipe saved successfully." }); // 201 Created (hoặc 200 OK)
            } else {
                console.log(`Recipe ${recipeIdNum} was already saved for user ${userId}`);
                res.status(200).json({ message: "Recipe was already saved." }); // 200 OK
            }
    }  catch (error) {
      console.error(`Error saving recipe ${recipeIdNum} for user ${userId}:`, error);
      res.status(500).json({ message: "Server error while saving recipe.", details: error.message });
  }
});

// --- THÊM ROUTE MỚI: BỎ LƯU CÔNG THỨC ---
// DELETE /api/saved-recipes/:recipeId
router.delete("/:recipeId", requireLogin, async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.session.user.id; // Lấy từ session

  // Validate recipeId
  const recipeIdNum = parseInt(recipeId);
  if (isNaN(recipeIdNum)) {
      return res.status(400).json({ message: "Invalid recipe ID format." });
  }

  console.log(`Attempting to unsave recipe ${recipeIdNum} for user ${userId}`);

  try {
      // Xóa khỏi bảng saved_recipes
      const deleteQuery = `
          DELETE FROM saved_recipes
          WHERE user_id = $1 AND recipe_id = $2;
      `;
      const result = await client.query(deleteQuery, [userId, recipeIdNum]);

      // Kiểm tra xem có hàng nào bị xóa không
      if (result.rowCount > 0) {
          console.log(`Recipe ${recipeIdNum} unsaved successfully for user ${userId}`);
          res.status(200).json({ message: "Recipe unsaved successfully." }); // 200 OK (hoặc 204 No Content)
      } else {
          console.log(`Recipe ${recipeIdNum} was not found in saved list for user ${userId}`);
          res.status(404).json({ message: "Recipe not found in your saved list." }); // 404 Not Found
      }

  } catch (error) {
      console.error(`Error unsaving recipe ${recipeIdNum} for user ${userId}:`, error);
      res.status(500).json({ message: "Server error while unsaving recipe.", details: error.message });
  }
});

module.exports = router;