const express = require('express');
const router = express.Router();
const path = require('path');

// route này trả về trang chủ khi người dùng đã login vào 
// route này là kq trả về ki người dùng ấn vào view recipe sau khi tính BMI 
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'pages', 'home.html'));
});