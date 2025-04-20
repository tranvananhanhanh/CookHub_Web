const pool = require("../config/db");

class UserModel {
  static async getAllUsers() {
    const result = await pool.query("SELECT * FROM users ORDER BY user_id ASC");
    return result.rows;
  }

  // Lấy user theo phân trang
  static async getUsersPaginated(limit, offset) {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY user_id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  }

  // Đếm tổng số user để tính số trang
  static async countUsers() {
    const result = await pool.query("SELECT COUNT(*) AS total FROM users");
    return parseInt(result.rows[0].total);
  }

  // Lấy user theo trạng thái (All, Active, Banned) với phân trang
  static async getUsersByStatusPaginated(status, limit, offset) {
    let query = "SELECT * FROM users";
    const values = [limit, offset];

    if (status === "active") {
      query += " WHERE is_banned = FALSE";
    } else if (status === "banned") {
      query += " WHERE is_banned = TRUE";
    }

    query += " ORDER BY user_id ASC LIMIT $1 OFFSET $2";
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Thêm hàm tìm kiếm users theo user_id, name, hoặc email với phân trang
  static async searchUsersPaginated(search, status, limit, offset) {
    let query = `
      SELECT user_id, name, email, is_banned, created_at 
      FROM users
      WHERE (
        CAST(user_id AS TEXT) ILIKE $3 
        OR name ILIKE $3 
        OR email ILIKE $3
      )
    `;
    const values = [limit, offset, `%${search}%`];

    if (status !== "all") {
      query += " AND is_banned = $4";
      values.push(status === "banned");
    }

    query += " ORDER BY user_id ASC LIMIT $1 OFFSET $2";
    const result = await pool.query(query, values);
    return result.rows;
  }

  // Thêm hàm đếm số users khớp với từ khóa tìm kiếm
  static async countSearchUsers(search, status) {
    let query = `
      SELECT COUNT(*) AS total 
      FROM users 
      WHERE (
        CAST(user_id AS TEXT) ILIKE $1 
        OR name ILIKE $1 
        OR email ILIKE $1
      )
    `;
    const values = [`%${search}%`];

    if (status !== "all") {
      query += " AND is_banned = $2";
      values.push(status === "banned");
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }

  // Đếm số user theo trạng thái để tính số trang
  static async countUsersByStatus(status) {
    let query = "SELECT COUNT(*) AS total FROM users";
    const values = [];

    if (status === "active") {
      query += " WHERE is_banned = FALSE";
    } else if (status === "banned") {
      query += " WHERE is_banned = TRUE";
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }

  static async deleteUser(userId) {
    try {
      const result = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING *", [userId]);
      if (result.rowCount === 0) {
        throw new Error("User not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Lấy thông tin chi tiết của người dùng
  static async getUserDetails(userId) {
    try {
      const userQuery = "SELECT * FROM users WHERE user_id = $1";
      const userResult = await pool.query(userQuery, [userId]);
      if (userResult.rowCount === 0) {
        throw new Error("User not found");
      }
      const user = userResult.rows[0];

      const socialQuery = "SELECT platform, url FROM user_social_links WHERE user_id = $1";
      const socialResult = await pool.query(socialQuery, [userId]);
      const socialLinks = socialResult.rows;

      const recipeStatsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN status = 'deleted' THEN 1 END) as deleted
        FROM recipes
        WHERE user_id = $1
      `;
      const recipeStatsResult = await pool.query(recipeStatsQuery, [userId]);
      const recipeStats = recipeStatsResult.rows[0];

      const ratingQuery = `
        SELECT AVG(rate) as avg_rating
        FROM ratings r
        JOIN recipes rec ON r.recipe_id = rec.recipe_id
        WHERE rec.user_id = $1
      `;
      const ratingResult = await pool.query(ratingQuery, [userId]);
      const avgRating = ratingResult.rows[0].avg_rating || 0;

      const savedQuery = `
        SELECT COUNT(*) as saved_count
        FROM saved_recipes sr
        JOIN recipes rec ON sr.recipe_id = rec.recipe_id
        WHERE rec.user_id = $1
      `;
      const savedResult = await pool.query(savedQuery, [userId]);
      const savedCount = savedResult.rows[0].saved_count;

      const recipesQuery = "SELECT recipe_id, title, status FROM recipes WHERE user_id = $1";
      const recipesResult = await pool.query(recipesQuery, [userId]);
      const recipes = recipesResult.rows;

      return {
        user,
        socialLinks,
        recipeStats: {
          total: recipeStats.total,
          pending: recipeStats.pending,
          approved: recipeStats.approved,
          rejected: recipeStats.rejected,
          deleted: recipeStats.deleted,
          avgRating: parseFloat(avgRating).toFixed(1),
          savedCount,
        },
        recipes,
      };
    } catch (error) {
      throw new Error(`Error fetching user details: ${error.message}`);
    }
  }

  static async updateUserStatus(userId, isBanned) {
    try {
      const result = await pool.query(
        "UPDATE users SET is_banned = $1 WHERE user_id = $2 RETURNING *",
        [isBanned, userId]
      );
      if (result.rowCount === 0) {
        throw new Error("User not found");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user status: ${error.message}`);
    }
  }
}

module.exports = UserModel;