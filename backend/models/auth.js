const pool = require('../config/db'); // Điều chỉnh đường dẫn để trỏ đến db.js

async function loginUser(email, password_hash) {
    try {
        // Kiểm tra tài khoản admin cứng
        if (email === 'cookhubadmin@gmail.com' && password_hash === 'admin123') {
            return {
                email: 'cookhubadmin@gmail.com',
                isAdmin: true
            };
        }

        // Logic cho người dùng thông thường
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            throw new Error('Email không tồn tại');
        }

        // Kiểm tra mật khẩu thẳng (plain-text)
        if (user.password_hash === password_hash) {
            return { ...user, isAdmin: false }; // Thêm thuộc tính isAdmin
        } else {
            throw new Error('Sai mật khẩu');
        }
    } catch (error) {
        throw error; // Lỗi trong quá trình đăng nhập
    }
}



const registerUser = async (name, email, gender, age, password) => {
    try {
        

        // Kiểm tra xem name đã tồn tại chưa
        const nameCheck = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
        if (nameCheck.rows.length > 0) {
            throw new Error('name already exists');
        }

        // Kiểm tra xem email đã tồn tại chưa
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            throw new Error('Email already exists');
        }

        // Lưu mật khẩu dạng plain text (không mã hóa)
        const result = await pool.query(
            'INSERT INTO users (name, email, gender, age, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email',
            [name, email, gender, age, password]
        );

        return result.rows[0]; // Trả về thông tin người dùng vừa tạo
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { loginUser, registerUser };