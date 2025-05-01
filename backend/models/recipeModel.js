const pool = require("../config/db");

class RecipeModel {
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

    const result = await pool.query("SELECT * FROM recipes WHERE user_id = 1");
    return result.rows;
  }

  static async searchRecipes(filters = {}) {
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

  static async getCategoriesByType(type) {
    console.log(`RecipeModel.getCategoriesByType called with type: ${type}`);
    if (!type) {
      // Có thể thêm validation ở đây hoặc để route xử lý
      throw new Error("Type is required to get categories.");
    }
    // Đổi tên cột để tiện cho frontend (id, name)
    const query = `
        SELECT category_id AS id, category_name AS name
        FROM categories
        WHERE type = $1
        ORDER BY name
    `;
    try {
      const result = await pool.query(query, [type]);
      return result.rows; // Chỉ trả về dữ liệu
    } catch (err) {
      console.error(`Error fetching categories (type: ${type}) in Model`, err.stack);
      throw err; // Ném lỗi để route xử lý
    }
  }

  /**
     * Lấy danh sách công thức theo mảng các recipe_id.
     * Đảm bảo chỉ lấy các công thức đã được 'approved'.
     * @param {number[]} recipeIds - Mảng các ID công thức cần lấy.
     * @returns {Promise<Array<object>>} - Mảng các object công thức { recipe_id, title, thumbnail, cooking_time }.
     */
  static async getRecipesByIds(recipeIds) {
    console.log(`RecipeModel.getRecipesByIds called with IDs: ${recipeIds}`);
    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return [];
    }

    const query = `
      SELECT 
        recipe_id, title, thumbnail, cooking_time, description
      FROM recipes
      WHERE recipe_id = ANY($1::int[]) AND status = 'approved'
    `

    try {
      const result = await pool.query(query, [recipeIds]);

      const resultMap = new Map(result.rows.map(recipe => [recipe.recipe_id, recipe]));
      const sortedResults = recipeIds.map(id => resultMap.get(id)).filter(Boolean);
      return sortedResults;
    } catch (err) {
      console.error('Error fetching recipes by IDs in model:', err.stack);
      throw err;
    }
  }

  /**
     * Lấy danh sách công thức chứa một ingredient cụ thể.
     * Bao gồm thông tin người đăng (avatar) và rating trung bình.
     * Sắp xếp theo ngày tạo mới nhất, giới hạn số lượng.
     * Chỉ lấy công thức 'approved'.
     * @param {number} ingredientId - ID của nguyên liệu.
     * @param {number} limit - Số lượng công thức tối đa.
     * @returns {Promise<Array<object>>} - Mảng các object công thức.
     */
  static async getRecipesByIngredients(ingredientId, limit = 10) {
    console.log(`RecipeModel.getRecipesByIngredients called with ingredientId: ${ingredientId}, limit: ${limit}`);
    const query = `
      SELECT DISTINCT
                r.recipe_id,
                r.title,
                r.thumbnail,
                r.cooking_time,
                r.date_created,
                u.name AS user_name,
                u.avatar AS user_avatar, -- Lấy avatar từ bảng users
                COALESCE(AVG(rt.rate) OVER (PARTITION BY r.recipe_id), 0.0) AS avg_rating -- Tính rating trung bình
            FROM recipes r
            JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
            JOIN users u ON r.user_id = u.user_id -- Join với bảng users
            LEFT JOIN ratings rt ON r.recipe_id = rt.recipe_id -- Left Join với ratings
            WHERE ri.ingredient_id = $1
              AND r.status = 'approved' -- Chỉ lấy công thức đã duyệt
            ORDER BY r.date_created DESC
            LIMIT $2;
        `;
    //lau cac goa tri recipe theo ingredient id
    //coalesce(avg, 0.0) => neu recipe chua dduoc danh gia thi hien thi danh gia 0.0
    try {
      const result = await pool.query(query, [ingredientId, limit]);

      const recipesWithAvgRating = result.rows.map(recipe =>
      ({
        ...recipe,
        avg_rating: parseFloat(recipe.avg_rating)
      }))
      return recipesWithAvgRating;
    } catch (err) {
      console.error(`Error fetching recipes by ingredients: ID(${ingredientId}) in Model:`, err.stack);
      throw err;
    }
  }

  static async getCommonIngredients() {
    console.log("RecipeModel.getCommonIngredients called");
    // Lấy top N ingredients được dùng nhiều nhất
    const query = `
       SELECT
           i.ingredient_id AS id,
           i.name AS name
           -- ,COUNT(ri.recipe_id) as usage_count -- Uncomment để debug
       FROM ingredients i
       JOIN recipe_ingredients ri ON i.ingredient_id = ri.ingredient_id
       GROUP BY i.ingredient_id, i.name
       ORDER BY COUNT(ri.recipe_id) DESC -- Sắp xếp theo tần suất sử dụng
       LIMIT 5; -- Giới hạn số lượng trả về (có thể điều chỉnh)
    `;
    try {
      const result = await pool.query(query);
      return result.rows; // Chỉ trả về dữ liệu
    } catch (err) {
      console.error('Error fetching common ingredients in Model:', err.stack);
      throw err; // Ném lỗi để route xử lý
    }
  }

}

module.exports = RecipeModel;