const pool = require("../config/db");

class UserModel {
  static async getUserByIdWithSocialLinks(userId) {
    // Lấy thông tin người dùng
    const userResult = await pool.query(`
      SELECT *
      FROM users
      WHERE user_id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return [];
    }

    // Lấy liên kết mạng xã hội
    const socialLinksResult = await pool.query(`
      SELECT platform, url
      FROM user_social_links
      WHERE user_id = $1
    `, [userId]);

    // Kết hợp dữ liệu
    const user = userResult.rows[0];
    user.social_links = socialLinksResult.rows;

    // Lấy thống kê người dùng
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM recipes WHERE user_id = $1 AND status = 'approved') AS total_recipes,
        (SELECT COUNT(sr.recipe_id) 
         FROM saved_recipes sr 
         JOIN recipes r ON sr.recipe_id = r.recipe_id 
         WHERE r.user_id = $1) AS total_saves_received,
        (SELECT COUNT(rt.recipe_id) 
         FROM ratings rt 
         JOIN recipes r ON rt.recipe_id = r.recipe_id 
         WHERE r.user_id = $1) AS total_ratings_received,
        (SELECT COUNT(c.recipe_id) 
         FROM comments c 
         JOIN recipes r ON c.recipe_id = r.recipe_id 
         WHERE r.user_id = $1) AS total_comments_received
    `, [userId]);

    if (statsResult.rows.length > 0) {
      user.stats = statsResult.rows[0];
    } else {
      // Fallback if the stats query somehow fails to return a row (shouldn't happen with COUNTs)
      user.stats = {
        total_recipes: 0,
        total_saves_received: 0,
        total_ratings_received: 0,
        total_comments_received: 0
      };
    }
    return [user];
  }
}

module.exports = UserModel;