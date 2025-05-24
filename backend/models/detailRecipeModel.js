const pool = require("../config/db");

class FullRecipeModel {
    static async getDetailRecipe(recipe_id) {
      try {
        // Join users để lấy tên người tạo
        recipe_id = parseInt(recipe_id);

        const recipeQuery = pool.query(`
          SELECT r.*, u.name AS author_name, u.user_id
          FROM recipes r
          JOIN users u ON r.user_id = u.user_id
          WHERE r.recipe_id = $1
        `, [recipe_id]);

          // 👇 Truy vấn số lượt rate (số dòng trong bảng ratings)
        const ratingCountQuery = pool.query(`
        SELECT COUNT(*) AS total_ratings
        FROM ratings
        WHERE recipe_id = $1
      `, [recipe_id]);
  
        const stepsQuery = pool.query(
          "SELECT * FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_number",
          [recipe_id]
        );
  
        const imagesQuery = pool.query(
          "SELECT * FROM recipe_images WHERE recipe_id = $1",
          [recipe_id]
        );
  
        const ingredientsQuery = pool.query(`
          SELECT 
            ri.amount, 
            u.unit_name, 
            i.name AS ingredient_name, 
            i.calories_per_100g, 
            i.protein_per_100g, 
            i.fat_per_100g, 
            i.carbs_per_100g
          FROM recipe_ingredients ri
          JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
          JOIN units u ON ri.unit_id = u.unit_id
          WHERE ri.recipe_id = $1
        `, [recipe_id]);



        const commentsQuery=pool.query(`
                SELECT 
          users.name,
          comments.comment,
          comments.created_at,
          comments.comment_id
        FROM comments
        JOIN users ON comments.user_id = users.user_id
        WHERE comments.recipe_id = $1;
        `,[recipe_id]);

  
        // Chạy song song cho hiệu suất cao hơn
        const [recipeResult, stepsResult, imagesResult, ingredientsResult,ratingCountResult,commentsResult] = await Promise.all([
          recipeQuery,
          stepsQuery,
          imagesQuery,
          ingredientsQuery,
          ratingCountQuery,
          commentsQuery
        ]);
  
        if (recipeResult.rows.length === 0) {
          return null;
        }
  
        return {
          ...recipeResult.rows[0], // bao gồm title, thumbnail, cooking_time, status, description, author_name,...
          steps: stepsResult.rows,
          images: imagesResult.rows,
          ingredients: ingredientsResult.rows,
          total_ratings: parseInt(ratingCountResult.rows[0].total_ratings),
          comments: commentsResult.rows

        };
      } catch (err) {
        console.error("❌ Error fetching recipe detail:", err);
        throw err;
      }
    }
    static async savedrecipe(user_id, recipe_id, res) {
      const parsedUserId = parseInt(user_id);
      const parsedRecipeId = parseInt(recipe_id);
    
      if (isNaN(parsedUserId) || isNaN(parsedRecipeId)) {
        return res.status(400).json({ message: "user_id hoặc recipe_id không hợp lệ" });
      }
    
      try {
        // Kiểm tra xem công thức đã được lưu trước đó chưa
        const result = await pool.query(
          "SELECT 1 FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2 LIMIT 1",
          [parsedUserId, parsedRecipeId]
        );
    
        if (result.rows.length > 0) {
          return res.status(400).json({ message: "Công thức đã được lưu trước đó." });
        }
    
        // Nếu không có bản ghi nào, thực hiện lưu mới
        await pool.query(
          "INSERT INTO saved_recipes (user_id, recipe_id, saved_at) VALUES ($1, $2, NOW())",
          [parsedUserId, parsedRecipeId]
        );
    
        res.status(200).json({ message: "Lưu thành công" });
      } catch (err) {
        console.error("Lỗi khi lưu công thức:", err);
        res.status(500).json({ message: "Lỗi server" });
      }
    }
    
    static async saveRating(recipe_id, user_id, rating) {
      const parsedRecipeId = parseInt(recipe_id);
      const parsedUserId = parseInt(user_id);
      const parsedRating = parseInt(rating);
    
      if (isNaN(parsedRecipeId) || isNaN(parsedUserId) || isNaN(parsedRating)) {
        // ❌ KHÔNG được dùng res ở đây!
        throw new Error("Thông tin không hợp lệ");
      }
    
      try {
        const result = await pool.query(
          `INSERT INTO ratings (recipe_id, user_id, rate)
           VALUES ($1, $2, $3)
           ON CONFLICT (recipe_id, user_id) 
           DO UPDATE SET rate = EXCLUDED.rate`,
          [parsedRecipeId, parsedUserId, parsedRating]
        );
    
        return { message: "Lưu thành công", result };
      } catch (err) {
        throw new Error("Lỗi server hoặc đã lưu trước đó: " + err.message);
      }
    }
    
        

    //hàm thực hiện comment
    static async createComment(content, recipe_id, user_id ) {
      if (!content || !recipe_id) {
          throw new Error('Nội dung và recipe_id là bắt buộc');
      }

      const parsedRecipeId = parseInt(recipe_id);
      const parsedUserId = parseInt(user_id);

      if (isNaN(parsedRecipeId)) {
          throw new Error('recipe_id không hợp lệ');
      }

      try {
          const result = await pool.query(
              `INSERT INTO comments (comment, user_id, recipe_id, created_at)
              VALUES ($1, $2, $3, $4)
              RETURNING *`,
              [content, parsedUserId, parsedRecipeId, new Date()]
          );
          return result.rows[0];
      } catch (error) {
          console.error('❌ Lỗi khi tạo bình luận:', error);
          throw error;
      }
    }


 
  }

  module.exports = { FullRecipeModel };
