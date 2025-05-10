// backend/models/reportModel.js
const pool = require('../config/db'); // Giả sử file kết nối DB của bạn là db.js trong thư mục config

class ReportModel {
    static async createRecipeReport(userId, recipeId, reason) {
        const query = `
            INSERT INTO reports (user_id, recipe_id, reason, report_status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING report_id, user_id, recipe_id, reason, report_status, created_at;
        `;
        const values = [userId, recipeId, reason];
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating recipe report in model:', error);
            throw error;
        }
    }

    // Bạn có thể thêm các phương thức khác ở đây (ví dụ: get all reports, update report status, etc.)
}

module.exports = ReportModel;