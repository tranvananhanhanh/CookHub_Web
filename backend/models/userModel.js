const pool = require("../config/db");

class UserModel {
  static async getUserInfo() {
    const result = await pool.query("SELECT * FROM users WHERE user_id = 1");
    return result.rows;
  }
}

module.exports = UserModel;