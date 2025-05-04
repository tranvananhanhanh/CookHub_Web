const pool = require("../config/db");

class UserModel {
  // static async getUserInfo() {
  //   const result = await pool.query("SELECT * FROM users WHERE user_id = 1");
  //   return result.rows;
  // }

  static async getUserByIdWithSocialLinks(userId) {
    // Lấy thông tin người dùng
    const userResult = await pool.query(`
      SELECT user_id, random_code, name, email, avatar, profile_background
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

    return [user];
  }
}

module.exports = UserModel;