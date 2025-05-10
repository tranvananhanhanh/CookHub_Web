const pool = require("../config/db"); // Sử dụng pool kết nối CSDL

class ingredientModel {



  /**
   * Lấy danh sách các nguyên liệu phổ biến (dùng nhiều nhất)
   * @returns {Promise<Array<object>>} - Mảng các object ingredient { id, name }
   */
  static async getCommonIngredients() { // Thêm tham số limit với giá trị mặc định
    console.log(`ingredientModel.getCommonIngredients called to fetch predefined list`);
    // Ví dụ: bạn muốn hiển thị các nguyên liệu có ID là 1 (Thịt bò), 5 (Cà rốt), 12 (Trứng gà)
    const predefinedIngredientIds = [1, 5, 11, 25, 54, 67, 80]; 
    if (!predefinedIngredientIds || predefinedIngredientIds.length === 0) {
      console.warn("No predefined ingredient IDs specified in ingredientModel. Returning empty array.");
      return []; // Trả về mảng rỗng nếu không có ID nào được định nghĩa
    }
    const placeholders = predefinedIngredientIds.map((_, index) => `$${index + 1}`).join(',');
    const query = `
       SELECT
           ingredient_id AS id,
           name
       FROM ingredients
       WHERE ingredient_id IN (${placeholders})
       ORDER BY name ASC; -- Sắp xếp theo tên cho dễ nhìn, hoặc bạn có thể bỏ ORDER BY nếu muốn giữ nguyên thứ tự trong mảng predefinedIngredientIds (cần query phức tạp hơn một chút)
    `;
    try {
        const result = await pool.query(query, predefinedIngredientIds); // Truyền limit vào query
        return result.rows; // Chỉ trả về dữ liệu
    } catch (err) {
        console.error('Error fetching common ingredients in ingredientModel:', err.stack);
        throw err; // Ném lỗi để route xử lý
    }
  }
}

module.exports = ingredientModel;
