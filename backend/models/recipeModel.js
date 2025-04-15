const pool = require("../config/db");

class RecipeModel {
  static async getAllRecipes() {
    const result = await pool.query("SELECT * FROM recipes");
    return result.rows;
  }

  static async searchRecipes (filters = {}) {
    console.log("RecipeModel.searchRecipes called with filters:", filters);
    const {
      search = null,
      categoryIds = [],
      ingredientIds = [],
      maxTime = null,
      servingsFilter = null,
      minRating = null,
      status = 'approved' // Mặc định luôn lọc approved
    } = filters;
    let queryParams = [];
    let paramIndex = 1;
    let baseSelect = `
            SELECT DISTINCT
                r.recipe_id, r.title, r.thumbnail, r.description,
                r.cooking_time, r.servings,
                r.date_created,
                r.user_id,
                u.name as user_name,
                COALESCE(AVG(rt.rate), 0.0) AS avg_rating
        `;
    let fromClause = ` FROM recipes r JOIN users u ON r.user_id = u.user_id  `;
    let joinClauses = ` LEFT JOIN ratings rt ON r.recipe_id = rt.recipe_id `;
    let whereClauses = []; // Bắt đầu mảng rỗng
    let groupByClause = ` GROUP BY r.recipe_id, r.user_id, u.name, r.title, r.thumbnail, r.description, r.cooking_time, r.servings, r.date_created `;
    let havingClauses = [];

    if (status) {
      whereClauses.push(`r.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      //Xem xet viec tim kiem trong description
      whereClauses.push(`(LOWER(r.title) LIKE $${paramIndex} OR LOWER(u.name) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (maxTime && !isNaN(parseInt(maxTime)) && parseInt(maxTime) > 0) {
      whereClauses.push(`r.cooking_time < $${paramIndex}`);
      queryParams.push(parseInt(maxTime));
      paramIndex++;
    }

    if (servingsFilter && !isNaN(parseInt(servingsFilter)) && parseInt(servingsFilter) > 0) {
      const servingsValue = parseInt(servingsFilter);
      if (servingsValue >= 1 && servingsValue <= 4) {
          // Lọc chính xác cho 1, 2, 3 người
          whereClauses.push(`r.servings = $${paramIndex}`);
          queryParams.push(servingsValue);
          paramIndex++;
      } else if (servingsValue === 5) {
          // Lọc từ 4 người trở lên khi chọn '4+' (giả định giá trị là 5)
          whereClauses.push(`r.servings >= $${paramIndex}`);
          queryParams.push(servingsValue); // Vẫn dùng số 5 làm mốc dưới
    }
  }

    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      joinClauses += ` JOIN recipe_categories rc ON r.recipe_id = rc.recipe_id `;
      whereClauses.push(`rc.category_id = ANY($${paramIndex}::int[])`);
      queryParams.push(categoryIds);
      paramIndex++;

      groupByClause = ` GROUP BY r.recipe_id, r.user_id, u.name, r.title, r.thumbnail, r.description, r.cooking_time, r.servings, r.date_created `;
      havingClauses.push(`COUNT(DISTINCT rc.category_id) = ${categoryIds.length}`);
    }

    if (Array.isArray(ingredientIds) && ingredientIds.length > 0) {
      joinClauses += ` JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id `;
      whereClauses.push(`ri.ingredient_id = ANY($${paramIndex}::int[])`);
      queryParams.push(ingredientIds);
      paramIndex++;

      groupByClause = ` GROUP BY r.recipe_id, r.user_id, u.name, r.title, r.thumbnail, r.description, r.cooking_time, r.servings, r.date_created `;
      havingClauses.push(`COUNT(DISTINCT ri.ingredient_id) = ${ingredientIds.length}`);
      }

      if (minRating && !isNaN(parseInt(minRating)) && parseInt(minRating) >= 1 && parseInt(minRating) <= 5) {
        havingClauses.push(`AVG(rt.rate) >= $${paramIndex}`);
        queryParams.push(parseInt(minRating));
        paramIndex++;
      }


      let finalQuery = baseSelect + fromClause + joinClauses;
        if (whereClauses.length > 0) {
            finalQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        finalQuery += groupByClause;
        if (havingClauses.length > 0) {
          finalQuery += ` HAVING ${havingClauses.join(' AND ')}`; // Nối các điều kiện HAVING nếu có
        }

        finalQuery += ` ORDER BY r.date_created DESC`;

    console.log("Model Executing Query:", finalQuery);
    console.log("Model Parameters:", queryParams);
    
    try {
      const result = await pool.query(finalQuery, queryParams);
      const recipesWithAvgRating = result.rows.map(recipe => ({
        ...recipe,
        avg_rating: parseFloat(recipe.avg_rating) // Chuyển đổi sang kiểu số thực
    }));
    return recipesWithAvgRating;
    } catch (err) {
      console.error('Error in RecipeModel.searchRecipes:', err.stack);
      throw err; // Ném lỗi để route có thể bắt và xử lý
    }

  }
}

module.exports = RecipeModel;
