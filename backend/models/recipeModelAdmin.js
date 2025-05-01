const pool = require("../config/db");

class RecipeModelAdmin {
  // Lấy tất cả công thức
  static async getAllRecipes() {
    const result = await pool.query(`
      SELECT r.*, u.name AS author
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.status != 'deleted'
      ORDER BY r.recipe_id ASC
    `);
    return result.rows;
  }

  // Lấy công thức theo phân trang
  static async getRecipesPaginated(limit, offset) {
    const result = await pool.query(`
      SELECT r.*, u.name AS author
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.status != 'deleted'
      ORDER BY r.recipe_id ASC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return result.rows;
  }

  // Đếm tổng số công thức
  static async countRecipes() {
    const result = await pool.query(`
      SELECT COUNT(*) AS total
      FROM recipes
      WHERE status != 'deleted'
    `);
    return parseInt(result.rows[0].total);
  }

  // Lấy công thức theo trạng thái (All, Pending, Approved, Rejected) với phân trang
  static async getRecipesByStatusPaginated(status, limit, offset) {
    let query = `
      SELECT r.*, u.name AS author
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.status != 'deleted'
    `;
    const values = [limit, offset];

    if (status !== "all") {
      query += " AND r.status = $3";
      values.push(status);
    }

    query += " ORDER BY r.recipe_id ASC LIMIT $1 OFFSET $2";
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Đếm số công thức theo trạng thái
  static async countRecipesByStatus(status) {
    let query = "SELECT COUNT(*) AS total FROM recipes WHERE status != 'deleted'";
    const values = [];

    if (status !== "all") {
      query += " AND status = $1";
      values.push(status);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }

  // Thêm hàm tìm kiếm công thức theo recipe_id, title, hoặc author với phân trang
  static async searchRecipesPaginated(search, status, limit, offset) {
    let query = `
      SELECT r.recipe_id, r.title, r.status, r.date_created, u.name AS author
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      WHERE (
        CAST(r.recipe_id AS TEXT) ILIKE $3 
        OR r.title ILIKE $3 
        OR u.name ILIKE $3
      )
    `;
    const values = [limit, offset, `%${search}%`];

    if (status !== "all") {
      query += " AND r.status = $4";
      values.push(status);
    }

    query += " ORDER BY r.recipe_id ASC LIMIT $1 OFFSET $2";
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Thêm hàm đếm số công thức khớp với từ khóa tìm kiếm
  static async countSearchRecipes(search, status) {
    let query = `
      SELECT COUNT(*) AS total 
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      WHERE (
        CAST(r.recipe_id AS TEXT) ILIKE $1 
        OR r.title ILIKE $1 
        OR u.name ILIKE $1
      )
    `;
    const values = [`%${search}%`];

    if (status !== "all") {
      query += " AND r.status = $2";
      values.push(status);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }  

  // Xóa công thức (cập nhật trạng thái thành deleted)
  static async deleteRecipe(recipeId) {
    try {
      const result = await pool.query(
        "UPDATE recipes SET status = 'deleted' WHERE recipe_id = $1 RETURNING *",
        [recipeId]
      );
      if (result.rowCount === 0) {
        throw new Error("Recipe not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting recipe: ${error.message}`);
    }
  }


  // Trong file recipeModel.js
  static async getRecipeDetails(recipeId) {
    try {
      // Lấy thông tin cơ bản của công thức và tên tác giả
      const recipeQuery = `
        SELECT r.*, u.name AS author
        FROM recipes r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.recipe_id = $1 AND r.status != 'deleted'
      `;
      const recipeResult = await pool.query(recipeQuery, [recipeId]);
      if (recipeResult.rowCount === 0) {
        throw new Error("Recipe not found or deleted");
      }
      const recipe = recipeResult.rows[0];

      // Lấy danh sách nguyên liệu
      const ingredientsQuery = `
        SELECT i.name, ri.amount, u.unit_name
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        JOIN units u ON ri.unit_id = u.unit_id
        WHERE ri.recipe_id = $1
      `;
      const ingredientsResult = await pool.query(ingredientsQuery, [recipeId]);
      const ingredients = ingredientsResult.rows;

      // Lấy các bước nấu ăn
      const stepsQuery = `
        SELECT step_number, description
        FROM recipe_steps
        WHERE recipe_id = $1
        ORDER BY step_number ASC
      `;
      const stepsResult = await pool.query(stepsQuery, [recipeId]);
      const steps = stepsResult.rows;

      return {
        recipe,
        ingredients,
        steps,
      };
    } catch (error) {
      throw new Error(`Error fetching recipe details: ${error.message}`);
    }
  }


  // Trong file recipeModel.js
  static async updateRecipeStatus(recipeId, status) {
    try {
      const validStatuses = ['pending', 'approved', 'rejected', 'deleted'];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value");
      }
      const result = await pool.query(
        "UPDATE recipes SET status = $1 WHERE recipe_id = $2 AND status != 'deleted' RETURNING *",
        [status, recipeId]
      );
      if (result.rowCount === 0) {
        throw new Error("Recipe not found or already deleted");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating recipe status: ${error.message}`);
    }
  }  
}

module.exports = RecipeModelAdmin;