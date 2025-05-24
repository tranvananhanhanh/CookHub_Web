const pool = require('../config/db'); // Điều chỉnh đường dẫn để trỏ đến db.js
const crypto = require('crypto'); // Sử dụng module crypto để sinh mã ngẫu nhiên mạnh hơn

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
            throw new Error('Email does not exist');
        }

        // Kiểm tra mật khẩu thẳng (plain-text)
        if (user.password_hash === password_hash) {
            // QUAN TRỌNG: Trả về đầy đủ thông tin user bao gồm random_code
            // để có thể sử dụng ở client nếu cần (ví dụ: cho URL profile)
            return { ...user, isAdmin: false }; // Thêm thuộc tính isAdmin
        } else {
            throw new Error('Wrong password');
        }
    } catch (error) {
        throw error; // Lỗi trong quá trình đăng nhập
    }
}

// Hàm sinh mã ngẫu nhiên
function generateRandomCode(length = 16) { // Tăng độ dài để giảm xác suất trùng lặp
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') // Chuyển thành chuỗi hex
        .slice(0, length); // Cắt theo độ dài mong muốn
}

// Hàm kiểm tra random_code có tồn tại không
async function isRandomCodeUnique(randomCode) {
    const result = await pool.query('SELECT 1 FROM users WHERE random_code = $1', [randomCode]);
    return result.rows.length === 0; // Trả về true nếu không tìm thấy (duy nhất)
}

const registerUser = async (name, email, gender, age, password) => {
    try {
        // Kiểm tra xem name đã tồn tại chưa
        const nameCheck = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
        if (nameCheck.rows.length > 0) {
            throw new Error('Username already exists'); // Sửa lỗi chính tả: 'name' -> 'Username'
        }

        // Kiểm tra xem email đã tồn tại chưa
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            throw new Error('Email already exists');
        }

        // Sinh random_code duy nhất
        let randomCode;
        let isUnique = false;
        let attempts = 0; // Giới hạn số lần thử để tránh vòng lặp vô hạn
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            randomCode = generateRandomCode();
            isUnique = await isRandomCodeUnique(randomCode);
            attempts++;
        }

        if (!isUnique) {
            // Nếu sau nhiều lần thử vẫn không tạo được mã duy nhất, có thể có vấn đề
            // hoặc DB quá đầy (rất hiếm với mã dài).
            console.error("Failed to generate a unique random_code after multiple attempts.");
            throw new Error('Failed to generate a unique identifier. Please try again.');
        }

        // Lưu mật khẩu dạng plain text (không mã hóa) và thêm random_code
        const result = await pool.query(
            'INSERT INTO users (name, email, gender, age, password_hash, random_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, name, email, random_code', // Thêm random_code vào RETURNING
            [name, email, gender, age, password, randomCode]
        );

        return result.rows[0]; // Trả về thông tin người dùng vừa tạo
    } catch (error) {
        // Ghi log lỗi phía server để dễ debug hơn
        console.error("Error during registration:", error.message);
        // Ném lỗi với message gốc để client có thể hiển thị
        throw new Error(error.message);
    }
};

module.exports = { loginUser, registerUser };