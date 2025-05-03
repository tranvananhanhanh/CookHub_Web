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

    // <<< SỬA: Thêm kiểm tra lưu bởi user hiện tại <<<
    const savedCheckSubquery = userId
        ? `LEFT JOIN saved_recipes sr ON r.recipe_id = sr.recipe_id AND sr.user_id = $${paramIndex++}`
        : '';
    if (userId) {
        queryParams.push(userId);
    }
    const isSavedSelect = userId ? `, (sr.user_id IS NOT NULL) AS is_saved_by_current_user` : ', FALSE AS is_saved_by_current_user';
    // >>>>>

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
    let joinClauses = ` LEFT JOIN ratings rt ON r.recipe_id = rt.recipe_id ${savedCheckSubquery} `;
    // let joinClauses = ` LEFT JOIN ratings rt ON r.recipe_id = rt.recipe_id `;
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
     * @param {number|null} userId - ID của người dùng đang đăng nhập (hoặc null).
     * @returns {Promise<Array<object>>} - Mảng các object công thức { recipe_id, title, thumbnail, cooking_time }.
     */
  static async getRecipesByIds(recipeIds, userId){
    console.log(`RecipeModel.getRecipesByIds called with IDs: ${recipeIds}, userId: ${userId}`);
    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return[];
    }

    let queryParams = [recipeIds];
    let paramIndex = 2;

    // <<< SỬA: Thêm LEFT JOIN và SELECT cho trạng thái lưu <<<
    const savedCheckJoin = userId
        ? `LEFT JOIN saved_recipes sr ON r.recipe_id = sr.recipe_id AND sr.user_id = $${paramIndex}`
        : '';
    const isSavedSelect = userId ? `, (sr.user_id IS NOT NULL) AS is_saved_by_current_user` : ', FALSE AS is_saved_by_current_user';
    if (userId) {
        queryParams.push(userId);
        paramIndex++;
    }
    // >>>>>

    const query = `
      SELECT
        r.recipe_id, r.title, r.thumbnail, r.cooking_time, r.description
        ${isSavedSelect} -- <<< SỬA: Thêm trường is_saved
      FROM recipes r
      ${savedCheckJoin} -- <<< SỬA: Thêm join kiểm tra lưu
      WHERE r.recipe_id = ANY($1::int[]) AND r.status = 'approved'
    `;

    try {
      const result = await pool.query(query, queryParams);

      // Sắp xếp kết quả theo thứ tự của recipeIds đầu vào
      const resultMap = new Map(result.rows.map(recipe => [recipe.recipe_id, {
        ...recipe,
        // <<< SỬA: Đảm bảo is_saved là boolean <<<
        isSavedByCurrentUser: recipe.is_saved_by_current_user === true
        // >>>>>
    }]));
    const sortedResults = recipeIds.map(id => resultMap.get(id)).filter(Boolean); // filter(Boolean) loại bỏ các recipe không tìm thấy (nếu có)
      return sortedResults;
    } catch(err){
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
     * @param {number|null} userId - ID của người dùng đang đăng nhập (hoặc null).
     * @returns {Promise<Array<object>>} - Mảng các object công thức.
     */
  static async getRecipesByIngredients(ingredientId, limit = 10, userId = null){
    console.log(`RecipeModel.getRecipesByIngredients called with ingredientId: ${ingredientId}, limit: ${limit}, , userId: ${userId}`);

    let queryParams = [ingredientId, limit];
    let paramIndex = 3; // Bắt đầu từ $3

    // <<< SỬA: Thêm LEFT JOIN và SELECT cho trạng thái lưu <<<
    const savedCheckJoin = userId
        ? `LEFT JOIN saved_recipes sr ON r.recipe_id = sr.recipe_id AND sr.user_id = $${paramIndex}`
        : '';
    const isSavedSelect = userId ? `, (sr.user_id IS NOT NULL) AS is_saved_by_current_user` : ', FALSE AS is_saved_by_current_user';
    if (userId) {
        queryParams.push(userId);
        paramIndex++;
    }
    // >>>>>

    const query = `
    WITH RecipeAvgRating AS (
        SELECT
            recipe_id,
            COALESCE(AVG(rate), 0.0) as avg_rating
        FROM ratings
        GROUP BY recipe_id
    )
    SELECT DISTINCT -- Dùng DISTINCT vì join với recipe_ingredients có thể tạo bản sao
        r.recipe_id,
        r.title,
        r.thumbnail,
        r.cooking_time,
        r.date_created,
        u.name AS user_name,
        u.avatar AS user_avatar,
        COALESCE(rat.avg_rating, 0.0) AS avg_rating -- Lấy từ CTE
        ${isSavedSelect} -- <<< SỬA: Thêm trường is_saved
    FROM recipes r
    JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
    JOIN users u ON r.user_id = u.user_id
    LEFT JOIN RecipeAvgRating rat ON r.recipe_id = rat.recipe_id -- Join với CTE rating
    ${savedCheckJoin} -- <<< SỬA: Thêm join kiểm tra lưu
    WHERE ri.ingredient_id = $1
      AND r.status = 'approved'
    ORDER BY r.date_created DESC
    LIMIT $2;
`;
// >>>>>
  //lau cac goa tri recipe theo ingredient id
  //coalesce(avg, 0.0) => neu recipe chua dduoc danh gia thi hien thi danh gia 0.0
    try {
      const result = await pool.query(query, queryParams);

      const recipesWithAvgRating = result.rows.map(recipe => 
      ({
        ...recipe,
        avg_rating: parseFloat(recipe.avg_rating),
        isSavedByCurrentUser: recipe.is_saved_by_current_user === true
      }))
      return recipesWithAvgRating;
    } catch (err) {
      console.error(`Error fetching recipes by ingredients: ID(${ingredientId}) in Model:`, err.stack);
      throw err;
    }
  }

}



module.exports = RecipeModel;
