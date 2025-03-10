const pool = require("../config/db");

class RecipeModel {
  static async getAllRecipes() {
    const result = await pool.query("SELECT * FROM recipes");
    return result.rows;
  }
}

module.exports = RecipeModel;
