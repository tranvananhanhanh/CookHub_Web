const pool = require('../config/db');

class CaloModel {
  static async getRecipesByStatus(status) {
    status = status.toLowerCase();

    let query = "";

    switch (status) {
      case "obese":
        query = "SELECT * FROM recipes WHERE calories < 200";
        break;
      case "normal":
        query = "SELECT * FROM recipes WHERE calories BETWEEN 200 AND 500";
        break;
      case "underweight":
        query = "SELECT * FROM recipes WHERE calories >500";
        break;
      default:
        throw new Error("Invalid status");
    }

    try {
      const result = await pool.query(query); // Use pool.query() for PostgreSQL
      return result.rows;  // Access rows directly
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CaloModel;