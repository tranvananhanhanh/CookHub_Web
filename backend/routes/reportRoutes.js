// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const ReportModel = require('../models/reportModel'); // <<< Trực tiếp import Model

// Bạn có thể thêm middleware xác thực người dùng ở đây nếu cần
// const authMiddleware = require('../middlewares/authMiddleware'); // Ví dụ

// Route để báo cáo một công thức
// POST /reports/recipe
router.post('/recipe', async (req, res) => { // <<< Logic xử lý request nằm đây
    const { user_id, recipe_id, reason } = req.body;

    // --- START: Logic từ Controller được chuyển vào đây ---
    if (!user_id || !recipe_id || !reason) {
        return res.status(400).json({ message: 'User ID, Recipe ID, and Reason are required.' });
    }

    // Validate inputs
    if (typeof reason !== 'string' || reason.trim().length === 0) {
        return res.status(400).json({ message: 'Reason must be a non-empty string.' });
    }
    if (isNaN(parseInt(user_id)) || isNaN(parseInt(recipe_id))) {
        return res.status(400).json({ message: 'User ID and Recipe ID must be numbers.' });
    }
    // --- END: Logic từ Controller được chuyển vào đây ---

    try {
        // Gọi trực tiếp Model
        const report = await ReportModel.createRecipeReport(parseInt(user_id), parseInt(recipe_id), reason.trim());
        res.status(201).json({ message: 'Recipe reported successfully', report });
    } catch (error) {
        console.error('Error in POST /reports/recipe route:', error);
        // Kiểm tra lỗi ràng buộc khóa ngoại (ví dụ: user_id hoặc recipe_id không tồn tại)
        if (error.code === '23503') { // Mã lỗi của PostgreSQL cho foreign key violation
             return res.status(404).json({ message: 'User or Recipe not found.' });
        }
        res.status(500).json({ message: 'Failed to report recipe. Please try again later.' });
    }
});

// Bạn có thể thêm các routes khác liên quan đến report ở đây

module.exports = router;