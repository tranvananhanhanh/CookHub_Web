const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");

// Lấy thông tin user (trả về JSON)
router.get("/", async (req, res) => {
  try {
    const userInfo = await UserModel.getUserInfo();
    res.json(userInfo); 
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
});

module.exports = router;