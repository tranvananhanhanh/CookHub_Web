const pool = require("../config/db");

class RecipeModel {
  static async getRecipesWithRatingsAndComments(userId) {
    const result = await pool.query(`
      SELECT 
        r.*,
        COALESCE(AVG(ra.rate)::numeric(3,1), 0) as average_rating,
        COALESCE(COUNT(c.comment_id), 0) as comment_count
      FROM recipes r
      LEFT JOIN ratings ra ON r.recipe_id = ra.recipe_id
      LEFT JOIN comments c ON r.recipe_id = c.recipe_id
      WHERE r.user_id = $1
      GROUP BY r.recipe_id
    `, [userId]);
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

  static async getAllRecipes() {
    const result = await pool.query("SELECT * FROM recipes WHERE user_id = 1");
    return result.rows;
  }

  static async createRecipe({ user_id, title, thumbnail, description, cooking_time, servings }) {
    const query = `
        INSERT INTO recipes (
            user_id, title, thumbnail, description, cooking_time, servings, status, date_created
        ) VALUES (
            $1, $2, $3, $4, $5, $6, DEFAULT, CURRENT_TIMESTAMP
        ) RETURNING recipe_id
    `;
    const values = [user_id, title, thumbnail, description, cooking_time, servings];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createRecipeWithClient(client, { user_id, title, description, cooking_time, servings }) {
    const query = `
        INSERT INTO recipes (
            user_id, title, thumbnail, description, cooking_time, servings, status, date_created
        ) VALUES (
            $1, $2, 'thumbnail', $3, $4, $5, DEFAULT, CURRENT_TIMESTAMP
        ) RETURNING recipe_id
    `;
    const values = [user_id, title, description, cooking_time, servings];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async saveIngredient({ name }) {
    const client = await pool.connect();
    try {
      return await this.saveIngredientWithClient(client, { name });
    } finally {
      client.release();
    }
  }

  static async saveIngredientWithClient(client, { name }) {
    const existing = await client.query(
      `SELECT ingredient_id
         FROM ingredients
         WHERE name = $1`,
      [name]
    );

    if (existing.rows.length > 0) {
      console.log(`[DB Check] Ingredient "${name}" already exists with ID: ${existing.rows[0].ingredient_id}.`);
      return existing.rows[0].ingredient_id;
    }

    console.log(`[DB Insert] Inserting new ingredient "${name}".`);
    const result = await client.query(
      `INSERT INTO ingredients (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING
         RETURNING ingredient_id`,
      [name]
    );

    console.log(`[DB Insert] Result rows length: ${result.rows.length}`);
    if (result.rows.length > 0) {
      console.log(`[DB Insert] Successfully inserted "${name}" with ID: ${result.rows[0].ingredient_id}`);
      return result.rows[0].ingredient_id;
    } else {
      console.warn(`[DB Insert] Ingredient "${name}" likely already existed despite initial check (ON CONFLICT). Fetching ID again.`);
      const finalCheck = await client.query(`SELECT ingredient_id FROM ingredients WHERE name = $1`, [name]);
      console.log(`[DB Insert] Final check rows length: ${finalCheck.rows.length}`);
      if (finalCheck.rows.length > 0) {
        return finalCheck.rows[0].ingredient_id;
      } else {
        throw new Error(`Failed to insert or retrieve ingredient ID for "${name}"`);
      }
    }
  }

  static async saveRecipeIngredient({ recipe_id, ingredient_id, amount, unit_id }) {
    await pool.query(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit_id)
         VALUES ($1, $2, $3, $4)`,
      [recipe_id, ingredient_id, amount, unit_id]
    );
  }

  static async saveRecipeIngredientWithClient(client, { recipe_id, ingredient_id, amount, unit_id }) {
    await client.query(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit_id)
         VALUES ($1, $2, $3, $4)`,
      [recipe_id, ingredient_id, amount, unit_id]
    );
  }

  static async saveRecipeStep({ recipe_id, step_number, description }) {
    await pool.query(
      `INSERT INTO recipe_steps (recipe_id, step_number, description)
         VALUES ($1, $2, $3)`,
      [recipe_id, step_number, description]
    );
  }

  static async saveRecipeStepWithClient(client, { recipe_id, step_number, description }) {
    await client.query(
      `INSERT INTO recipe_steps (recipe_id, step_number, description)
         VALUES ($1, $2, $3)`,
      [recipe_id, step_number, description]
    );
  }

  static async saveRecipeImage({ recipe_id, image_url }) {
    await pool.query(
      `INSERT INTO recipe_images (recipe_id, image_url)
         VALUES ($1, $2)`,
      [recipe_id, image_url]
    );
  }

  static async saveRecipeImageWithClient(client, { recipe_id, image_url }) {
    await client.query(
      `INSERT INTO recipe_images (recipe_id, image_url)
         VALUES ($1, $2)`,
      [recipe_id, image_url]
    );
  }

  static async updateRecipeThumbnail(client, recipe_id, thumbnail_filename) {
    const query = "UPDATE recipes SET thumbnail = $1 WHERE recipe_id = $2";
    await client.query(query, [thumbnail_filename, recipe_id]);
    console.log(`[Cập nhật DB] Đã cập nhật thumbnail cho công thức ${recipe_id} thành ${thumbnail_filename}`);
  }
}

module.exports = RecipeModel;