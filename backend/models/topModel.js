const pool = require("../config/db");
class TopModel {
  static async getTopRatedRecipes() {
    const query = `
    SELECT 
    RANK() OVER (
        ORDER BY 
            ROUND(AVG(rt.rate)::numeric, 2) DESC,
            COUNT(rt.rate) DESC,
            r.title ASC
    ) AS position,
    r.recipe_id,
    r.title,
    r.thumbnail,
    r.description,
    r.user_id,
    r.cooking_time,
    u.name AS author_name,
    SUM(rt.rate) AS total_stars,
    COUNT(rt.rate) AS total_ratings,
    ROUND(AVG(rt.rate)::numeric, 2) AS average_rating
FROM recipes r
JOIN ratings rt ON r.recipe_id = rt.recipe_id
JOIN users u ON r.user_id = u.user_id
GROUP BY r.recipe_id, r.title, r.thumbnail, r.description, r.user_id, u.name
ORDER BY average_rating DESC, total_ratings DESC, r.title ASC
LIMIT 5;
    `;
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }
  static async getTopCheft() {
    const query = `
        SELECT 
        RANK() OVER (ORDER BY ROUND(AVG(rt.rate)::numeric, 2) DESC, COUNT(rt.rate) DESC) AS position,
        u.user_id,
        u.name,
        u.avatar,
        COUNT(DISTINCT r.recipe_id) AS total_recipes,
        COUNT(rt.rate) AS total_ratings,
        ROUND(AVG(rt.rate)::numeric, 2) AS average_rating
    FROM users u
    JOIN recipes r ON u.user_id = r.user_id
    JOIN ratings rt ON r.recipe_id = rt.recipe_id
    GROUP BY u.user_id, u.name, u.avatar
    HAVING COUNT(rt.rate) > 0
    ORDER BY position;
    `;
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }
}

module.exports = TopModel;
