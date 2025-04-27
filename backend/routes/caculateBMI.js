const express = require('express');
const router = express.Router();
const path = require('path')


// route này trả về khi người dùng ấn vào BMI trên menu header

// Route GET trả về file HTML
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'pages', 'bmi', 'inputBMI.html'));
});

// Route hiển thị trang kết quả BMI
router.get("/result", (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'pages', 'bmi','bmi.html'));
  });
  
router.get("/heathyfood",(req,res)=>{
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'pages', 'bmi','recipeBMI.html'));

});
module.exports = router;
