const express = require("express");
const router = express.Router();
const pool = require('../config/db');
const UserModel = require("../models/userModel");

router.get('/login-test/:userId',async (req, res) => {
    
    console.log('>>> Params received in /login-test/:userId:', req.params);
    if (!req.session){
        return res.status(500).json({ message: 'Lỗi: Session chưa được khởi tạo. Kiểm tra cấu hình express-session.' });
    }
    
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) { // Đảm bảo ID là số dương
        
        return res.status(400).json({ message: 'User ID không hợp lệ.' });
    }

    try {
        // 1. Truy vấn cơ sở dữ liệu để tìm người dùng theo user_id
        //    - Chỉ chọn những cột cần thiết cho session, TRÁNH LẤY password_hash
        const query = `
            SELECT user_id, name, email, avatar
            FROM users
            WHERE user_id = $1 AND is_banned = FALSE; -- Chỉ lấy user không bị ban
        `;
        const result = await pool.query(query, [userId]);

        // 2. Kiểm tra xem người dùng có tồn tại không
        if (result.rows.length === 0) {
            // Không tìm thấy user hoặc user bị ban
            return res.status(404).json({ message: `Không tìm thấy người dùng hợp lệ với ID ${userId}.` });
        }

         // 3. Lấy thông tin người dùng từ kết quả truy vấn
         const dbUser = result.rows[0];

          // 4. Tạo đối tượng người dùng cho session (chọn lọc các trường cần thiết)
        const sessionUser = {
            id: dbUser.user_id,       // Nhất quán dùng 'id' hoặc 'user_id' ở mọi nơi
            name: dbUser.name,
            email: dbUser.email,
            avatar: dbUser.avatar,
            // Thêm các trường khác bạn muốn có sẵn trong req.session.user nếu cần
        };

         // 5. Gán đối tượng người dùng thật vào req.session.user
         req.session.user = sessionUser;

         console.log(`Simulated login SUCCESS for user from DB:`, req.session.user); // Log để kiểm tra

        // 6. Chuyển hướng về trang chủ
        res.redirect('/homepage');

    } catch (error) {
        // Xử lý lỗi nếu có lỗi trong quá trình truy vấn DB
        console.error(`Lỗi khi truy vấn người dùng ID ${userId}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ khi tìm kiếm người dùng.' });
    }
});

router.get('/logout-test', (req, res) => {
    if (req.session) {
        // Hủy session
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi khi đăng xuất.' });
            }
            // Xóa cookie phía client (tùy chọn, thường session destroy là đủ)
            // res.clearCookie('connect.sid'); // Tên cookie mặc định của express-session
            console.log('User logged out (session destroyed).');
            res.redirect('/homepage'); // Chuyển hướng về trang chủ
        });
    } else {
        res.redirect('/homepage'); // Nếu không có session thì cứ về trang chủ
    }
});

module.exports = router;