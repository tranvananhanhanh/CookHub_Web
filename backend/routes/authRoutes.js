const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../models/auth');

// Route xử lý đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await loginUser(email, password);
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

module.exports = router;


// route xu ly dang ky 
router.post('/register', async (req, res) => {
    const { name, email, gender, age, password } = req.body;

    // Kiểm tra xem tất cả các trường có được cung cấp không
    if (!name || !email || !gender || !age || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Kiểm tra định dạng email (cơ bản)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Kiểm tra độ tuổi (phải là số nguyên dương)
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0) {
        return res.status(400).json({ message: 'Age must be a positive number' });
    }

    try {
        const newUser = await registerUser(name, email, gender, parsedAge, password);
        res.status(201).json({ message: 'Registration successful', user: newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;