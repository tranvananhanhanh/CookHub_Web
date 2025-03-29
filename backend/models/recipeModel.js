const pool = require("../config/db");

class RecipeModel {
  static async getAllRecipes() {
    const result = await pool.query("SELECT * FROM recipes WHERE user_id = 1");
    return result.rows;
  }
}

module.exports = RecipeModel;