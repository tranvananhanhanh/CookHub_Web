const pool = require("../config/db");
const fatSecretClient = require("../api/fatsecret"); // Import client mới

class RecipeModel {
  static async getAllRecipes() {
    const result = await pool.query("SELECT * FROM recipes WHERE user_id = 1");
    return result.rows;
  }

  // Thêm công thức mới
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
    return result.rows[0]; // Trả về recipe_id
  }

  static async createRecipeWithClient(client, { user_id, title, thumbnail, description, cooking_time, servings }) {
    const query = `
      INSERT INTO recipes (
        user_id, title, thumbnail, description, cooking_time, servings, status, date_created
      ) VALUES (
        $1, $2, $3, $4, $5, $6, DEFAULT, CURRENT_TIMESTAMP
      ) RETURNING recipe_id
    `;
    const values = [user_id, title, thumbnail, description, cooking_time, servings];
    const result = await client.query(query, values);
    return result.rows[0]; // Trả về recipe_id
  }

  // static async saveIngredient({ name }) {
  //   // Kiểm tra xem ingredient đã tồn tại chưa
  //   let result = await pool.query("SELECT ingredient_id FROM ingredients WHERE name = $1", [name]);
  //   if (result.rows.length > 0) {
  //     return result.rows[0].ingredient_id;
  //   }

  //   // Gọi API dinh dưỡng (giả sử dùng Edamam)
  //   let nutrition = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  //   try {
  //     const response = await fetch(
  //       `https://api.edamam.com/api/nutrition-data?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY&ingr=100g%20${encodeURIComponent(name)}`
  //     );
  //     const data = await response.json();
  //     nutrition = {
  //       calories: data.totalNutrients.ENERC_KCAL?.quantity || 0,
  //       protein: data.totalNutrients.PROCNT?.quantity || 0,
  //       fat: data.totalNutrients.FAT?.quantity || 0,
  //       carbs: data.totalNutrients.CHOCDF?.quantity || 0,
  //     };
  //   } catch (err) {
  //     console.warn(`Không lấy được dinh dưỡng cho ${name}:`, err.message);
  //   }

  //   result = await pool.query(
  //     `
  //     INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g)
  //     VALUES ($1, $2, $3, $4, $5)
  //     RETURNING ingredient_id
  //   `,
  //     [name, nutrition.calories, nutrition.protein, nutrition.fat, nutrition.carbs]
  //   );
  //   return result.rows[0].ingredient_id;
  // }

  // static async saveIngredient({ name }) {
  //   const fatSecretClient = require("../api/fatsecret");
  //   // Kiểm tra ingredient tồn tại
  //   const existing = await pool.query(
  //     `SELECT ingredient_id FROM ingredients WHERE name = $1`,
  //     [name]
  //   );
  //   if (existing.rows.length > 0) {
  //     return existing.rows[0].ingredient_id;
  //   }

  //   // Nếu không tồn tại, gọi API FatSecret
  //   let nutrition = {
  //     calories_per_100g: 0,
  //     protein_per_100g: 0,
  //     fat_per_100g: 0,
  //     carbs_per_100g: 0,
  //   };

  //   try {
  //     // Tìm ingredient
  //     const searchResult = await fatSecretClient.searchFood(name);
  //     const food = searchResult.foods?.food?.[0];
  //     if (!food) {
  //       console.warn(`No FatSecret data found for ingredient: ${name}`);
  //     } else {
  //       // Lấy thông tin chi tiết
  //       const foodDetails = await fatSecretClient.getFood(food.food_id);
  //       const serving = foodDetails.food?.servings?.serving?.[0];
  //       if (serving) {
  //         // Chuẩn hóa về per 100g
  //         const grams = parseFloat(serving.metric_serving_amount) || 100;
  //         const factor = 100 / grams;
  //         nutrition = {
  //           calories_per_100g: parseFloat(serving.calories) * factor || 0,
  //           protein_per_100g: parseFloat(serving.protein) * factor || 0,
  //           fat_per_100g: parseFloat(serving.fat) * factor || 0,
  //           carbs_per_100g: parseFloat(serving.carbohydrate) * factor || 0,
  //         };
  //       }
  //     }

  //     console.log(`FatSecret data for ${name}:`, nutrition);
  //   } catch (error) {
  //     console.error(`Error fetching FatSecret data for ${name}:`, error.message);
  //   }

  //   // Chèn ingredient mới
  //   const result = await pool.query(
  //     `INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g)
  //      VALUES ($1, $2, $3, $4, $5)
  //      RETURNING ingredient_id`,
  //     [
  //       name,
  //       nutrition.calories_per_100g,
  //       nutrition.protein_per_100g,
  //       nutrition.fat_per_100g,
  //       nutrition.carbs_per_100g,
  //     ]
  //   );
  //   return result.rows[0].ingredient_id;
  // }

  static async saveIngredient({ name }) {
    const client = await pool.connect(); // Sử dụng client riêng cho hàm này nếu không trong transaction
    try {
      return await this.saveIngredientWithClient(client, { name });
    } finally {
      client.release();
    }
  }

  // static async saveIngredientWithClient(client, { name }) {
  //   const fatSecretClient = require("../api/fatsecret");
  //   const existing = await client.query(
  //     `SELECT ingredient_id FROM ingredients WHERE name = $1`,
  //     [name]
  //   );
  //   if (existing.rows.length > 0) {
  //     return existing.rows[0].ingredient_id;
  //   }

  //   let nutrition = {
  //     calories_per_100g: 0,
  //     protein_per_100g: 0,
  //     fat_per_100g: 0,
  //     carbs_per_100g: 0,
  //   };

  //   try {
  //     const searchResult = await fatSecretClient.searchFood(name);
  //     const food = searchResult.foods?.food?.[0];
  //     if (!food) {
  //       console.warn(`No FatSecret data found for ingredient: ${name}`);
  //     } else {
  //       const foodDetails = await fatSecretClient.getFood(food.food_id);
  //       const serving = foodDetails.food?.servings?.serving?.[0];
  //       if (serving) {
  //         const grams = parseFloat(serving.metric_serving_amount) || 100;
  //         const factor = 100 / grams;
  //         nutrition = {
  //           calories_per_100g: parseFloat(serving.calories) * factor || 0,
  //           protein_per_100g: parseFloat(serving.protein) * factor || 0,
  //           fat_per_100g: parseFloat(serving.fat) * factor || 0,
  //           carbs_per_100g: parseFloat(serving.carbohydrate) * factor || 0,
  //         };
  //       }
  //     }
  //     console.log(`FatSecret data for ${name}:`, nutrition);
  //   } catch (error) {
  //     console.error(`Error fetching FatSecret data for ${name}:`, error.message);
  //   }

  //   const result = await client.query(
  //     `INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g)
  //      VALUES ($1, $2, $3, $4, $5)
  //      RETURNING ingredient_id`,
  //     [
  //       name,
  //       nutrition.calories_per_100g,
  //       nutrition.protein_per_100g,
  //       nutrition.fat_per_100g,
  //       nutrition.carbs_per_100g,
  //     ]
  //   );
  //   return result.rows[0].ingredient_id;
  // }

  // Phiên bản dùng transaction client
  static async saveIngredientWithClient(client, { name }) {
    // 1. Kiểm tra xem ingredient đã tồn tại và có đủ dữ liệu dinh dưỡng chưa
    const existing = await client.query(
      `SELECT ingredient_id, calories_per_100g
         FROM ingredients
         WHERE name = $1`,
      [name]
    );

    if (existing.rows.length > 0) {
      // Đã tồn tại, có thể kiểm tra xem dữ liệu dinh dưỡng có hợp lệ không (ví dụ > 0)
      // Nếu cần cập nhật lại dữ liệu, bạn có thể thêm logic ở đây
      console.log(`[DB Check] Ingredient "${name}" already exists with ID: ${existing.rows[0].ingredient_id}.`);
      return existing.rows[0].ingredient_id; // Trả về ID đã có
    }

    console.log(`[DB Check] Ingredient "${name}" not found. Fetching from FatSecret...`);
    // 2. Nếu chưa tồn tại, gọi API FatSecret
    let nutrition = {
      calories_per_100g: 0,
      protein_per_100g: 0,
      fat_per_100g: 0,
      carbs_per_100g: 0,
    };
    let selectedFoodId = null;

    try {
      // Bước 1: Tìm kiếm food_id
      const searchResult = await fatSecretClient.searchFood(name, 5); // Lấy 1 kết quả phù hợp nhất

      // Lấy food đầu tiên từ kết quả (có thể là object hoặc phần tử đầu của array)
      const foods = searchResult.foods?.food;
      let potentialFoods = foods ? (Array.isArray(foods) ? foods : [foods]) : [];
      // const food = foods ? (Array.isArray(foods) ? foods[0] : foods) : null;

      // if (!food || !food.food_id) {
      if (potentialFoods.length === 0) {
        console.warn(`[FatSecret] No matching food found for ingredient: "${name}"`);
        // Vẫn tiếp tục để lưu ingredient với giá trị dinh dưỡng = 0
      } else {
        console.log(`[FatSecret] Tìm thấy ${potentialFoods.length} kết quả tiềm năng cho "${name}":`, potentialFoods.map(f => ({ id: f.food_id, name: f.food_name, type: f.food_type })));

        // Ưu tiên Generic, sau đó là Brand, và tên khớp nhất (ví dụ đơn giản)
        let bestMatch = potentialFoods.find(f => f.food_type === 'Generic' && f.food_name.toLowerCase() === name.toLowerCase());
        if (!bestMatch) {
          bestMatch = potentialFoods.find(f => f.food_type === 'Generic');
        }
        // Nếu vẫn không có Generic, lấy kết quả đầu tiên
        if (!bestMatch && potentialFoods.length > 0) {
          bestMatch = potentialFoods[0];
        }

        if (bestMatch) {
          selectedFoodId = bestMatch.food_id;
          console.log(`[FatSecret] Đã chọn Food ID: ${selectedFoodId} ("${bestMatch.food_name}") từ kết quả tìm kiếm.`);
        } else {
          console.warn(`[FatSecret] Không thể chọn được food_id phù hợp từ kết quả tìm kiếm cho "${name}"`);
        }
        // console.log(`[FatSecret] Found food: "${food.food_name}" (ID: ${food.food_id}) for "${name}". Getting details...`);
        // // Bước 2: Lấy chi tiết dinh dưỡng bằng food_id
        // const foodDetails = await fatSecretClient.getFood(food.food_id);

        // // Bước 3: Chuẩn hóa dữ liệu về /100g
        // nutrition = fatSecretClient.normalizeNutritionTo100g(foodDetails);
        // console.log(`[FatSecret] Normalized nutrition for "${name}":`, nutrition);
      }

      // Bước 2: Lấy chi tiết dinh dưỡng nếu đã chọn được food_id
      if (selectedFoodId) {
        console.log(`[FatSecret] Lấy chi tiết cho food_id: ${selectedFoodId}`);
        const foodDetails = await fatSecretClient.getFood(selectedFoodId);
        // Bước 3: Chuẩn hóa dữ liệu về /100g
        nutrition = fatSecretClient.normalizeNutritionTo100g(foodDetails);
        console.log(`[FatSecret] Dinh dưỡng đã chuẩn hóa cho "${name}" (từ ID ${selectedFoodId}):`, nutrition);
      } else {
        console.warn(`[FatSecret] Bỏ qua lấy chi tiết dinh dưỡng vì không chọn được food_id cho "${name}".`);
      }
    } catch (error) {
      // Ghi log lỗi từ FatSecret nhưng không dừng việc lưu ingredient
      console.error(`[FatSecret Error] Failed to fetch nutrition data for "${name}": ${error.message}. Saving ingredient with default nutrition values.`);
      // nutrition vẫn giữ giá trị mặc định là 0
    }

    // 3. Chèn ingredient mới vào DB với thông tin dinh dưỡng (hoặc giá trị 0 nếu lỗi)
    console.log(`[DB Insert] Inserting new ingredient "${name}" with nutrition:`, nutrition);
    const result = await client.query(
      `INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO NOTHING -- Đề phòng trường hợp race condition
         RETURNING ingredient_id`,
      [
        name,
        nutrition.calories_per_100g,
        nutrition.protein_per_100g,
        nutrition.fat_per_100g,
        nutrition.carbs_per_100g,
      ]
    );

    if (result.rows.length > 0) {
      console.log(`[DB Insert] Successfully inserted "${name}" with ID: ${result.rows[0].ingredient_id}`);
      return result.rows[0].ingredient_id;
    } else {
      // Trường hợp ON CONFLICT DO NOTHING xảy ra (cực hiếm nếu check ban đầu đúng)
      console.warn(`[DB Insert] Ingredient "${name}" likely already existed despite initial check (ON CONFLICT). Fetching ID again.`);
      const finalCheck = await client.query(`SELECT ingredient_id FROM ingredients WHERE name = $1`, [name]);
      if (finalCheck.rows.length > 0) {
        return finalCheck.rows[0].ingredient_id;
      } else {
        // Lỗi không mong muốn
        throw new Error(`Failed to insert or retrieve ingredient ID for "${name}" after FatSecret fetch.`);
      }
    }
  }

  static async saveRecipeIngredient({ recipe_id, ingredient_id, amount, unit_id }) {
    await pool.query(
      `
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit_id)
      VALUES ($1, $2, $3, $4)
    `,
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
      `
      INSERT INTO recipe_steps (recipe_id, step_number, description)
      VALUES ($1, $2, $3)
    `,
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
      `
      INSERT INTO recipe_images (recipe_id, image_url)
      VALUES ($1, $2)
    `,
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

  // static async getUnits() {
  //   const result = await pool.query("SELECT unit_name FROM units");
  //   return result.rows.map((row) => row.unit_name);
  // }

  static async updateRecipeThumbnail(client, recipe_id, thumbnail_filename) {
    const query = "UPDATE recipes SET thumbnail = $1 WHERE recipe_id = $2";
    await client.query(query, [thumbnail_filename, recipe_id]);
    console.log(`[Cập nhật DB] Đã cập nhật thumbnail cho công thức ${recipe_id} thành ${thumbnail_filename}`);
  }
}

module.exports = RecipeModel;