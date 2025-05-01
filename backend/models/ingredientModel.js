const pool = require("../config/db"); // Sử dụng pool kết nối CSDL

class ingredientModel {
  /**
   * Lấy danh sách các nguyên liệu phổ biến (dùng nhiều nhất)
   * @param {number} limit - Số lượng nguyên liệu tối đa cần lấy
   * @returns {Promise<Array<object>>} - Mảng các object ingredient { id, name }
   */
  static async getCommonIngredients(limit = 5) { // Thêm tham số limit với giá trị mặc định
    console.log(`ingredientModel.getCommoningredients called with limit: ${limit}`);
    const query = `
       SELECT
           i.ingredient_id AS id,
           i.name AS name
           -- ,COUNT(ri.recipe_id) as usage_count -- Uncomment để debug
       FROM ingredients i
       JOIN recipe_ingredients ri ON i.ingredient_id = ri.ingredient_id
       GROUP BY i.ingredient_id, i.name
       ORDER BY COUNT(ri.recipe_id) DESC -- Sắp xếp theo tần suất sử dụng
       LIMIT $1; -- Giới hạn số lượng trả về (có thể điều chỉnh)
    `;
    try {
        const result = await pool.query(query, [limit]); // Truyền limit vào query
        return result.rows; // Chỉ trả về dữ liệu
    } catch (err) {
        console.error('Error fetching common ingredients in ingredientModel:', err.stack);
        throw err; // Ném lỗi để route xử lý
    }
  }
}

module.exports = ingredientModel;
